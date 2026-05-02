import { eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { developers, projects } from "@/db/schema";
import { DISTRICT_NAMES } from "@/lib/districts";
import { toNumber } from "@/lib/format";
import type { Developer, Project } from "@/lib/types";

export async function getDevelopers(): Promise<Developer[]> {
  "use cache";
  cacheLife("max");
  cacheTag("developers");

  const rows = await db
    .select({
      id: developers.id,
      name: developers.name,
      slug: developers.slug,
      description: developers.description,
      website: developers.website,
      logoUrl: developers.logoUrl,
      projectCount: sql<number>`cast(count(${projects.id}) as integer)`,
      totalUnits: sql<number>`cast(coalesce(sum(${projects.totalUnits}), 0) as integer)`,
    })
    .from(developers)
    .leftJoin(projects, eq(developers.id, projects.developerId))
    .groupBy(developers.id)
    .orderBy(developers.name);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    website: r.website ?? "",
    logoUrl: r.logoUrl,
    projectCount: r.projectCount ?? 0,
    totalUnits: r.totalUnits ?? 0,
  }));
}

export async function getDeveloperBySlug(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag("developers", `developer:${slug}`);

  const result = await db.query.developers.findFirst({
    where: (d, { eq }) => eq(d.slug, slug),
    with: {
      projects: true,
    },
  });

  if (!result) return null;

  const developer: Developer = {
    id: result.id,
    name: result.name,
    slug: result.slug,
    description: result.description ?? "",
    website: result.website ?? "",
    logoUrl: result.logoUrl,
    projectCount: result.projects?.length ?? 0,
    totalUnits:
      result.projects?.reduce((sum, p) => sum + (p.totalUnits ?? 0), 0) ?? 0,
  };

  const devProjects: Project[] = (result.projects ?? []).map((p) => {
    const meta = p.districtNumber ? DISTRICT_NAMES[p.districtNumber] : null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      developerId: p.developerId ?? "",
      developerName: result.name,
      districtNumber: p.districtNumber ?? 0,
      region: p.region ?? meta?.region ?? "OCR",
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
    };
  });

  return { developer, projects: devProjects };
}

export async function getAllDeveloperSlugs() {
  "use cache";
  cacheLife("max");
  cacheTag("developers");

  return db
    .select({
      slug: developers.slug,
    })
    .from(developers);
}
