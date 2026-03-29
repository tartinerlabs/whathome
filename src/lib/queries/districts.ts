import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { projects, transactions } from "@/db/schema";
import { DISTRICT_NAMES } from "@/lib/districts";
import { toNumber } from "@/lib/format";
import type { DistrictInfo, Project } from "@/lib/types";

export async function getDistrictStats(): Promise<DistrictInfo[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("districts");
  const projectCounts = await db
    .select({
      districtNumber: projects.districtNumber,
      projectCount: sql<number>`cast(count(*) as integer)`,
    })
    .from(projects)
    .groupBy(projects.districtNumber);

  const txnStats = await db
    .select({
      district: transactions.district,
      avgPsf: sql<string>`cast(avg(${transactions.pricePsf}) as numeric)`,
      medianPrice: sql<string>`cast(percentile_cont(0.5) within group (order by ${transactions.transactedPrice}) as numeric)`,
    })
    .from(transactions)
    .groupBy(transactions.district);

  const projectMap = new Map(
    projectCounts.map((r) => [r.districtNumber, r.projectCount]),
  );
  const txnMap = new Map(
    txnStats.map((r) => [
      r.district,
      { avgPsf: r.avgPsf, medianPrice: r.medianPrice },
    ]),
  );

  return Object.entries(DISTRICT_NAMES).map(([num, meta]) => {
    const d = Number(num);
    const txn = txnMap.get(d);

    return {
      number: d,
      name: meta.name,
      region: meta.region,
      projectCount: projectMap.get(d) ?? 0,
      avgPsf: toNumber(txn?.avgPsf),
      medianPrice: toNumber(txn?.medianPrice),
    };
  });
}

export async function getDistrictByNumber(districtNumber: number) {
  "use cache";
  cacheLife("max");
  cacheTag("districts", `district:${districtNumber}`);

  const meta = DISTRICT_NAMES[districtNumber];
  if (!meta) return null;

  const [stats, districtProjects] = await Promise.all([
    db
      .select({
        avgPsf: sql<string>`cast(avg(${transactions.pricePsf}) as numeric)`,
        medianPrice: sql<string>`cast(percentile_cont(0.5) within group (order by ${transactions.transactedPrice}) as numeric)`,
      })
      .from(transactions)
      .where(eq(transactions.district, districtNumber)),
    db.query.projects.findMany({
      where: (p, { eq }) => eq(p.districtNumber, districtNumber),
      with: { developer: true },
    }),
  ]);

  const district: DistrictInfo = {
    number: districtNumber,
    name: meta.name,
    region: meta.region,
    projectCount: districtProjects.length,
    avgPsf: toNumber(stats[0]?.avgPsf),
    medianPrice: toNumber(stats[0]?.medianPrice),
  };

  const projectList: Project[] = districtProjects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    developerId: p.developerId ?? "",
    developerName: p.developer?.name ?? "Unknown Developer",
    districtNumber: p.districtNumber ?? 0,
    region: p.region ?? meta.region,
    address: p.address ?? "",
    postalCode: p.postalCode ?? "",
    tenure: (p.tenure?.replace(/_/g, "-") as Project["tenure"]) ?? "99-year",
    tenureYears: p.tenureYears,
    totalUnits: p.totalUnits ?? 0,
    unitsSold: p.unitsSold ?? 0,
    launchDate: p.launchDate ?? "",

    topDate: p.topDate ?? "TBC",

    latitude: toNumber(p.latitude),
    longitude: toNumber(p.longitude),
    siteArea: toNumber(p.siteArea) || null,
    plotRatio: toNumber(p.plotRatio) || null,
    description: p.description ?? "",
    aiSummary: p.aiSummary,
  }));

  return { district, projects: projectList };
}
