import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/db";
import {
  developerSales,
  developers,
  medianRentals,
  pipelineProjects,
  projects,
  projectUnits,
  rentalContracts,
  transactions,
} from "@/db/schema";
import { inferBedroomType, type UnitType } from "@/lib/bedroom/inference";
import {
  developerSlug,
  normaliseDeveloperName,
} from "@/lib/developers/normalize";
import { svy21ToWgs84 } from "@/lib/geo";
import { getPlanningArea } from "@/lib/providers/onemap";
import type { TransactionBatch, UraTransaction } from "@/lib/providers/ura";
import * as ura from "@/lib/providers/ura";
import { findOrCreateProject } from "@/lib/queries/projects";

// --- Step functions (full Node.js access, retryable) ---

async function stepFetchUraToken(): Promise<string> {
  "use step";
  return ura.fetchToken();
}

interface BatchResult {
  inserted: number;
  skipped: number;
}

async function stepFetchTransactionBatch(
  batch: TransactionBatch,
): Promise<BatchResult> {
  "use step";

  const rawTxns = await ura.getTransactions(batch);
  if (!rawTxns.length) return { inserted: 0, skipped: 0 };

  let inserted = 0;
  let skipped = 0;

  const CHUNK_SIZE = 500;
  for (let i = 0; i < rawTxns.length; i += CHUNK_SIZE) {
    const chunk = rawTxns.slice(i, i + CHUNK_SIZE);
    const rows = chunk.map((txn) => transformTransaction(txn));

    const result = await db
      .insert(transactions)
      .values(rows)
      .onConflictDoNothing({ target: transactions.sourceRecordId });

    inserted += result.rowCount ?? 0;
    skipped += rows.length - (result.rowCount ?? 0);
  }

  return { inserted, skipped };
}

function transformTransaction(txn: UraTransaction) {
  const saleTypeMap: Record<string, "new_sale" | "sub_sale" | "resale"> = {
    "1": "new_sale",
    "2": "sub_sale",
    "3": "resale",
  };

  const propertyTypeMap: Record<
    string,
    "condo" | "apt" | "ec" | "strata_landed"
  > = {
    Condominium: "condo",
    Apartment: "apt",
    "Executive Condominium": "ec",
    "Strata Semidetached": "strata_landed",
    "Strata Detached": "strata_landed",
    "Strata Terrace": "strata_landed",
  };

  const typeOfAreaMap: Record<string, "strata" | "land" | "unknown"> = {
    Strata: "strata",
    Land: "land",
  };

  const areaSqm = txn.area ? Number.parseFloat(txn.area) : null;
  const areaSqft = areaSqm ? areaSqm * 10.7639 : null;
  const price = txn.price ? Number.parseInt(txn.price, 10) : null;
  const pricePsf = price && areaSqft ? price / areaSqft : null;

  // contractDate from URA is mmyy format
  const contractDate = txn.contractDate
    ? `20${txn.contractDate.slice(2)}-${txn.contractDate.slice(0, 2)}-01`
    : null;

  // Composite source record ID for deduplication
  const sourceRecordId = [
    txn.project,
    txn.district,
    txn.contractDate,
    txn.price,
    txn.area,
    txn.floorRange,
  ].join(":");

  return {
    projectName: txn.project,
    address: txn.street,
    floorRange: txn.floorRange,
    areaSqm: areaSqm ? String(areaSqm) : null,
    areaSqft: areaSqft ? String(areaSqft.toFixed(2)) : null,
    transactedPrice: price,
    nettPrice: txn.nettPrice ? Number.parseInt(txn.nettPrice, 10) : null,
    pricePsf: pricePsf ? String(pricePsf.toFixed(2)) : null,
    contractDate,
    saleType: saleTypeMap[txn.typeOfSale] ?? null,
    propertyType: propertyTypeMap[txn.propertyType] ?? null,
    typeOfArea: typeOfAreaMap[txn.typeOfArea] ?? ("unknown" as const),
    noOfUnits: txn.noOfUnits ? Number.parseInt(txn.noOfUnits, 10) : null,
    district: txn.district ? Number.parseInt(txn.district, 10) : null,
    tenure: txn.tenure ?? null,
    marketSegment: txn.marketSegment ?? null,
    svyX: txn.x || null,
    svyY: txn.y || null,
    sourceDataset: "ura_transactions",
    sourceRecordId,
  };
}

interface NewProject {
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
}

async function stepDetectNewProjects(): Promise<NewProject[]> {
  "use step";

  // Find distinct project names in transactions that have no matching projects record
  const unmatched = await db
    .selectDistinct({ projectName: transactions.projectName })
    .from(transactions)
    .where(isNull(transactions.projectId));

  if (!unmatched.length) return [];

  const newProjects: NewProject[] = [];

  for (const { projectName } of unmatched) {
    // Get a sample transaction for this project to extract metadata
    const [sample] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.projectName, projectName))
      .limit(1);

    if (!sample) continue;

    const svyX = sample.svyX ? Number.parseFloat(sample.svyX) : null;
    const svyY = sample.svyY ? Number.parseFloat(sample.svyY) : null;

    const result = await findOrCreateProject({
      name: projectName,
      district: sample.district ?? 0,
      marketSegment: null,
      svyX,
      svyY,
      tenureString: sample.tenure,
    });

    if (result.isNew) {
      let latitude: number | null = null;
      let longitude: number | null = null;
      if (svyX && svyY) {
        const coords = svy21ToWgs84(svyX, svyY);
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
      newProjects.push({
        name: projectName,
        slug: result.slug,
        latitude,
        longitude,
      });
    }

    // Link unmatched transactions to the project
    await db
      .update(transactions)
      .set({ projectId: result.id })
      .where(
        and(
          eq(transactions.projectName, projectName),
          isNull(transactions.projectId),
        ),
      );
  }

  return newProjects;
}

async function stepFixCoordinates(): Promise<number> {
  "use step";

  // Find projects with SVY21 data but bad latitude (near 0 instead of ~1.3)
  const badCoords = await db
    .select({
      id: projects.id,
      svyX: projects.svyX,
      svyY: projects.svyY,
    })
    .from(projects)
    .where(
      and(
        sql`${projects.svyX} IS NOT NULL`,
        sql`${projects.svyY} IS NOT NULL`,
        sql`CAST(${projects.latitude} AS float) < 0.5`,
      ),
    );

  if (!badCoords.length) return 0;

  let fixed = 0;
  for (const row of badCoords) {
    const svyX = Number.parseFloat(row.svyX!);
    const svyY = Number.parseFloat(row.svyY!);
    if (!svyX || !svyY) continue;

    const coords = svy21ToWgs84(svyX, svyY);
    await db
      .update(projects)
      .set({
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
      })
      .where(eq(projects.id, row.id));
    fixed++;
  }

  return fixed;
}

async function stepEnrichPlanningArea(
  slug: string,
  lat: number,
  lng: number,
): Promise<void> {
  "use step";

  const planningArea = await getPlanningArea(lat, lng);
  if (planningArea) {
    await db
      .update(projects)
      .set({ planningArea })
      .where(eq(projects.slug, slug));
  }
}

async function findOrCreateDeveloper(rawSpvName: string): Promise<string> {
  const brandName = normaliseDeveloperName(rawSpvName);
  const slug = developerSlug(brandName);

  const [existing] = await db
    .select({ id: developers.id })
    .from(developers)
    .where(eq(developers.slug, slug))
    .limit(1);

  if (existing) return existing.id;

  const [inserted] = await db
    .insert(developers)
    .values({ name: brandName, slug })
    .returning({ id: developers.id });

  return inserted.id;
}

async function stepFetchDeveloperSales(): Promise<number> {
  "use step";

  // Previous month in mmyy format (current month data often not published yet)
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mm = String(prev.getMonth() + 1).padStart(2, "0");
  const yy = String(prev.getFullYear()).slice(2);
  const refPeriod = `${mm}${yy}`;

  const sales = await ura.getDeveloperSales(refPeriod);
  if (!sales.length) return 0;

  let upserted = 0;

  const CHUNK_SIZE = 500;
  for (let i = 0; i < sales.length; i += CHUNK_SIZE) {
    const chunk = sales.slice(i, i + CHUNK_SIZE);
    const rows = chunk.map((s) => ({
      projectName: s.project,
      street: s.street,
      developer: s.developer,
      marketSegment: s.marketSegment,
      district: s.district ? Number.parseInt(s.district, 10) : null,
      refPeriod: s.refPeriod,
      medianPrice: s.medianPrice || null,
      lowestPrice: s.lowestPrice || null,
      highestPrice: s.highestPrice || null,
      unitsAvail: s.unitsAvail ? Number.parseInt(s.unitsAvail, 10) : null,
      launchedToDate: s.launchedToDate
        ? Number.parseInt(s.launchedToDate, 10)
        : null,
      soldToDate: s.soldToDate ? Number.parseInt(s.soldToDate, 10) : null,
      launchedInMonth: s.launchedInMonth
        ? Number.parseInt(s.launchedInMonth, 10)
        : null,
      soldInMonth: s.soldInMonth ? Number.parseInt(s.soldInMonth, 10) : null,
      svyX: s.x || null,
      svyY: s.y || null,
    }));

    const result = await db
      .insert(developerSales)
      .values(rows)
      .onConflictDoNothing();

    upserted += result.rowCount ?? 0;
  }

  // Update projects.unitsSold and totalUnits from developer sales
  const latestSales = await db
    .selectDistinct({ projectName: developerSales.projectName })
    .from(developerSales)
    .where(eq(developerSales.refPeriod, refPeriod));

  for (const { projectName } of latestSales) {
    const [sale] = await db
      .select()
      .from(developerSales)
      .where(
        and(
          eq(developerSales.projectName, projectName),
          eq(developerSales.refPeriod, refPeriod),
        ),
      )
      .limit(1);

    if (!sale) continue;

    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.name, projectName))
      .limit(1);

    if (project && (sale.soldToDate || sale.unitsAvail)) {
      const updates: Record<string, unknown> = {
        unitsSold: sale.soldToDate,
        totalUnits: sale.unitsAvail
          ? (sale.soldToDate ?? 0) + sale.unitsAvail
          : undefined,
      };

      // Link developer if not already set
      if (sale.developer) {
        const developerId = await findOrCreateDeveloper(sale.developer);
        if (developerId) updates.developerId = developerId;
      }

      await db.update(projects).set(updates).where(eq(projects.id, project.id));
    }
  }

  return upserted;
}

async function stepFetchPipeline(): Promise<{
  upserted: number;
  newProjects: number;
}> {
  "use step";

  const pipeline = await ura.getPipeline();
  if (!pipeline.length) return { upserted: 0, newProjects: 0 };

  // Current quarter snapshot label
  const now = new Date();
  const quarter = `${now.getFullYear()}Q${Math.ceil((now.getMonth() + 1) / 3)}`;

  let upserted = 0;
  let newProjectCount = 0;

  const CHUNK_SIZE = 500;
  for (let i = 0; i < pipeline.length; i += CHUNK_SIZE) {
    const chunk = pipeline.slice(i, i + CHUNK_SIZE);
    const rows = chunk.map((p) => ({
      projectName: p.project,
      street: p.street,
      district: p.district ? Number.parseInt(p.district, 10) : null,
      developerName: p.developerName,
      totalUnits: p.totalUnits ? Number.parseInt(p.totalUnits, 10) : null,
      noOfCondo: p.noOfCondo ? Number.parseInt(p.noOfCondo, 10) : null,
      noOfApartment: p.noOfApartment
        ? Number.parseInt(p.noOfApartment, 10)
        : null,
      noOfDetachedHouse: p.noOfDetachedHouse
        ? Number.parseInt(p.noOfDetachedHouse, 10)
        : null,
      noOfSemiDetached: p.noOfSemiDetached
        ? Number.parseInt(p.noOfSemiDetached, 10)
        : null,
      noOfTerrace: p.noOfTerrace ? Number.parseInt(p.noOfTerrace, 10) : null,
      expectedTopYear: p.expectedTOPYear,
      snapshotQuarter: quarter,
    }));

    const result = await db
      .insert(pipelineProjects)
      .values(rows)
      .onConflictDoNothing();

    upserted += result.rowCount ?? 0;
  }

  // Create project stubs for pipeline entries not yet in projects table
  const existingNames = await db.select({ name: projects.name }).from(projects);
  const existingNameSet = new Set(
    existingNames.map((project) => project.name.toUpperCase()),
  );

  const uniquePipelineNames = [...new Set(pipeline.map((p) => p.project))];

  for (const name of uniquePipelineNames) {
    if (existingNameSet.has(name.toUpperCase())) continue;

    const pipelineEntry = pipeline.find((p) => p.project === name);
    if (!pipelineEntry) continue;

    const district = pipelineEntry.district
      ? Number.parseInt(pipelineEntry.district, 10)
      : 0;

    await findOrCreateProject({
      name,
      district,
      marketSegment: null,
      svyX: null,
      svyY: null,
    });

    // Update TOP year and link developer on the newly created project
    const topYear = pipelineEntry.expectedTOPYear;
    const pipelineUpdates: Record<string, unknown> = {};

    if (topYear && /^\d{4}$/.test(topYear)) {
      pipelineUpdates.topDate = `${topYear}-01-01`;
    }

    if (pipelineEntry.developerName) {
      const developerId = await findOrCreateDeveloper(
        pipelineEntry.developerName,
      );
      pipelineUpdates.developerId = developerId;
    }

    if (Object.keys(pipelineUpdates).length) {
      await db
        .update(projects)
        .set(pipelineUpdates)
        .where(eq(projects.name, name));
    }

    newProjectCount++;
  }

  return { upserted, newProjects: newProjectCount };
}

async function stepFetchRentalContracts(): Promise<number> {
  "use step";

  // URA rental contracts use yyqq format (e.g. 26q1)
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const yy = String(prev.getFullYear()).slice(2);
  const quarter = Math.ceil((prev.getMonth() + 1) / 3);
  const refPeriod = `${yy}q${quarter}`;

  const contracts = await ura.getRentalContracts(refPeriod);
  if (!contracts.length) return 0;

  let inserted = 0;

  const CHUNK_SIZE = 100;
  for (let i = 0; i < contracts.length; i += CHUNK_SIZE) {
    const chunk = contracts.slice(i, i + CHUNK_SIZE);
    const rows = chunk.map((contract) => {
      const sourceRecordId = [
        contract.project,
        contract.district,
        contract.leaseDate,
        contract.rent,
        contract.areaSqft,
        contract.noOfBedRoom,
      ].join(":");

      return {
        projectName: contract.project,
        street: contract.street,
        propertyType: contract.propertyType,
        district: contract.district
          ? Number.parseInt(contract.district, 10)
          : null,
        noOfBedRoom: contract.noOfBedRoom,
        rent: contract.rent ? Number.parseInt(contract.rent, 10) : null,
        areaSqft: contract.areaSqft || null,
        areaSqm: contract.areaSqm || null,
        // leaseDate from URA is mmyy format → convert to yyyy-mm-01
        leaseDate: contract.leaseDate
          ? `20${contract.leaseDate.slice(2)}-${contract.leaseDate.slice(0, 2)}-01`
          : null,
        sourceRecordId,
      };
    });

    const result = await db
      .insert(rentalContracts)
      .values(rows)
      .onConflictDoNothing({ target: rentalContracts.sourceRecordId });

    inserted += result.rowCount ?? 0;
  }

  return inserted;
}

async function stepFetchMedianRentals(): Promise<number> {
  "use step";

  const rentals = await ura.getMedianRentals();
  if (!rentals.length) return 0;

  // Deduplicate by (projectName, refPeriod) — PostgreSQL rejects
  // ON CONFLICT DO UPDATE when the same row is affected twice in one INSERT
  const deduped = new Map<
    string,
    {
      projectName: string;
      street: string | null;
      district: number | null;
      refPeriod: string;
      median: string | null;
      psf25: string | null;
      psf75: string | null;
    }
  >();
  for (const rental of rentals) {
    const key = `${rental.project}::${rental.refPeriod}`;
    deduped.set(key, {
      projectName: rental.project,
      street: rental.street,
      district: rental.district ? Number.parseInt(rental.district, 10) : null,
      refPeriod: rental.refPeriod,
      median: rental.median || null,
      psf25: rental.psf25 || null,
      psf75: rental.psf75 || null,
    });
  }

  const allRows = [...deduped.values()];
  let upserted = 0;

  const CHUNK_SIZE = 500;
  for (let i = 0; i < allRows.length; i += CHUNK_SIZE) {
    const rows = allRows.slice(i, i + CHUNK_SIZE);

    const result = await db
      .insert(medianRentals)
      .values(rows)
      .onConflictDoUpdate({
        target: [medianRentals.projectName, medianRentals.refPeriod],
        set: {
          median: sql`excluded.median`,
          psf25: sql`excluded.psf25`,
          psf75: sql`excluded.psf75`,
        },
      });

    upserted += result.rowCount ?? 0;
  }

  return upserted;
}

interface IngestionSummary {
  transactionsInserted: number;
  transactionsSkipped: number;
  newProjectsFromTxns: number;
  developerSalesUpserted: number;
  pipelineUpserted: number;
  pipelineNewProjects: number;
  rentalContractsInserted: number;
  medianRentalsUpserted: number;
  bedroomInferredCount: number;
  durationMs: number;
}

async function stepLogRun(summary: IngestionSummary): Promise<void> {
  "use step";

  console.log("[ingestion] Run complete", summary);
}

// TODO: Optimise — still updates one row at a time; batch UPDATE with CASE or temp table
async function stepInferBedroomTypes(): Promise<number> {
  "use step";
  console.log("[stepInferBedroomTypes] START");

  // Load all project units for curated ranges
  const unitsData = await db
    .select({
      projectId: projectUnits.projectId,
      unitType: projectUnits.unitType,
      sizeSqftMin: projectUnits.sizeSqftMin,
      sizeSqftMax: projectUnits.sizeSqftMax,
    })
    .from(projectUnits);

  const curatedRangesMap = new Map<
    string,
    Array<{ unitType: UnitType; sizeSqftMin: number; sizeSqftMax: number }>
  >();
  for (const unit of unitsData) {
    if (!curatedRangesMap.has(unit.projectId)) {
      curatedRangesMap.set(unit.projectId, []);
    }
    if (!unit.unitType || !unit.sizeSqftMin || !unit.sizeSqftMax) continue;
    curatedRangesMap.get(unit.projectId)?.push({
      unitType: unit.unitType as UnitType,
      sizeSqftMin: unit.sizeSqftMin,
      sizeSqftMax: unit.sizeSqftMax,
    });
  }

  // Derive earliest new_sale contract date per project for GFA harmonisation check
  const earliestSales = await db
    .select({
      projectId: transactions.projectId,
      contractDate: sql<string>`min(${transactions.contractDate})`,
    })
    .from(transactions)
    .where(eq(transactions.saleType, "new_sale"))
    .groupBy(transactions.projectId);

  const contractDatesMap = new Map<string, string | null>();
  for (const row of earliestSales) {
    if (row.projectId) {
      contractDatesMap.set(row.projectId, row.contractDate);
    }
  }

  const harmonisationCutoff = new Date("2023-06-01");
  let updated = 0;
  const offset = 0;
  const BATCH_SIZE = 2000;

  // Process in batches to avoid loading all transactions into memory
  while (true) {
    const txns = await db
      .select({
        id: transactions.id,
        projectId: transactions.projectId,
        areaSqft: transactions.areaSqft,
      })
      .from(transactions)
      .where(isNull(transactions.inferredBedroomType))
      .limit(BATCH_SIZE)
      .offset(offset);

    if (!txns.length) break;

    console.log(
      `[stepInferBedroomTypes] Processing batch at offset ${offset} (${txns.length} rows)`,
    );

    const updates: Array<{
      id: string;
      inferredBedroomType: ReturnType<typeof inferBedroomType>;
      isPostHarmonisation: boolean | null;
    }> = [];

    for (const txn of txns) {
      if (!txn.areaSqft || !txn.projectId) continue;

      const areaSqft = Number(txn.areaSqft);
      const contractDateStr = contractDatesMap.get(txn.projectId);
      const isPostHarmonisation = contractDateStr
        ? new Date(contractDateStr) >= harmonisationCutoff
        : null;

      const curatedRanges = curatedRangesMap.get(txn.projectId);
      updates.push({
        id: txn.id,
        inferredBedroomType: inferBedroomType(
          areaSqft,
          isPostHarmonisation ?? false,
          curatedRanges,
        ),
        isPostHarmonisation,
      });
    }

    // Batch update in a single transaction per chunk
    const CHUNK = 200;
    for (let i = 0; i < updates.length; i += CHUNK) {
      const chunk = updates.slice(i, i + CHUNK);
      await db.transaction(async (tx) => {
        for (const u of chunk) {
          await tx
            .update(transactions)
            .set({
              inferredBedroomType: u.inferredBedroomType,
              isPostHarmonisation: u.isPostHarmonisation,
            })
            .where(eq(transactions.id, u.id));
        }
      });
    }

    updated += updates.length;

    // Since we're updating rows that match the WHERE clause,
    // processed rows won't appear again — no need to increment offset
    if (txns.length < BATCH_SIZE) break;
  }

  console.log(`[stepInferBedroomTypes] DONE updated=${updated}`);
  return updated;
}

// --- Workflow orchestrator (runs in sandbox, coordinates steps) ---

export async function dataIngestionWorkflow() {
  "use workflow";

  const startTime = Date.now();

  // Step 1: Get URA auth token
  await stepFetchUraToken();

  // Step 2: Fetch all 4 transaction batches in parallel
  const [batch1, batch2, batch3, batch4] = await Promise.all([
    stepFetchTransactionBatch(1),
    stepFetchTransactionBatch(2),
    stepFetchTransactionBatch(3),
    stepFetchTransactionBatch(4),
  ]);

  const totalInserted =
    batch1.inserted + batch2.inserted + batch3.inserted + batch4.inserted;
  const totalSkipped =
    batch1.skipped + batch2.skipped + batch3.skipped + batch4.skipped;

  // Step 3: Detect and create new projects from unmatched transactions
  const newProjects = await stepDetectNewProjects();

  // Step 3b: Fix any bad SVY21→WGS84 coordinates from earlier runs
  await stepFixCoordinates();

  // Step 4: Enrich new projects with planning area from OneMap
  for (const project of newProjects) {
    if (project.latitude && project.longitude) {
      await stepEnrichPlanningArea(
        project.slug,
        project.latitude,
        project.longitude,
      );
    }
  }

  // Step 5: Fetch developer sales for previous month
  const developerSalesCount = await stepFetchDeveloperSales();

  // Step 6: Fetch pipeline data
  const pipelineResult = await stepFetchPipeline();

  // Step 7: Fetch rental contracts for previous quarter
  const rentalContractsCount = await stepFetchRentalContracts();

  // Step 8: Fetch median rentals
  const medianRentalsCount = await stepFetchMedianRentals();

  // Step 9: Infer bedroom types for newly inserted transactions
  const bedroomInferredCount = await stepInferBedroomTypes();

  // Cache invalidation — targeted by what changed
  revalidateTag("transactions", "max");
  revalidateTag("bedrooms:analytics", "max");

  if (newProjects.length > 0 || pipelineResult.newProjects > 0) {
    revalidateTag("projects", "max");
    revalidateTag("districts", "max");
    revalidateTag("search", "max");
    revalidateTag("developers", "max");
  }

  if (rentalContractsCount > 0 || medianRentalsCount > 0) {
    revalidateTag("rentals", "max");
  }

  // Step 10: Log the run
  const durationMs = Date.now() - startTime;
  await stepLogRun({
    transactionsInserted: totalInserted,
    transactionsSkipped: totalSkipped,
    newProjectsFromTxns: newProjects.length,
    developerSalesUpserted: developerSalesCount,
    pipelineUpserted: pipelineResult.upserted,
    pipelineNewProjects: pipelineResult.newProjects,
    rentalContractsInserted: rentalContractsCount,
    medianRentalsUpserted: medianRentalsCount,
    bedroomInferredCount,
    durationMs,
  });

  return {
    transactionsInserted: totalInserted,
    transactionsSkipped: totalSkipped,
    newProjects: newProjects.length,
    developerSalesUpserted: developerSalesCount,
    pipelineUpserted: pipelineResult.upserted,
    pipelineNewProjects: pipelineResult.newProjects,
    rentalContractsInserted: rentalContractsCount,
    medianRentalsUpserted: medianRentalsCount,
    bedroomInferredCount,
  };
}
