import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { transactionPairs, transactions } from "@/db/schema";
import { toNumber } from "@/lib/format";

export interface MarketPsfByBedroom {
  month: string;
  "1BR": number | null;
  "2BR": number | null;
  "3BR": number | null;
  "4BR": number | null;
  "5BR": number | null;
  Penthouse: number | null;
}

export interface DecadeBedroomCagr {
  decade: string;
  bedroom: string;
  region: string;
  medianCagr: number;
  sampleSize: number;
}

/**
 * Monthly average PSF by bedroom type, market-wide, last 5 years.
 * Returns a pivoted shape: { month, '1BR': psf|null, '2BR': psf|null, ... }
 */
export async function getMarketPsfByBedroom(): Promise<MarketPsfByBedroom[]> {
  "use cache";
  cacheLife("max");
  cacheTag("bedroom-analytics");

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const cutoff = fiveYearsAgo.toISOString().slice(0, 10);

  const rows = await db
    .select({
      month: sql<string>`to_char(${transactions.contractDate}, 'YYYY-MM')`,
      bedroom: transactions.inferredBedroomType,
      psf: sql<string>`cast(avg(${transactions.pricePsf}) as numeric)`,
      count: sql<number>`count(*)::int`,
    })
    .from(transactions)
    .where(
      sql`${transactions.inferredBedroomType} IS NOT NULL AND ${transactions.contractDate} >= ${cutoff}`,
    )
    .groupBy(
      sql`to_char(${transactions.contractDate}, 'YYYY-MM')`,
      transactions.inferredBedroomType,
    )
    .orderBy(sql`to_char(${transactions.contractDate}, 'YYYY-MM')`);

  // Pivot: group by month, spread bedroom types as columns
  const byMonth = new Map<
    string,
    { month: string; count: number; [key: string]: string | number | null }
  >();

  for (const row of rows) {
    if (!byMonth.has(row.month)) {
      byMonth.set(row.month, { month: row.month, count: 0 });
    }
    const entry = byMonth.get(row.month)!;
    if (row.bedroom && row.psf != null) {
      entry[row.bedroom] = toNumber(row.psf);
    }
    entry.count += row.count;
  }

  return Array.from(byMonth.values()).map((r) => ({
    month: r.month,
    "1BR": (r["1BR"] as number | null) ?? null,
    "2BR": (r["2BR"] as number | null) ?? null,
    "3BR": (r["3BR"] as number | null) ?? null,
    "4BR": (r["4BR"] as number | null) ?? null,
    "5BR": (r["5BR"] as number | null) ?? null,
    Penthouse: (r.Penthouse as number | null) ?? null,
  }));
}

/**
 * Decade × bedroom × region median CAGR from transaction_pairs.
 * Used for the heatmap table on the analytics dashboard.
 */
export async function getDecadeBedroomCagr(): Promise<DecadeBedroomCagr[]> {
  "use cache";
  cacheLife("max");
  cacheTag("bedroom-analytics");

  const rows = await db
    .select({
      decade: transactionPairs.decade,
      bedroom: transactionPairs.inferredBedroomType,
      region: transactionPairs.region,
      medianCagr: sql<string>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${transactionPairs.annualisedReturn})`,
      sampleSize: sql<number>`count(*)::int`,
    })
    .from(transactionPairs)
    .where(sql`${transactionPairs.inferredBedroomType} IS NOT NULL`)
    .groupBy(
      transactionPairs.decade,
      transactionPairs.inferredBedroomType,
      transactionPairs.region,
    )
    .orderBy(transactionPairs.decade, transactionPairs.inferredBedroomType);

  return rows.map((r) => ({
    decade: r.decade ?? "",
    bedroom: r.bedroom ?? "",
    region: r.region ?? "",
    medianCagr: toNumber(r.medianCagr),
    sampleSize: r.sampleSize,
  }));
}
