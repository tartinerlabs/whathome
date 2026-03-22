import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  developerSales,
  pipelineProjects,
  projects,
  researchRuns,
  transactions,
} from "@/db/schema";
import { getPlanningArea } from "@/lib/clients/onemap";
import type { TransactionBatch, UraTransaction } from "@/lib/clients/ura";
import * as ura from "@/lib/clients/ura";
import { svy21ToWgs84 } from "@/lib/geo";
import { findOrCreateProject } from "@/lib/queries/projects";

// --- Step functions (full Node.js access, retryable) ---

async function stepFetchUraToken(): Promise<string> {
  "use step";
  console.log("[ingestion] Fetching URA token");
  const token = await ura.fetchToken();
  console.log("[ingestion] URA token acquired");
  return token;
}

interface BatchResult {
  inserted: number;
  skipped: number;
}

async function stepFetchTransactionBatch(
  batch: TransactionBatch,
): Promise<BatchResult> {
  "use step";

  console.log(`[ingestion] Fetching transaction batch ${batch}`);
  const rawTxns = await ura.getTransactions(batch);
  if (!rawTxns.length) {
    console.log(`[ingestion] Batch ${batch}: 0 transactions`);
    return { inserted: 0, skipped: 0 };
  }

  let inserted = 0;
  let skipped = 0;

  // Process in chunks of 500
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

  console.log(
    `[ingestion] Batch ${batch}: ${inserted} inserted, ${skipped} skipped`,
  );
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

  console.log("[ingestion] Detecting new projects from unmatched transactions");
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

  console.log(`[ingestion] Detected ${newProjects.length} new projects`);
  return newProjects;
}

async function stepEnrichPlanningArea(
  slug: string,
  lat: number,
  lng: number,
): Promise<void> {
  "use step";

  console.log(`[ingestion] Enriching planning area for ${slug}`);
  const planningArea = await getPlanningArea(lat, lng);
  if (planningArea) {
    await db
      .update(projects)
      .set({ planningArea })
      .where(eq(projects.slug, slug));
  }
}

async function stepFetchDeveloperSales(): Promise<number> {
  "use step";

  console.log("[ingestion] Fetching developer sales");
  // Current month in mmyy format
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(2);
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
      await db
        .update(projects)
        .set({
          unitsSold: sale.soldToDate,
          totalUnits: sale.unitsAvail
            ? (sale.soldToDate ?? 0) + sale.unitsAvail
            : undefined,
        })
        .where(eq(projects.id, project.id));
    }
  }

  console.log(`[ingestion] Developer sales: ${upserted} upserted`);
  return upserted;
}

async function stepFetchPipeline(): Promise<{
  upserted: number;
  newProjects: number;
}> {
  "use step";

  console.log("[ingestion] Fetching pipeline data");
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
  const existingNameSet = new Set(existingNames.map((p) => p.name));

  const uniquePipelineNames = [...new Set(pipeline.map((p) => p.project))];

  for (const name of uniquePipelineNames) {
    if (existingNameSet.has(name)) continue;

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

    // Update TOP year on the newly created project
    if (pipelineEntry.expectedTOPYear) {
      await db
        .update(projects)
        .set({ topDate: `${pipelineEntry.expectedTOPYear}-01-01` })
        .where(eq(projects.name, name));
    }

    newProjectCount++;
  }

  console.log(
    `[ingestion] Pipeline: ${upserted} upserted, ${newProjectCount} new projects`,
  );
  return { upserted, newProjects: newProjectCount };
}

interface IngestionSummary {
  transactionsInserted: number;
  transactionsSkipped: number;
  newProjectsFromTxns: number;
  developerSalesUpserted: number;
  pipelineUpserted: number;
  pipelineNewProjects: number;
  durationMs: number;
}

async function stepLogRun(summary: IngestionSummary): Promise<void> {
  "use step";

  console.log("[ingestion] Logging successful run", summary);
  await db.insert(researchRuns).values({
    agentType: "data_ingestion",
    status: "completed",
    outputSummary: JSON.stringify(summary),
    startedAt: new Date(Date.now() - summary.durationMs),
    completedAt: new Date(),
  });
}

// --- Workflow orchestrator (runs in sandbox, coordinates steps) ---

export async function dataIngestionWorkflow() {
  "use workflow";

  const startTime = Date.now();

  // Step 1: Get URA auth token
  await stepFetchUraToken();

  // Step 2: Fetch all 4 transaction batches
  const batch1 = await stepFetchTransactionBatch(1);
  const batch2 = await stepFetchTransactionBatch(2);
  const batch3 = await stepFetchTransactionBatch(3);
  const batch4 = await stepFetchTransactionBatch(4);

  const totalInserted =
    batch1.inserted + batch2.inserted + batch3.inserted + batch4.inserted;
  const totalSkipped =
    batch1.skipped + batch2.skipped + batch3.skipped + batch4.skipped;

  // Step 3: Detect and create new projects from unmatched transactions
  const newProjects = await stepDetectNewProjects();

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

  // Step 5: Fetch developer sales for current month
  const developerSalesCount = await stepFetchDeveloperSales();

  // Step 6: Fetch pipeline data
  const pipelineResult = await stepFetchPipeline();

  // Step 7: Log the run
  const durationMs = Date.now() - startTime;
  await stepLogRun({
    transactionsInserted: totalInserted,
    transactionsSkipped: totalSkipped,
    newProjectsFromTxns: newProjects.length,
    developerSalesUpserted: developerSalesCount,
    pipelineUpserted: pipelineResult.upserted,
    pipelineNewProjects: pipelineResult.newProjects,
    durationMs,
  });

  return {
    transactionsInserted: totalInserted,
    transactionsSkipped: totalSkipped,
    newProjects: newProjects.length,
    developerSalesUpserted: developerSalesCount,
    pipelineUpserted: pipelineResult.upserted,
    pipelineNewProjects: pipelineResult.newProjects,
  };
}
