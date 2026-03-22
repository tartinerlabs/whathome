import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, researchRuns } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentType = searchParams.get("agentType");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  const conditions = agentType
    ? eq(
        researchRuns.agentType,
        agentType as
          | "data_ingestion"
          | "project_research"
          | "analysis"
          | "backfill",
      )
    : undefined;

  const runs = await db
    .select({
      id: researchRuns.id,
      agentType: researchRuns.agentType,
      status: researchRuns.status,
      projectId: researchRuns.projectId,
      projectName: projects.name,
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
    .where(conditions)
    .orderBy(desc(researchRuns.createdAt))
    .limit(limit);

  return Response.json(runs);
}
