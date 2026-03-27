import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { projects, transactionPairs, transactions } from "@/db/schema";
import {
  computeReturns,
  decade,
  holdingBucket,
  holdingMonths,
} from "@/lib/bedroom/returns";

export async function pairsBackfillWorkflow(): Promise<{
  inserted: number;
  durationMs: number;
}> {
  "use workflow";

  console.log("[pairsBackfillWorkflow] START");
  const startTime = Date.now();

  // Step 1: Count existing pairs so we can report
  const beforeCount = await stepCountPairs();
  console.log(`[pairsBackfillWorkflow] existing pairs before: ${beforeCount}`);

  // Step 2: Run the pair-matching and insert
  const inserted = await stepMatchAndInsert();
  console.log(`[pairsBackfillWorkflow] inserted ${inserted} new pairs`);

  const durationMs = Date.now() - startTime;
  console.log(`[pairsBackfillWorkflow] DONE duration=${durationMs}ms`);

  return { inserted, durationMs };
}

async function stepCountPairs(): Promise<number> {
  "use step";
  console.log("[stepCountPairs] START");
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactionPairs);
  const count = result[0]?.count ?? 0;
  console.log(`[stepCountPairs] DONE count=${count}`);
  return count;
}

/**
 * Core pair-matching logic:
 * For each resale, find the most recent prior sale of the same unit (same project,
 * same floorRange, same areaSqft). Skip pairs where holding < 6 months.
 * Denormalise bedroom type, region, district from the project.
 */
async function stepMatchAndInsert(): Promise<number> {
  "use step";
  console.log("[stepMatchAndInsert] START");
  try {
    // Load project region/district map
    const projectData = await db
      .select({
        id: projects.id,
        region: projects.region,
        district: projects.districtNumber,
      })
      .from(projects);

    const projectMeta = new Map<
      string,
      { region: string | null; district: number | null }
    >();
    for (const p of projectData) {
      projectMeta.set(p.id, { region: p.region, district: p.district });
    }

    // Fetch all resale transactions with their project metadata
    const resales = await db
      .select({
        id: transactions.id,
        projectId: transactions.projectId,
        areaSqft: transactions.areaSqft,
        floorRange: transactions.floorRange,
        transactedPrice: transactions.transactedPrice,
        pricePsf: transactions.pricePsf,
        contractDate: transactions.contractDate,
        inferredBedroomType: transactions.inferredBedroomType,
      })
      .from(transactions)
      .where(eq(transactions.saleType, "resale"))
      .orderBy(desc(transactions.contractDate));

    console.log(`[stepMatchAndInsert] found ${resales.length} resales`);

    let inserted = 0;

    for (const resale of resales) {
      if (
        !resale.projectId ||
        !resale.areaSqft ||
        !resale.floorRange ||
        !resale.contractDate
      ) {
        continue;
      }

      // Find prior sales of the same unit: same project + areaSqft + floorRange,
      // contract date strictly before the resale
      const priorSales = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.projectId, resale.projectId),
            eq(transactions.areaSqft, resale.areaSqft),
            eq(transactions.floorRange, resale.floorRange),
            ne(transactions.saleType, "resale"),
            sql`${transactions.contractDate} < ${resale.contractDate}`,
          ),
        )
        .orderBy(desc(transactions.contractDate))
        .limit(1);

      if (priorSales.length === 0) continue;

      const buy = priorSales[0];

      // Skip if holding period is less than 6 months
      const hm = holdingMonths(
        buy.contractDate ?? "",
        resale.contractDate ?? "",
      );
      if (hm < 6) continue;

      const meta = projectMeta.get(resale.projectId) ?? {
        region: null,
        district: null,
      };

      const buyPrice = buy.transactedPrice ?? 0;
      const sellPrice = resale.transactedPrice ?? 0;

      const { profitAmount, profitPercent, cagr } = computeReturns(
        buyPrice,
        sellPrice,
        hm,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.insert(transactionPairs).values({
        projectId: resale.projectId,
        buyTransactionId: buy.id,
        sellTransactionId: resale.id,
        inferredBedroomType: resale.inferredBedroomType,
        buyPrice,
        sellPrice,
        buyDate: buy.contractDate,
        sellDate: resale.contractDate,
        buyPsf: buy.pricePsf,
        sellPsf: resale.pricePsf,
        areaSqft: resale.areaSqft,
        holdingMonths: hm,
        profitAmount,
        profitPercent,
        annualisedReturn: cagr,
        holdingBucket: holdingBucket(hm),
        region: meta.region,
        district: meta.district,
        decade: decade(resale.contractDate ?? ""),
      } as any);

      inserted++;
    }

    console.log(`[stepMatchAndInsert] DONE inserted=${inserted}`);
    return inserted;
  } finally {
    console.log("[stepMatchAndInsert] EXIT");
  }
}
