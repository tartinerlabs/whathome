import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { medianRentals, rentalContracts } from "@/db/schema";

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
