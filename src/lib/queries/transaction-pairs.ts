import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { projects, transactionPairs } from "@/db/schema";
import { toNumber } from "@/lib/format";

export interface TransactionPair {
  id: string;
  projectId: string | null;
  projectName: string | null;
  inferredBedroomType: string | null;
  buyPrice: number;
  sellPrice: number;
  buyDate: string;
  sellDate: string;
  buyPsf: number;
  sellPsf: number;
  areaSqft: number;
  holdingMonths: number;
  profitAmount: number;
  profitPercent: number;
  annualisedReturn: number;
  holdingBucket: string | null;
  region: string | null;
  district: number | null;
  decade: string | null;
}

export async function getTransactionPairsByProject(
  projectId: string,
): Promise<TransactionPair[]> {
  "use cache";
  cacheLife("max");
  cacheTag("transaction:pairs", `transaction:pairs:${projectId}`);

  try {
    const rows = await db
      .select({
        id: transactionPairs.id,
        projectId: transactionPairs.projectId,
        projectName: projects.name,
        inferredBedroomType: transactionPairs.inferredBedroomType,
        buyPrice: transactionPairs.buyPrice,
        sellPrice: transactionPairs.sellPrice,
        buyDate: transactionPairs.buyDate,
        sellDate: transactionPairs.sellDate,
        buyPsf: transactionPairs.buyPsf,
        sellPsf: transactionPairs.sellPsf,
        areaSqft: transactionPairs.areaSqft,
        holdingMonths: transactionPairs.holdingMonths,
        profitAmount: transactionPairs.profitAmount,
        profitPercent: transactionPairs.profitPercent,
        annualisedReturn: transactionPairs.annualisedReturn,
        holdingBucket: transactionPairs.holdingBucket,
        region: transactionPairs.region,
        district: transactionPairs.district,
        decade: transactionPairs.decade,
      })
      .from(transactionPairs)
      .leftJoin(projects, eq(transactionPairs.projectId, projects.id))
      .where(eq(transactionPairs.projectId, projectId))
      .orderBy(desc(transactionPairs.sellDate));

    return rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      projectName: row.projectName,
      inferredBedroomType: row.inferredBedroomType,
      buyPrice: row.buyPrice ?? 0,
      sellPrice: row.sellPrice ?? 0,
      buyDate: row.buyDate ?? "",
      sellDate: row.sellDate ?? "",
      buyPsf: toNumber(row.buyPsf),
      sellPsf: toNumber(row.sellPsf),
      areaSqft: toNumber(row.areaSqft),
      holdingMonths: row.holdingMonths ?? 0,
      profitAmount: row.profitAmount ?? 0,
      profitPercent: toNumber(row.profitPercent),
      annualisedReturn: toNumber(row.annualisedReturn),
      holdingBucket: row.holdingBucket,
      region: row.region,
      district: row.district,
      decade: row.decade,
    }));
  } catch {
    return [];
  }
}
