import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  min,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { developers, projects, transactions } from "@/db/schema";
import { DISTRICT_NAMES } from "@/lib/districts";
import { parseRawTenure, toNumber } from "@/lib/format";
import { svy21ToWgs84 } from "@/lib/geo";
import { toTsQuery } from "@/lib/search";
import { slugify } from "@/lib/slug";
import type { Project, UnitMixRow } from "@/lib/types";

function mapProjectRow(
  row: typeof projects.$inferSelect,
  developer: typeof developers.$inferSelect | null,
): Project {
  const meta = row.districtNumber ? DISTRICT_NAMES[row.districtNumber] : null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    developerId: row.developerId ?? "",
    developerName: developer?.name ?? "Unknown Developer",
    districtNumber: row.districtNumber ?? 0,
    region: row.region ?? meta?.region ?? "OCR",
    address: row.address ?? "",
    postalCode: row.postalCode ?? "",
    tenure: (row.tenure?.replace(/_/g, "-") as Project["tenure"]) ?? "99-year",
    tenureYears: row.tenureYears,
    totalUnits: row.totalUnits ?? 0,
    unitsSold: row.unitsSold ?? 0,
    launchDate: row.launchDate ?? "",

    topDate: row.topDate ?? "TBC",

    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    siteArea: toNumber(row.siteArea) || null,
    plotRatio: toNumber(row.plotRatio) || null,
    description: row.description ?? "",
    aiSummary: row.aiSummary,
  };
}

export interface ProjectFilters {
  q?: string | null;
  regions?: string[];
  district?: number | null;
  tenures?: string[];
  page?: number;
  pageSize?: number;
}

export async function getProjects(filters: ProjectFilters = {}) {
  "use cache";
  cacheLife("max");
  cacheTag("projects");

  const { page = 1, pageSize = 20 } = filters;
  const conditions: (SQL | undefined)[] = [];

  if (filters.q) {
    const tsQuery = toTsQuery(filters.q);
    if (tsQuery) {
      conditions.push(
        sql`${projects.searchVector} @@ to_tsquery('english', ${tsQuery})`,
      );
    }
  }

  if (filters.regions?.length) {
    conditions.push(
      inArray(projects.region, filters.regions as ("CCR" | "RCR" | "OCR")[]),
    );
  }

  if (filters.district) {
    conditions.push(eq(projects.districtNumber, filters.district));
  }

  if (filters.tenures?.length) {
    const dbTenures = filters.tenures.map((t) => t.replace(/-/g, "_"));
    conditions.push(inArray(projects.tenure, dbTenures as any[]));
  }

  const whereClause = conditions.length
    ? and(...conditions.filter(Boolean))
    : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(projects)
      .leftJoin(developers, eq(projects.developerId, developers.id))
      .where(whereClause)
      .orderBy(desc(projects.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(projects)
      .where(whereClause),
  ]);

  return {
    items: rows.map((r) => mapProjectRow(r.projects, r.developers)),
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((countResult[0]?.count ?? 0) / pageSize),
  };
}

export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(`project:${slug}`);

  const result = await db.query.projects.findFirst({
    where: (p, { eq }) => eq(p.slug, slug),
    with: {
      developer: true,
      units: { orderBy: (u, { asc }) => asc(u.unitType) },
      nearbyAmenities: { orderBy: (a, { asc }) => asc(a.distanceMeters) },
      images: { orderBy: (i, { asc }) => asc(i.sortOrder) },
    },
  });

  if (!result) return null;

  return {
    project: mapProjectRow(result, result.developer),
    units: (result.units ?? []).map((u) => ({
      unitType: u.unitType as UnitMixRow["unitType"],
      sizeSqftMin: u.sizeSqftMin ?? 0,
      sizeSqftMax: u.sizeSqftMax ?? 0,
      pricePsf: toNumber(u.pricePsf),
      priceFrom: u.priceFrom ?? 0,
      priceTo: u.priceTo ?? 0,
      totalCount: u.totalCount ?? 0,
      soldCount: u.soldCount ?? 0,
    })),
    amenities: (result.nearbyAmenities ?? []).map((a) => ({
      id: a.id,
      amenityType: a.amenityType,
      name: a.name,
      distanceMeters: a.distanceMeters ?? 0,
      walkMinutes: a.walkMinutes ?? 0,
    })),
    images: result.images ?? [],
    developerSlug: result.developer?.slug ?? "",
  };
}

async function getLaunchesByEarliestContract(limit: number) {
  const earliestContractDate = min(transactions.contractDate).as(
    "earliest_contract_date",
  );

  const rows = await db
    .select({
      projects,
      developers,
      earliestContractDate,
    })
    .from(projects)
    .leftJoin(developers, eq(projects.developerId, developers.id))
    .leftJoin(
      transactions,
      and(
        eq(transactions.projectId, projects.id),
        eq(transactions.saleType, "new_sale"),
      ),
    )
    .groupBy(projects.id, developers.id)
    .orderBy(desc(earliestContractDate))
    .limit(limit);

  return rows.map((r) => mapProjectRow(r.projects, r.developers));
}

export async function getNewLaunches(limit = 50) {
  "use cache";
  cacheLife("max");
  cacheTag("projects");

  return getLaunchesByEarliestContract(limit);
}

export async function getFeaturedLaunches(limit = 3) {
  "use cache";
  cacheLife("max");
  cacheTag("projects");

  return getLaunchesByEarliestContract(limit);
}

export async function getAllProjectSlugs() {
  "use cache";
  cacheLife("max");
  cacheTag("projects");

  const rows = await db.select({ slug: projects.slug }).from(projects);

  // Cache Components requires at least one result from generateStaticParams
  if (!rows.length) return [{ slug: "__placeholder__" }];

  return rows.map((r) => ({ slug: r.slug }));
}

// --- Write queries (used by ingestion workflow) ---

interface ProjectStubInput {
  name: string;
  district: number;
  marketSegment: string | null;
  svyX: number | null;
  svyY: number | null;
  tenureString?: string | null;
}

/**
 * Find a project by name, or create a stub if it does not exist.
 * Returns the project ID and slug.
 */
export async function findOrCreateProject(
  input: ProjectStubInput,
): Promise<{ id: string; slug: string; isNew: boolean }> {
  const slug = slugify(input.name);

  const existing = await db
    .select({ id: projects.id, slug: projects.slug })
    .from(projects)
    .where(or(ilike(projects.name, input.name), eq(projects.slug, slug)))
    .limit(1);

  if (existing.length > 0) {
    const { id, slug: existingSlug } = existing[0];
    const region = DISTRICT_NAMES[input.district]?.region ?? null;
    const tenure = parseRawTenure(input.tenureString);

    await db
      .update(projects)
      .set({
        ...(region && { region }),
        ...(tenure && { tenure }),
      })
      .where(
        and(
          eq(projects.id, id),
          or(isNull(projects.region), isNull(projects.tenure)),
        ),
      );

    return { id, slug: existingSlug, isNew: false };
  }

  // Convert SVY21 → WGS84 if coordinates available
  let latitude: string | null = null;
  let longitude: string | null = null;
  if (input.svyX && input.svyY) {
    const coords = svy21ToWgs84(input.svyX, input.svyY);
    latitude = String(coords.latitude);
    longitude = String(coords.longitude);
  }

  const region = DISTRICT_NAMES[input.district]?.region ?? null;
  const tenure = parseRawTenure(input.tenureString);

  const [inserted] = await db
    .insert(projects)
    .values({
      name: input.name,
      slug,
      districtNumber: input.district,
      region,
      tenure,
      marketSegment: input.marketSegment,
      svyX: input.svyX ? String(input.svyX) : null,
      svyY: input.svyY ? String(input.svyY) : null,
      latitude,
      longitude,
    })
    .returning({ id: projects.id, slug: projects.slug });

  return { id: inserted.id, slug: inserted.slug, isNew: true };
}
