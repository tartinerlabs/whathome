import { count } from "drizzle-orm";
import { db } from "@/db";
import { projects, transactions } from "@/db/schema";

export interface DataHealthSummary {
  totalProjects: number;
  researchedProjects: number;
  unresearchedProjects: number;
  totalTransactions: number;
}

export async function getDataHealthSummary(): Promise<DataHealthSummary> {
  const [[projectCounts], [txnCount]] = await Promise.all([
    db
      .select({
        total: count(),
        researched: count(projects.lastResearchedAt),
      })
      .from(projects),
    db.select({ total: count() }).from(transactions),
  ]);

  return {
    totalProjects: projectCounts?.total ?? 0,
    researchedProjects: projectCounts?.researched ?? 0,
    unresearchedProjects:
      (projectCounts?.total ?? 0) - (projectCounts?.researched ?? 0),
    totalTransactions: txnCount?.total ?? 0,
  };
}
