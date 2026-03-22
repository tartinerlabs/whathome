import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { toNumber } from "@/lib/format";
import type { PsfDataPoint, Transaction } from "@/lib/types";

export async function getTransactionsByProject(
  projectId: string,
): Promise<Transaction[]> {
  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.projectId, projectId))
    .orderBy(desc(transactions.contractDate));

  return rows.map((r) => ({
    id: r.id,
    projectSlug: "",
    projectName: r.projectName,
    unitNumber: r.unitNumber ?? "",
    floorRange: r.floorRange ?? "",
    areaSqft: toNumber(r.areaSqft),
    transactedPrice: r.transactedPrice ?? 0,
    pricePsf: toNumber(r.pricePsf),
    contractDate: r.contractDate ?? "",
    saleType: r.saleType ?? "new_sale",
    propertyType: r.propertyType ?? "condo",
    district: r.district ?? 0,
    tenure: r.tenure ?? "",
  }));
}

export async function getPsfTrend(projectId: string): Promise<PsfDataPoint[]> {
  const rows = await db
    .select({
      month: sql<string>`to_char(${transactions.contractDate}, 'YYYY-MM')`,
      psf: sql<string>`cast(avg(${transactions.pricePsf}) as numeric)`,
    })
    .from(transactions)
    .where(eq(transactions.projectId, projectId))
    .groupBy(sql`to_char(${transactions.contractDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${transactions.contractDate}, 'YYYY-MM')`);

  return rows.map((r) => ({
    month: r.month ?? "",
    psf: toNumber(r.psf),
  }));
}
