import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, transactions } from "@/db/schema";
import { projectUnits } from "@/db/schema/project-details";
import { inferBedroomType, type UnitType } from "@/lib/bedroom/inference";

export async function bedroomBackfillWorkflow(): Promise<{
  processed: number;
  updated: number;
}> {
  "use workflow";

  console.log("[bedroomBackfillWorkflow] START");

  // Step 1: Load all project units into memory for fast lookup
  const curatedRangesMap = await loadProjectUnitsMap();

  // Step 2: Load all project launch dates for GFA harmonisation detection
  const launchDatesMap = await loadProjectLaunchDates();

  // Step 3: Get total count of transactions to process
  const totalCount = await getTransactionCount();
  console.log(
    `[bedroomBackfillWorkflow] Total transactions to process: ${totalCount}`,
  );

  // Step 4: Process in batches
  let processed = 0;
  let updated = 0;
  const batchSize = 1000;

  while (processed < totalCount) {
    const result = await processBatch(
      processed,
      batchSize,
      curatedRangesMap,
      launchDatesMap,
    );
    processed += result.processed;
    updated += result.updated;

    console.log(
      `[bedroomBackfillWorkflow] Progress: ${processed}/${totalCount} (${updated} updated)`,
    );
  }

  console.log(
    `[bedroomBackfillWorkflow] DONE processed=${processed} updated=${updated}`,
  );

  return { processed, updated };
}

async function loadProjectUnitsMap(): Promise<
  Map<
    string,
    Array<{ unitType: UnitType; sizeSqftMin: number; sizeSqftMax: number }>
  >
> {
  "use step";
  console.log("[loadProjectUnitsMap] START");

  const units = await db
    .select({
      projectId: projectUnits.projectId,
      unitType: projectUnits.unitType,
      sizeSqftMin: projectUnits.sizeSqftMin,
      sizeSqftMax: projectUnits.sizeSqftMax,
    })
    .from(projectUnits);

  const map = new Map<
    string,
    Array<{ unitType: UnitType; sizeSqftMin: number; sizeSqftMax: number }>
  >();

  for (const unit of units) {
    if (!map.has(unit.projectId)) {
      map.set(unit.projectId, []);
    }
    // Skip units without size data
    if (!unit.sizeSqftMin || !unit.sizeSqftMax) {
      continue;
    }
    map.get(unit.projectId)?.push({
      unitType: unit.unitType as UnitType,
      sizeSqftMin: unit.sizeSqftMin,
      sizeSqftMax: unit.sizeSqftMax,
    });
  }

  console.log(`[loadProjectUnitsMap] DONE loaded ${map.size} projects`);
  return map;
}

async function loadProjectLaunchDates(): Promise<Map<string, string | null>> {
  "use step";
  console.log("[loadProjectLaunchDates] START");

  const projectData = await db
    .select({
      id: projects.id,
      launchDate: projects.launchDate,
    })
    .from(projects);

  const map = new Map<string, string | null>();

  for (const project of projectData) {
    map.set(project.id, project.launchDate);
  }

  console.log(`[loadProjectLaunchDates] DONE loaded ${map.size} projects`);
  return map;
}

async function getTransactionCount(): Promise<number> {
  "use step";
  console.log("[getTransactionCount] START");

  const result = await db.select({ count: transactions.id }).from(transactions);

  console.log(`[getTransactionCount] DONE count=${result.length}`);
  return result.length;
}

async function processBatch(
  offset: number,
  limit: number,
  curatedRangesMap: Map<
    string,
    Array<{ unitType: UnitType; sizeSqftMin: number; sizeSqftMax: number }>
  >,
  launchDatesMap: Map<string, string | null>,
): Promise<{ processed: number; updated: number }> {
  "use step";
  console.log(`[processBatch] START offset=${offset} limit=${limit}`);

  // Fetch a batch of transactions
  const batch = await db
    .select()
    .from(transactions)
    .limit(limit)
    .offset(offset);

  console.log(`[processBatch] fetched ${batch.length} transactions`);

  // Prepare updates
  const updates: Array<{
    id: string;
    inferredBedroomType: UnitType | null;
    isPostHarmonisation: boolean | null;
  }> = [];

  for (const txn of batch) {
    if (!txn.areaSqft || !txn.projectId) {
      continue; // Skip transactions without area or project
    }

    const areaSqft = Number(txn.areaSqft);
    const launchDateStr = txn.projectId
      ? launchDatesMap.get(txn.projectId)
      : null;

    // Determine if post-harmonisation: project launch date >= 2023-06-01
    const harmonisationCutoff = new Date("2023-06-01");
    const isPostHarmonisation = launchDateStr
      ? new Date(launchDateStr) >= harmonisationCutoff
      : null;

    // Get curated ranges for this project, if available
    const curatedRanges = txn.projectId
      ? curatedRangesMap.get(txn.projectId)
      : undefined;

    // Infer bedroom type
    const inferredBedroomType = inferBedroomType(
      areaSqft,
      isPostHarmonisation ?? false,
      curatedRanges,
    );

    updates.push({
      id: txn.id,
      inferredBedroomType,
      isPostHarmonisation,
    });
  }

  console.log(`[processBatch] prepared ${updates.length} updates`);

  // Apply updates in batches
  let updatedCount = 0;
  for (const update of updates) {
    await db
      .update(transactions)
      .set({
        inferredBedroomType: update.inferredBedroomType,
        isPostHarmonisation: update.isPostHarmonisation,
      })
      .where(eq(transactions.id, update.id));
    updatedCount++;
  }

  console.log(`[processBatch] DONE updated=${updatedCount}`);
  return { processed: batch.length, updated: updatedCount };
}
