import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, researchRuns, transactions } from "@/db/schema";

export interface DataHealthSummary {
  totalProjects: number;
  researchedProjects: number;
  unresearchedProjects: number;
  totalTransactions: number;
  latestIngestion: Date | null;
  latestResearch: Date | null;
}

export async function getDataHealthSummary(): Promise<DataHealthSummary> {
  const [[projectCounts], [txnCount], [latestIngestion], [latestResearch]] =
    await Promise.all([
      db
        .select({
          total: count(),
          researched: count(projects.lastResearchedAt),
        })
        .from(projects),
      db.select({ total: count() }).from(transactions),
      db
        .select({ completedAt: researchRuns.completedAt })
        .from(researchRuns)
        .where(eq(researchRuns.agentType, "data_ingestion"))
        .orderBy(desc(researchRuns.completedAt))
        .limit(1),
      db
        .select({ completedAt: researchRuns.completedAt })
        .from(researchRuns)
        .where(eq(researchRuns.agentType, "project_research"))
        .orderBy(desc(researchRuns.completedAt))
        .limit(1),
    ]);

  return {
    totalProjects: projectCounts?.total ?? 0,
    researchedProjects: projectCounts?.researched ?? 0,
    unresearchedProjects:
      (projectCounts?.total ?? 0) - (projectCounts?.researched ?? 0),
    totalTransactions: txnCount?.total ?? 0,
    latestIngestion: latestIngestion?.completedAt ?? null,
    latestResearch: latestResearch?.completedAt ?? null,
  };
}

export interface RunRow {
  id: string;
  agentType: string;
  status: string;
  projectName: string | null;
  tokensUsed: number | null;
  costUsd: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
}

export async function getRecentRuns(limit = 20): Promise<RunRow[]> {
  const rows = await db
    .select({
      id: researchRuns.id,
      agentType: researchRuns.agentType,
      status: researchRuns.status,
      projectName: projects.name,
      tokensUsed: researchRuns.tokensUsed,
      costUsd: researchRuns.costUsd,
      startedAt: researchRuns.startedAt,
      completedAt: researchRuns.completedAt,
      errorMessage: researchRuns.errorMessage,
      createdAt: researchRuns.createdAt,
    })
    .from(researchRuns)
    .leftJoin(projects, eq(researchRuns.projectId, projects.id))
    .orderBy(desc(researchRuns.createdAt))
    .limit(limit);

  return rows;
}

export interface RunDetail {
  id: string;
  agentType: string;
  status: string;
  projectId: string | null;
  projectName: string | null;
  projectSlug: string | null;
  inputPayload: unknown;
  outputSummary: string | null;
  tokensUsed: number | null;
  costUsd: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
}

export async function getRunById(runId: string): Promise<RunDetail | null> {
  const [row] = await db
    .select({
      id: researchRuns.id,
      agentType: researchRuns.agentType,
      status: researchRuns.status,
      projectId: researchRuns.projectId,
      projectName: projects.name,
      projectSlug: projects.slug,
      inputPayload: researchRuns.inputPayload,
      outputSummary: researchRuns.outputSummary,
      tokensUsed: researchRuns.tokensUsed,
      costUsd: researchRuns.costUsd,
      startedAt: researchRuns.startedAt,
      completedAt: researchRuns.completedAt,
      errorMessage: researchRuns.errorMessage,
      createdAt: researchRuns.createdAt,
    })
    .from(researchRuns)
    .leftJoin(projects, eq(researchRuns.projectId, projects.id))
    .where(eq(researchRuns.id, runId))
    .limit(1);

  return row ?? null;
}
