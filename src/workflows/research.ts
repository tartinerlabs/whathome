import { generateText, Output } from "ai";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
// Run logging handled by the API route / backfill workflow
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  developerSales,
  developers,
  nearbyAmenities,
  pipelineProjects,
  projects,
  projectUnits,
  transactions,
} from "@/db/schema";
import { analysisModel, enrichModel } from "@/lib/ai/model";
import { inferBedroomType } from "@/lib/bedroom/inference";
import {
  developerSlug,
  normaliseDeveloperName,
} from "@/lib/developers/normalize";
import { haversineDistance, walkMinutes } from "@/lib/geo";
import { getAllAmenities } from "@/lib/providers/data-gov";
import { reverseGeocode } from "@/lib/providers/onemap";

// --- Zod schemas for structured AI output ---

const tenureSchema = z.object({
  tenure: z
    .enum(["freehold", "99_year", "999_year", "103_year"])
    .nullable()
    .describe("Tenure type parsed from the tenure string"),
  tenureYears: z
    .number()
    .nullable()
    .describe("Number of years (e.g. 99, 999, 103) or null for freehold"),
  tenureStartDate: z
    .string()
    .nullable()
    .describe("Start date in YYYY-MM-DD format, or null if not specified"),
});

const unitClassification = z.object({
  units: z.array(
    z.object({
      unitType: z.enum(["1BR", "2BR", "3BR", "4BR", "5BR", "Penthouse"]),
      sizeSqftMin: z.number(),
      sizeSqftMax: z.number(),
      pricePsfAvg: z.number().nullable(),
      priceFrom: z.number().nullable(),
      priceTo: z.number().nullable(),
      count: z.number(),
    }),
  ),
});

// --- Step functions ---

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  districtNumber: number | null;
  region: "CCR" | "RCR" | "OCR" | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
}

interface TransactionRow {
  tenure: string | null;
  areaSqft: string | null;
  pricePsf: string | null;
  transactedPrice: number | null;
  contractDate: string | null;
  saleType: "new_sale" | "sub_sale" | "resale" | null;
}

interface DevSalesRow {
  developer: string | null;
  street: string | null;
  totalUnits: number | null;
  soldToDate: number | null;
  unitsAvail: number | null;
  medianPrice: string | null;
  lowestPrice: string | null;
  highestPrice: string | null;
}

interface PipelineRow {
  developerName: string | null;
  totalUnits: number | null;
  expectedTopYear: string | null;
}

async function stepLoadProject(projectId: string): Promise<{
  project: ProjectData;
  txns: TransactionRow[];
  devSales: DevSalesRow[];
  pipeline: PipelineRow[];
}> {
  "use step";

  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      districtNumber: projects.districtNumber,
      region: projects.region,
      latitude: projects.latitude,
      longitude: projects.longitude,
      address: projects.address,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) throw new Error(`Project ${projectId} not found`);

  // Load related transactions (sample, max 200 for context)
  const { transactions } = await import("@/db/schema");
  const txns = await db
    .select({
      tenure: transactions.tenure,
      areaSqft: transactions.areaSqft,
      pricePsf: transactions.pricePsf,
      transactedPrice: transactions.transactedPrice,
      contractDate: transactions.contractDate,
      saleType: transactions.saleType,
    })
    .from(transactions)
    .where(eq(transactions.projectId, projectId))
    .orderBy(desc(transactions.contractDate))
    .limit(200);

  // Load developer sales data (match by project name)
  const devSalesRows = await db
    .select({
      developer: developerSales.developer,
      street: developerSales.street,
      totalUnits: developerSales.unitsAvail,
      soldToDate: developerSales.soldToDate,
      unitsAvail: developerSales.unitsAvail,
      medianPrice: developerSales.medianPrice,
      lowestPrice: developerSales.lowestPrice,
      highestPrice: developerSales.highestPrice,
    })
    .from(developerSales)
    .where(eq(developerSales.projectName, project.name))
    .orderBy(desc(developerSales.refPeriod))
    .limit(5);

  // Load pipeline data
  const pipelineRows = await db
    .select({
      developerName: pipelineProjects.developerName,
      totalUnits: pipelineProjects.totalUnits,
      expectedTopYear: pipelineProjects.expectedTopYear,
    })
    .from(pipelineProjects)
    .where(eq(pipelineProjects.projectName, project.name))
    .orderBy(desc(pipelineProjects.snapshotQuarter))
    .limit(1);

  console.log(
    `[research] Loaded: ${txns.length} txns, ${devSalesRows.length} dev sales, ${pipelineRows.length} pipeline`,
  );

  return {
    project: project as ProjectData,
    txns,
    devSales: devSalesRows,
    pipeline: pipelineRows,
  };
}

async function stepReverseGeocode(
  projectId: string,
  lat: number,
  lng: number,
): Promise<{ postalCode: string | null; address: string | null }> {
  "use step";

  const result = await reverseGeocode(lat, lng);

  const updates: Record<string, string | null> = {};
  if (result.postalCode) updates.postalCode = result.postalCode;
  if (result.address) updates.address = result.address;

  if (Object.keys(updates).length) {
    await db.update(projects).set(updates).where(eq(projects.id, projectId));
  }

  return { postalCode: result.postalCode, address: result.address };
}

async function stepParseTenure(
  tenureStrings: string[],
): Promise<z.infer<typeof tenureSchema>> {
  "use step";

  if (!tenureStrings.length) {
    return { tenure: null, tenureYears: null, tenureStartDate: null };
  }

  // Deduplicate tenure strings
  const unique = [...new Set(tenureStrings.filter(Boolean))];
  if (!unique.length) {
    return { tenure: null, tenureYears: null, tenureStartDate: null };
  }

  console.log(`[research] Parsing tenure from: ${unique.join("; ")}`);

  const result = await generateText({
    model: enrichModel,
    output: Output.object({ schema: tenureSchema }),
    prompt: `Parse these Singapore property tenure strings into structured data.
Tenure strings: ${unique.join("; ")}

Rules:
- "Freehold" → tenure: "freehold", tenureYears: null
- "99 yrs commencing from 25/08/2019" → tenure: "99_year", tenureYears: 99, tenureStartDate: "2019-08-25"
- "999 yrs from 1878" → tenure: "999_year", tenureYears: 999, tenureStartDate: "1878-01-01"
- "103 years leasehold" → tenure: "103_year", tenureYears: 103
- If multiple strings, use the most common one.
- If date is only a year, use January 1st.`,
  });

  return (
    result.output ?? { tenure: null, tenureYears: null, tenureStartDate: null }
  );
}

async function stepClassifyUnits(
  txns: TransactionRow[],
): Promise<z.infer<typeof unitClassification>> {
  "use step";

  if (!txns.length) return { units: [] };

  // Build summary of area ranges for AI
  const areaData = txns
    .filter((t) => t.areaSqft)
    .map((t) => ({
      areaSqft: Number.parseFloat(t.areaSqft ?? "0"),
      pricePsf: t.pricePsf ? Number.parseFloat(t.pricePsf) : null,
      price: t.transactedPrice,
    }))
    .filter((t) => t.areaSqft > 0);

  if (!areaData.length) return { units: [] };

  const areas = areaData.map((t) => t.areaSqft).sort((a, b) => a - b);
  const summary = `Min: ${areas[0]} sqft, Max: ${areas[areas.length - 1]} sqft, Count: ${areas.length}`;

  // Group into rough area buckets for the AI
  const buckets: Record<string, number[]> = {};
  for (const d of areaData) {
    const bucket = Math.floor(d.areaSqft / 100) * 100;
    const key = `${bucket}-${bucket + 99}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(d.areaSqft);
  }

  const bucketSummary = Object.entries(buckets)
    .sort(([a], [b]) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
    .map(([range, vals]) => `${range} sqft: ${vals.length} units`)
    .join("\n");

  console.log(
    `[research] Classifying ${areaData.length} transactions into unit types`,
  );

  const classifyResult = await generateText({
    model: enrichModel,
    output: Output.object({ schema: unitClassification }),
    prompt: `Classify Singapore condo transaction data into unit types.

Area distribution:
${summary}

Area buckets:
${bucketSummary}

Price data (sample of first 20):
${JSON.stringify(areaData.slice(0, 20))}

Rules for Singapore condos:
- Studio/1BR: typically 400-600 sqft
- 2BR: typically 600-850 sqft
- 3BR: typically 850-1200 sqft
- 4BR: typically 1200-1600 sqft
- 5BR: typically 1600-2200 sqft
- Penthouse: typically 2200+ sqft

Group transactions into unit types. For each type, provide:
- sizeSqftMin/Max from the area range
- pricePsfAvg from the PSF values
- priceFrom/priceTo from the transacted prices
- count of transactions in that type`,
  });

  return classifyResult.output ?? { units: [] };
}

async function stepFindOrCreateDeveloper(rawSpvName: string): Promise<string> {
  "use step";

  const brandName = normaliseDeveloperName(rawSpvName);
  const slug = developerSlug(brandName);

  console.log(
    `[research] Finding/creating developer: ${rawSpvName} → ${brandName}`,
  );

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

async function stepEnrichProject(
  projectId: string,
  data: {
    tenure: z.infer<typeof tenureSchema>;
    developerName: string | null;
    developerId: string | null;
    address: string | null;
    totalUnits: number | null;
    unitsSold: number | null;
    topDate: string | null;
  },
): Promise<void> {
  "use step";

  const updates: Record<string, unknown> = {};

  if (data.tenure.tenure) updates.tenure = data.tenure.tenure;
  if (data.tenure.tenureYears) updates.tenureYears = data.tenure.tenureYears;
  if (data.tenure.tenureStartDate)
    updates.tenureStartDate = data.tenure.tenureStartDate;
  if (data.developerId) updates.developerId = data.developerId;
  if (data.address) updates.address = data.address;
  if (data.totalUnits) updates.totalUnits = data.totalUnits;
  if (data.unitsSold) updates.unitsSold = data.unitsSold;
  if (data.topDate) updates.topDate = data.topDate;

  if (Object.keys(updates).length) {
    await db.update(projects).set(updates).where(eq(projects.id, projectId));
  }
}

async function stepUpsertUnitMix(
  projectId: string,
  units: z.infer<typeof unitClassification>["units"],
): Promise<number> {
  "use step";

  if (!units.length) return 0;

  console.log(`[research] Upserting ${units.length} unit types`);

  // Delete existing unit mix for this project
  await db.delete(projectUnits).where(eq(projectUnits.projectId, projectId));

  // Insert new
  const rows = units.map((u) => ({
    projectId,
    unitType: u.unitType as "1BR" | "2BR" | "3BR" | "4BR" | "5BR" | "Penthouse",
    sizeSqftMin: u.sizeSqftMin,
    sizeSqftMax: u.sizeSqftMax,
    pricePsf: u.pricePsfAvg ? String(u.pricePsfAvg) : null,
    priceFrom: u.priceFrom,
    priceTo: u.priceTo,
    totalCount: u.count,
  }));

  await db.insert(projectUnits).values(rows);
  return rows.length;
}

async function stepCalculateAmenities(
  projectId: string,
  lat: number,
  lng: number,
): Promise<number> {
  "use step";

  console.log(`[research] Calculating nearby amenities`);

  const allAmenities = await getAllAmenities();

  // Filter amenities within 2km
  const nearby = allAmenities
    .map((a) => ({
      ...a,
      distance: haversineDistance(lat, lng, a.latitude, a.longitude),
    }))
    .filter((a) => a.distance <= 2000)
    .sort((a, b) => a.distance - b.distance);

  // Take top 5 per type
  const byType = new Map<string, typeof nearby>();
  for (const a of nearby) {
    const list = byType.get(a.type) ?? [];
    if (list.length < 5) {
      list.push(a);
      byType.set(a.type, list);
    }
  }

  // Delete existing amenities for this project
  await db
    .delete(nearbyAmenities)
    .where(eq(nearbyAmenities.projectId, projectId));

  // Insert new
  const rows: Array<{
    projectId: string;
    amenityType:
      | "mrt"
      | "bus_interchange"
      | "school"
      | "mall"
      | "park"
      | "hospital";
    name: string;
    distanceMeters: number;
    walkMinutes: number;
    latitude: string;
    longitude: string;
  }> = [];

  for (const [, amenities] of byType) {
    for (const a of amenities) {
      rows.push({
        projectId,
        amenityType: a.type,
        name: a.name,
        distanceMeters: Math.round(a.distance),
        walkMinutes: walkMinutes(a.distance),
        latitude: String(a.latitude),
        longitude: String(a.longitude),
      });
    }
  }

  if (rows.length) {
    await db.insert(nearbyAmenities).values(rows);
  }

  console.log(`[research] Inserted ${rows.length} nearby amenities`);
  return rows.length;
}

async function stepGenerateAnalysis(
  project: ProjectData,
): Promise<{ description: string; aiSummary: string; totalTokens: number }> {
  "use step";

  console.log(`[research] Generating analysis for ${project.name}`);

  // Load full project context for analysis
  const fullProject = await db.query.projects.findFirst({
    where: eq(projects.id, project.id),
    with: {
      developer: true,
      units: true,
      nearbyAmenities: true,
      transactions: { limit: 1 },
    },
  });

  if (!fullProject) throw new Error(`Project ${project.id} not found`);

  // Find comparable projects in same district
  const comparables = await db
    .select({
      name: projects.name,
      districtNumber: projects.districtNumber,
      region: projects.region,
      totalUnits: projects.totalUnits,
      tenure: projects.tenure,
    })
    .from(projects)
    .where(
      and(
        eq(projects.districtNumber, project.districtNumber ?? 0),
        isNull(projects.id) ? undefined : undefined,
      ),
    )
    .limit(10);

  const context = {
    name: fullProject.name,
    district: fullProject.districtNumber,
    region: fullProject.region,
    address: fullProject.address,
    tenure: fullProject.tenure,
    tenureYears: fullProject.tenureYears,
    totalUnits: fullProject.totalUnits,
    unitsSold: fullProject.unitsSold,
    developer: fullProject.developer?.name ?? "Unknown",
    units: fullProject.units.map((u) => ({
      type: u.unitType,
      sizeRange: `${u.sizeSqftMin}-${u.sizeSqftMax} sqft`,
      pricePsf: u.pricePsf,
      priceRange: `$${u.priceFrom?.toLocaleString()}-$${u.priceTo?.toLocaleString()}`,
    })),
    nearbyAmenities: fullProject.nearbyAmenities.map((a) => ({
      type: a.amenityType,
      name: a.name,
      distance: `${a.distanceMeters}m`,
      walk: `${a.walkMinutes} min`,
    })),
    transactionCount: fullProject.transactions?.length ?? 0,
  };

  const { text, usage } = await generateText({
    model: analysisModel,
    system: `You are a Singapore property investment analyst. Write factual, data-driven content using British spelling.

Write TWO sections separated by "---":

SECTION 1 - DESCRIPTION (2-3 paragraphs):
A factual project description covering location, developer, key features, unit types, and target market.

SECTION 2 - AI SUMMARY (structured analysis):
- Value proposition (PSF relative to area averages)
- Location strengths and weaknesses
- Capital appreciation outlook
- Suitable buyer profile (own-stay vs investment)
- Key risks

Be concise and specific. Cite numbers from the data provided.`,
    prompt: `Analyse this Singapore property project:\n${JSON.stringify(context, null, 2)}\n\nComparable projects in district:\n${JSON.stringify(comparables, null, 2)}`,
  });

  // Split into description and summary
  const parts = text.split("---").map((p) => p.trim());
  const description = parts[0] ?? text;
  const aiSummary = parts[1] ?? "";

  return {
    description,
    aiSummary,
    totalTokens: usage.totalTokens ?? 0,
  };
}

async function stepSaveAnalysis(
  projectId: string,
  slug: string,
  description: string,
  aiSummary: string,
): Promise<void> {
  "use step";

  await db
    .update(projects)
    .set({
      description,
      aiSummary,
      lastResearchedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  revalidateTag(`project:${slug}`, "max");
}

async function stepReinferBedroomTypes(projectId: string): Promise<number> {
  "use step";
  // Load curated ranges for this project
  const unitsData = await db
    .select({
      unitType: projectUnits.unitType,
      sizeSqftMin: projectUnits.sizeSqftMin,
      sizeSqftMax: projectUnits.sizeSqftMax,
    })
    .from(projectUnits)
    .where(eq(projectUnits.projectId, projectId));

  const curatedRanges = unitsData
    .filter((unit) => unit.unitType && unit.sizeSqftMin && unit.sizeSqftMax)
    .map((unit) => ({
      unitType: unit.unitType!,
      sizeSqftMin: unit.sizeSqftMin!,
      sizeSqftMax: unit.sizeSqftMax!,
    }));

  // Derive earliest new_sale contract date from transactions for GFA harmonisation check
  const [earliestSale] = await db
    .select({ contractDate: sql<string>`min(${transactions.contractDate})` })
    .from(transactions)
    .where(
      and(
        eq(transactions.projectId, projectId),
        eq(transactions.saleType, "new_sale"),
      ),
    );

  const contractDateStr = earliestSale?.contractDate ?? null;
  const harmonisationCutoff = new Date("2023-06-01");
  const isPostHarmonisation = contractDateStr
    ? new Date(contractDateStr) >= harmonisationCutoff
    : null;

  // Get all transactions for this project
  const txns = await db
    .select()
    .from(transactions)
    .where(eq(transactions.projectId, projectId));

  console.log(
    `[stepReinferBedroomTypes] Processing ${txns.length} transactions`,
  );

  let updated = 0;
  for (const txn of txns) {
    if (!txn.areaSqft) {
      continue;
    }

    const areaSqft = Number(txn.areaSqft);
    const inferredBedroomType = inferBedroomType(
      areaSqft,
      isPostHarmonisation ?? false,
      curatedRanges,
    );

    await db
      .update(transactions)
      .set({
        inferredBedroomType,
        isPostHarmonisation,
      })
      .where(eq(transactions.id, txn.id));

    updated++;
  }

  console.log(`[stepReinferBedroomTypes] DONE updated=${updated}`);
  return updated;
}

// --- Workflow orchestrator ---

export async function projectResearchWorkflow(projectId: string) {
  "use workflow";

  const startTime = Date.now();

  // Step 1: Load project and related data
  const { project, txns, devSales, pipeline } =
    await stepLoadProject(projectId);

  // Step 2: Reverse geocode for postal code (if coordinates available)
  let geocodeResult = {
    postalCode: null as string | null,
    address: null as string | null,
  };
  if (project.latitude && project.longitude) {
    geocodeResult = await stepReverseGeocode(
      projectId,
      Number.parseFloat(project.latitude),
      Number.parseFloat(project.longitude),
    );
  }

  // Step 3: Parse tenure from transaction data
  const tenureStrings = txns
    .map((t) => t.tenure)
    .filter((t): t is string => !!t);
  const tenure = await stepParseTenure(tenureStrings);

  // Step 4: Classify unit types from transaction areas
  const unitData = await stepClassifyUnits(txns);

  // Step 5: Find or create developer
  const developerName =
    devSales[0]?.developer ?? pipeline[0]?.developerName ?? null;
  let developerId: string | null = null;
  if (developerName) {
    developerId = await stepFindOrCreateDeveloper(developerName);
  }

  // Step 6: Compute derived fields
  const totalUnits = devSales[0]?.totalUnits ?? pipeline[0]?.totalUnits ?? null;

  const unitsSold = devSales[0]?.soldToDate ?? null;

  // TOP date from pipeline (year-level only — don't fabricate month/day)
  const topYear = pipeline[0]?.expectedTopYear;
  const topDate = topYear && topYear !== "na" ? `${topYear}-01-01` : null;

  // Step 7: Enrich project record
  await stepEnrichProject(projectId, {
    tenure,
    developerName,
    developerId,
    address: geocodeResult.address ?? project.address,
    totalUnits,
    unitsSold,
    topDate,
  });

  // Step 8: Upsert unit mix
  const unitMixCount = await stepUpsertUnitMix(projectId, unitData.units);

  // Step 8b: Re-infer bedroom types with updated curated ranges
  await stepReinferBedroomTypes(projectId);

  // Step 9: Calculate nearby amenities
  let amenityCount = 0;
  if (project.latitude && project.longitude) {
    amenityCount = await stepCalculateAmenities(
      projectId,
      Number.parseFloat(project.latitude),
      Number.parseFloat(project.longitude),
    );
  }

  // Step 10: Generate AI analysis (description + summary)
  const analysis = await stepGenerateAnalysis(project);

  // Step 11: Save analysis and mark as researched
  await stepSaveAnalysis(
    projectId,
    project.slug,
    analysis.description,
    analysis.aiSummary,
  );

  const durationMs = Date.now() - startTime;

  return {
    projectId,
    projectName: project.name,
    unitMixCount,
    amenityCount,
    totalTokens: analysis.totalTokens,
    durationMs,
  };
}
