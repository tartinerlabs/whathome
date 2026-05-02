import { sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/db";
import { priceIndices } from "@/db/schema";
import { getPriceIndexData } from "@/lib/providers/data-gov";

function computePercentageChange(current: number, previous: number) {
  return (((current - previous) / previous) * 100).toFixed(2);
}

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV) {
    const authHeader = request.headers.get("authorization");
    if (
      !process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const rows = await getPriceIndexData();
  if (!rows.length) {
    return Response.json({ status: "no_data", upserted: 0 });
  }

  // Sort by region then quarter to compute QoQ percentage change
  const sorted = rows.toSorted((a, b) =>
    a.region !== b.region
      ? a.region.localeCompare(b.region)
      : a.quarter.localeCompare(b.quarter),
  );

  const prevIndex = new Map<string, number>();
  const values = sorted.map((row) => {
    const prev = prevIndex.get(row.region);
    prevIndex.set(row.region, row.indexValue);

    return {
      quarter: row.quarter,
      region: row.region,
      indexValue: String(row.indexValue),
      ...(prev && {
        percentageChange: computePercentageChange(row.indexValue, prev),
      }),
      sourceDataset: "datagov_price_index",
    };
  });

  let upserted = 0;
  const CHUNK_SIZE = 500;

  for (let offset = 0; offset < values.length; offset += CHUNK_SIZE) {
    const chunk = values.slice(offset, offset + CHUNK_SIZE);

    const result = await db
      .insert(priceIndices)
      .values(chunk)
      .onConflictDoUpdate({
        target: [priceIndices.quarter, priceIndices.region],
        set: {
          indexValue: sql`excluded.index_value`,
          percentageChange: sql`excluded.percentage_change`,
          sourceDataset: sql`excluded.source_dataset`,
        },
      });

    upserted += result?.rowCount ?? 0;
  }

  revalidateTag("market:prices", "max");

  return Response.json({ status: "ok", upserted, total: values.length });
}
