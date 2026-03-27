import { desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { priceIndices } from "@/db/schema";
import { toNumber } from "@/lib/format";
import type { PriceIndex } from "@/lib/types";

export async function getMarketSnapshot() {
  "use cache";
  cacheLife("max");
  cacheTag("market-data");

  const rows = await db
    .select()
    .from(priceIndices)
    .orderBy(desc(priceIndices.quarter));

  if (!rows.length) {
    return {
      latestQuarter: "N/A",
      stats: [] as {
        label: string;
        value: string;
        change: number;
        isPositive: boolean;
      }[],
    };
  }

  // Pivot rows (one per region) into a single PriceIndex record
  const byQuarter = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const q = row.quarter;
    if (!byQuarter.has(q)) byQuarter.set(q, {});
    const entry = byQuarter.get(q)!;
    if (row.region) {
      entry[row.region] = toNumber(row.indexValue);
    }
    entry.change = toNumber(row.percentageChange);
  }

  const quarters = [...byQuarter.keys()].sort().reverse();
  const latest = quarters[0];
  const latestData = byQuarter.get(latest);

  if (!latestData) {
    return { latestQuarter: latest, stats: [] };
  }

  return {
    latestQuarter: latest,
    stats: [
      {
        label: "CCR Index",
        value: String(latestData.CCR ?? "N/A"),
        change: latestData.change ?? 0,
        isPositive: (latestData.change ?? 0) >= 0,
      },
      {
        label: "RCR Index",
        value: String(latestData.RCR ?? "N/A"),
        change: latestData.change ?? 0,
        isPositive: (latestData.change ?? 0) >= 0,
      },
      {
        label: "OCR Index",
        value: String(latestData.OCR ?? "N/A"),
        change: latestData.change ?? 0,
        isPositive: (latestData.change ?? 0) >= 0,
      },
    ],
  };
}

export async function getPriceIndices(): Promise<PriceIndex[]> {
  "use cache";
  cacheLife("max");
  cacheTag("market-data");

  const rows = await db
    .select()
    .from(priceIndices)
    .orderBy(priceIndices.quarter);

  // Pivot region rows into PriceIndex objects keyed by quarter
  const byQuarter = new Map<string, PriceIndex>();

  for (const row of rows) {
    const q = row.quarter;
    if (!byQuarter.has(q)) {
      byQuarter.set(q, { quarter: q, ccr: 0, rcr: 0, ocr: 0, overall: 0 });
    }
    const entry = byQuarter.get(q)!;
    const val = toNumber(row.indexValue);

    switch (row.region) {
      case "CCR":
        entry.ccr = val;
        break;
      case "RCR":
        entry.rcr = val;
        break;
      case "OCR":
        entry.ocr = val;
        break;
    }
  }

  // Compute overall as average of CCR/RCR/OCR
  for (const entry of byQuarter.values()) {
    entry.overall = Math.round((entry.ccr + entry.rcr + entry.ocr) / 3);
  }

  return [...byQuarter.values()];
}
