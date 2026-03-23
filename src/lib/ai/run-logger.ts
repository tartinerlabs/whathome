import { eq } from "drizzle-orm";
import { db } from "@/db";
import { researchRuns } from "@/db/schema";

type AgentType =
  | "data_ingestion"
  | "project_research"
  | "analysis"
  | "backfill";

interface RunLoggerOptions {
  agentType: AgentType;
  projectId?: string;
  inputPayload?: unknown;
}

interface RunLogger {
  runId: string;
  markRunning: () => Promise<void>;
  markCompleted: (
    summary: string,
    tokens?: number,
    cost?: number,
  ) => Promise<void>;
  markFailed: (error: string) => Promise<void>;
}

/**
 * Create a research_runs record and return helpers to transition its status.
 *
 * Lifecycle: pending → running → completed | failed
 */
export async function createRunLogger(
  opts: RunLoggerOptions,
): Promise<RunLogger> {
  const [row] = await db
    .insert(researchRuns)
    .values({
      agentType: opts.agentType,
      status: "pending",
      projectId: opts.projectId ?? null,
      inputPayload: opts.inputPayload ?? null,
      startedAt: new Date(),
    })
    .returning({ id: researchRuns.id });

  const runId = row.id;

  return {
    runId,

    async markRunning() {
      await db
        .update(researchRuns)
        .set({ status: "running" })
        .where(eq(researchRuns.id, runId));
    },

    async markCompleted(summary: string, tokens?: number, cost?: number) {
      await db
        .update(researchRuns)
        .set({
          status: "completed",
          outputSummary: summary,
          tokensUsed: tokens ?? null,
          costUsd: cost ? String(cost) : null,
          completedAt: new Date(),
        })
        .where(eq(researchRuns.id, runId));
    },

    async markFailed(error: string) {
      await db
        .update(researchRuns)
        .set({
          status: "failed",
          errorMessage: error,
          completedAt: new Date(),
        })
        .where(eq(researchRuns.id, runId));
    },
  };
}
