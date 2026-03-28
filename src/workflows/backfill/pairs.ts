import { and, asc, desc, eq, isNotNull, ne } from "drizzle-orm";
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

  const beforeCount = await stepCountPairs();
  console.log(`[pairsBackfillWorkflow] existing pairs before: ${beforeCount}`);

  const projectMeta = await stepLoadProjectMeta();
  const resales = await stepLoadResales();
  const buys = await stepLoadBuys();
  const inserted = await stepMatchAndInsert(projectMeta, resales, buys);
  console.log(`[pairsBackfillWorkflow] inserted ${inserted} new pairs`);

  const durationMs = Date.now() - startTime;
  console.log(`[pairsBackfillWorkflow] DONE duration=${durationMs}ms`);

  return { inserted, durationMs };
}

async function stepCountPairs(): Promise<number> {
  "use step";
  const count = await db.$count(transactionPairs);
  console.log(`[stepCountPairs] count=${count}`);
  return count;
}

async function stepLoadProjectMeta(): Promise<
  Map<string, { region: string | null; district: number | null }>
> {
  "use step";
  const allProjects = await db.select().from(projects);
  const meta = new Map(
    allProjects.map((project) => [
      project.id,
      { region: project.region, district: project.districtNumber },
    ]),
  );
  console.log(`[stepLoadProjectMeta] loaded ${meta.size} projects`);
  return meta;
}

const requiredFields = and(
  isNotNull(transactions.projectId),
  isNotNull(transactions.areaSqft),
  isNotNull(transactions.floorRange),
  isNotNull(transactions.contractDate),
);

async function stepLoadResales() {
  "use step";
  const resales = await db
    .select()
    .from(transactions)
    .where(and(requiredFields, eq(transactions.saleType, "resale")))
    .orderBy(asc(transactions.contractDate));
  console.log(`[stepLoadResales] loaded ${resales.length} resales`);
  return resales;
}

async function stepLoadBuys() {
  "use step";
  const buys = await db
    .select()
    .from(transactions)
    .where(and(requiredFields, ne(transactions.saleType, "resale")))
    .orderBy(desc(transactions.contractDate));
  console.log(`[stepLoadBuys] loaded ${buys.length} buys`);
  return buys;
}

type ProjectMeta = Map<
  string,
  { region: string | null; district: number | null }
>;
type Transaction = Awaited<ReturnType<typeof stepLoadResales>>[number];

async function stepMatchAndInsert(
  projectMeta: ProjectMeta,
  resales: Transaction[],
  buys: Transaction[],
): Promise<number> {
  "use step";
  console.log("[stepMatchAndInsert] START");

  // Index buys by unit key — sorted desc by contractDate from the query,
  // so the first match before a resale date is the most recent buy
  const buysByUnit = new Map<string, Transaction[]>();
  for (const buy of buys) {
    const key = `${buy.projectId}:${buy.areaSqft}:${buy.floorRange}`;
    if (!buysByUnit.has(key)) buysByUnit.set(key, []);
    buysByUnit.get(key)!.push(buy);
  }

  const rows: Array<Record<string, unknown>> = [];

  for (const sell of resales) {
    const key = `${sell.projectId}:${sell.areaSqft}:${sell.floorRange}`;
    const candidates = buysByUnit.get(key);
    if (!candidates) continue;

    // Candidates are sorted desc — first one before the sell date is the match
    const buy = candidates.find(
      (candidate) => (candidate.contractDate ?? "") < (sell.contractDate ?? ""),
    );
    if (!buy) continue;

    const hm = holdingMonths(buy.contractDate ?? "", sell.contractDate ?? "");
    if (hm < 6) continue;

    const meta = projectMeta.get(sell.projectId!) ?? {
      region: null,
      district: null,
    };
    const buyPrice = buy.transactedPrice ?? 0;
    const sellPrice = sell.transactedPrice ?? 0;
    const { profitAmount, profitPercent, cagr } = computeReturns(
      buyPrice,
      sellPrice,
      hm,
    );

    rows.push({
      projectId: sell.projectId!,
      buyTransactionId: buy.id,
      sellTransactionId: sell.id,
      inferredBedroomType: sell.inferredBedroomType,
      buyPrice,
      sellPrice,
      buyDate: buy.contractDate,
      sellDate: sell.contractDate,
      buyPsf: buy.pricePsf,
      sellPsf: sell.pricePsf,
      areaSqft: sell.areaSqft,
      holdingMonths: hm,
      profitAmount,
      profitPercent,
      annualisedReturn: cagr,
      holdingBucket: holdingBucket(hm),
      region: meta.region,
      district: meta.district,
      decade: decade(sell.contractDate ?? ""),
    });
  }

  console.log(`[stepMatchAndInsert] found ${rows.length} valid pairs`);

  // Batch insert
  let inserted = 0;
  const CHUNK = 500;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(transactionPairs).values(chunk as any);
    inserted += chunk.length;
  }

  console.log(`[stepMatchAndInsert] DONE inserted=${inserted}`);
  return inserted;
}
