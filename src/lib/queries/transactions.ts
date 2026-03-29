import { desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { toNumber } from "@/lib/format";
import type { PsfDataPoint, Transaction } from "@/lib/types";

export async function getTransactionsByProject(
  projectId: string,
): Promise<Transaction[]> {
  "use cache";
  cacheLife("max");
  cacheTag("transactions");

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
  "use cache";
  cacheLife("max");
  cacheTag("transactions");

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

export type BedroomPsfDataPoint = {
  month: string;
  "1BR": number | null;
  "2BR": number | null;
  "3BR": number | null;
  "4BR": number | null;
  "5BR": number | null;
  Penthouse: number | null;
  all: number;
};

export async function getPsfTrendByBedroom(
  projectId: string,
): Promise<BedroomPsfDataPoint[]> {
  "use cache";
  cacheLife("max");
  cacheTag("bedrooms:analytics");

  const rows = await db
    .select({
      month: sql<string>`to_char(${transactions.contractDate}, 'YYYY-MM')`,
      bedroom: transactions.inferredBedroomType,
      psf: sql<string>`cast(avg(${transactions.pricePsf}) as numeric)`,
    })
    .from(transactions)
    .where(
      sql`${transactions.projectId} = ${projectId} AND ${transactions.inferredBedroomType} IS NOT NULL`,
    )
    .groupBy(
      sql`to_char(${transactions.contractDate}, 'YYYY-MM')`,
      transactions.inferredBedroomType,
    )
    .orderBy(sql`to_char(${transactions.contractDate}, 'YYYY-MM')`);

  // Also fetch the aggregate for "all"
  const allRows = await db
    .select({
      month: sql<string>`to_char(${transactions.contractDate}, 'YYYY-MM')`,
      psf: sql<string>`cast(avg(${transactions.pricePsf}) as numeric)`,
    })
    .from(transactions)
    .where(sql`${transactions.projectId} = ${projectId}`)
    .groupBy(sql`to_char(${transactions.contractDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${transactions.contractDate}, 'YYYY-MM')`);

  const allByMonth = new Map<string, number>();
  for (const r of allRows) {
    if (r.month && r.psf != null) {
      allByMonth.set(r.month, toNumber(r.psf));
    }
  }

  // Pivot by month
  const byMonth = new Map<
    string,
    { month: string; [key: string]: string | number | null }
  >();
  for (const row of rows) {
    if (!row.month || !row.bedroom) continue;
    if (!byMonth.has(row.month)) {
      byMonth.set(row.month, { month: row.month });
    }
    byMonth.get(row.month)![row.bedroom] = toNumber(row.psf);
  }

  return Array.from(byMonth.values()).map((r) => ({
    month: r.month,
    "1BR": (r["1BR"] as number | null) ?? null,
    "2BR": (r["2BR"] as number | null) ?? null,
    "3BR": (r["3BR"] as number | null) ?? null,
    "4BR": (r["4BR"] as number | null) ?? null,
    "5BR": (r["5BR"] as number | null) ?? null,
    Penthouse: (r.Penthouse as number | null) ?? null,
    all: allByMonth.get(r.month) ?? 0,
  }));
}
