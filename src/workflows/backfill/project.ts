import { desc, isNull } from "drizzle-orm";
import { start } from "workflow/api";
import { db } from "@/db";
import { projects } from "@/db/schema";

import { projectResearchWorkflow } from "../research";

/**
 * Backfill workflow — finds unresearched projects and enriches them
 * in batches. Each project gets the full research + analysis pipeline.
 */
export async function backfillWorkflow(batchSize = 10) {
  "use workflow";

  const startTime = Date.now();

  // Step 1: Find unresearched projects
  const unresearched = await stepFindUnresearched(batchSize);

  if (!unresearched.length) {
    await stepLogBatchRun(0, 0, Date.now() - startTime);
    return { processed: 0, total: 0, durationMs: Date.now() - startTime };
  }

  // Step 2: Process each project sequentially
  let processed = 0;
  for (const project of unresearched) {
    try {
      console.log(
        `[backfill] Processing ${processed + 1}/${unresearched.length}: ${project.name}`,
      );
      await stepResearchProject(project.id);
      processed++;
    } catch (error) {
      console.error(
        `[backfill] Failed to process ${project.name}:`,
        error instanceof Error ? error.message : error,
      );
      // Continue with remaining projects
    }
  }

  const durationMs = Date.now() - startTime;

  // Step 3: Log the batch run
  await stepLogBatchRun(processed, unresearched.length, durationMs);

  return {
    processed,
    total: unresearched.length,
    durationMs,
  };
}

async function stepFindUnresearched(
  limit: number,
): Promise<Array<{ id: string; name: string; slug: string }>> {
  "use step";

  console.log(`[backfill] Finding up to ${limit} unresearched projects`);

  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
    })
    .from(projects)
    .where(isNull(projects.lastResearchedAt))
    .orderBy(desc(projects.createdAt))
    .limit(limit);

  console.log(`[backfill] Found ${rows.length} unresearched projects`);
  return rows;
}

async function stepResearchProject(projectId: string): Promise<void> {
  "use step";

  console.log(`[backfill] Starting research workflow for ${projectId}`);
  const run = await start(projectResearchWorkflow, [projectId]);
  await run.returnValue;
  console.log(`[backfill] Research completed for ${projectId}`);
}

async function stepLogBatchRun(
  processed: number,
  total: number,
  durationMs: number,
): Promise<void> {
  "use step";

  console.log(
    `[backfill] Batch complete: ${processed}/${total} projects, ${durationMs}ms`,
  );
}
