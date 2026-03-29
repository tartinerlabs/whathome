import { desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import {
  medianRentals,
  projects,
  rentalContracts,
  transactions,
} from "@/db/schema";
import { mapBedroom } from "@/lib/bedroom/mapping";

export async function getRentalsByProject(projectId: string) {
  "use cache";
  cacheLife("max");
  cacheTag("rentals");

  return db
    .select({
      noOfBedRoom: rentalContracts.noOfBedRoom,
      rent: rentalContracts.rent,
      areaSqft: rentalContracts.areaSqft,
      leaseDate: rentalContracts.leaseDate,
    })
    .from(rentalContracts)
    .where(eq(rentalContracts.projectId, projectId))
    .orderBy(desc(rentalContracts.leaseDate))
    .limit(20);
}

export async function getMedianRentalByProject(projectName: string) {
  "use cache";
  cacheLife("max");
  cacheTag("rentals");

  const [latest] = await db
    .select({
      refPeriod: medianRentals.refPeriod,
      median: medianRentals.median,
      psf25: medianRentals.psf25,
      psf75: medianRentals.psf75,
    })
    .from(medianRentals)
    .where(eq(medianRentals.projectName, projectName))
    .orderBy(desc(medianRentals.refPeriod))
    .limit(1);

  return latest ?? null;
}

export interface RentalYieldRow {
  bedroom: string;
  medianRent: number;
  medianPrice: number;
  grossYield: number;
  rentalSample: number;
  txnSample: number;
}

export interface MarketRentalYieldRow {
  bedroom: string;
  region: string;
  grossYield: number;
  sampleSize: number;
}

/**
 * Gross rental yield by bedroom type for a single project.
 * grossYield = (medianMonthlyRent * 12) / medianTransactionPrice * 100
 */
export async function getRentalYieldByBedroom(
  projectId: string,
): Promise<RentalYieldRow[]> {
  "use cache";
  cacheLife("max");
  cacheTag("bedrooms:analytics", "rentals");

  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const cutoff = twoYearsAgo.toISOString().slice(0, 10);

  // Median monthly rent by bedroom type (last 24 months)
  const rentalMedians = await db
    .select({
      bedroom: rentalContracts.noOfBedRoom,
      medianRent: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${rentalContracts.rent})`,
      sample: sql<number>`count(*)::int`,
    })
    .from(rentalContracts)
    .where(
      sql`${rentalContracts.projectId} = ${projectId} AND ${rentalContracts.leaseDate} >= ${cutoff} AND ${rentalContracts.rent} IS NOT NULL`,
    )
    .groupBy(rentalContracts.noOfBedRoom);

  // Median transaction price by inferred bedroom type (last 24 months of resales)
  const txnMedians = await db
    .select({
      bedroom: transactions.inferredBedroomType,
      medianPrice: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${transactions.transactedPrice})`,
      sample: sql<number>`count(*)::int`,
    })
    .from(transactions)
    .where(
      sql`${transactions.projectId} = ${projectId} AND ${transactions.contractDate} >= ${cutoff} AND ${transactions.inferredBedroomType} IS NOT NULL AND ${transactions.saleType} = 'resale'`,
    )
    .groupBy(transactions.inferredBedroomType);

  // Index txn medians by bedroom
  const txnByBedroom = new Map<
    string,
    { medianPrice: number; sample: number }
  >();
  for (const row of txnMedians) {
    if (row.bedroom) {
      txnByBedroom.set(row.bedroom, {
        medianPrice: Number(row.medianPrice),
        sample: row.sample,
      });
    }
  }

  const results: RentalYieldRow[] = [];

  for (const r of rentalMedians) {
    const mapped = mapBedroom(r.bedroom);
    if (!mapped) continue;
    const txn = txnByBedroom.get(mapped);
    if (!txn) continue;
    const grossYield =
      txn.medianPrice > 0
        ? (Number(r.medianRent) * 12 * 100) / txn.medianPrice
        : null;

    if (grossYield !== null) {
      results.push({
        bedroom: mapped,
        medianRent: Number(r.medianRent),
        medianPrice: txn.medianPrice,
        grossYield,
        rentalSample: r.sample,
        txnSample: txn.sample,
      });
    }
  }

  return results;
}

/**
 * Market-wide gross rental yield by bedroom type and region.
 */
export async function getMarketRentalYieldByBedroom(
  _region?: string,
): Promise<MarketRentalYieldRow[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("bedrooms:analytics", "rentals");

  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const cutoff = twoYearsAgo.toISOString().slice(0, 10);

  // Rental medians by bedroom and region
  const rentalRows = await db
    .select({
      bedroom: rentalContracts.noOfBedRoom,
      region: projects.region,
      medianRent: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${rentalContracts.rent})`,
      sample: sql<number>`count(*)::int`,
    })
    .from(rentalContracts)
    .leftJoin(projects, eq(rentalContracts.projectId, projects.id))
    .where(
      sql`${rentalContracts.leaseDate} >= ${cutoff} AND ${rentalContracts.rent} IS NOT NULL`,
    )
    .groupBy(rentalContracts.noOfBedRoom, projects.region);

  // Transaction price medians by bedroom and region
  const txnPrices = await db
    .select({
      bedroom: transactions.inferredBedroomType,
      region: projects.region,
      medianPrice: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${transactions.transactedPrice})`,
    })
    .from(transactions)
    .leftJoin(projects, eq(transactions.projectId, projects.id))
    .where(
      sql`${transactions.contractDate} >= ${cutoff} AND ${transactions.inferredBedroomType} IS NOT NULL AND ${transactions.saleType} = 'resale'`,
    )
    .groupBy(transactions.inferredBedroomType, projects.region);

  const priceByKey = new Map<string, number>();
  for (const row of txnPrices) {
    if (row.bedroom && row.region) {
      priceByKey.set(`${row.bedroom}::${row.region}`, Number(row.medianPrice));
    }
  }

  const results: MarketRentalYieldRow[] = [];

  for (const row of rentalRows) {
    const mapped = mapBedroom(row.bedroom);
    if (!mapped || !row.region) continue;
    const key = `${mapped}::${row.region}`;
    const medianPrice = priceByKey.get(key);
    if (!medianPrice || medianPrice === 0) continue;
    const grossYield = (Number(row.medianRent) * 12 * 100) / medianPrice;
    results.push({
      bedroom: mapped,
      region: row.region,
      grossYield,
      sampleSize: row.sample,
    });
  }

  return results;
}
