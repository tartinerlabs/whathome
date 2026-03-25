import { ilike, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { developers, projects } from "@/db/schema";
import { toTsQuery } from "@/lib/search";

interface SearchResult {
  type: "project" | "developer";
  label: string;
  href: string;
  meta: string;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  "use cache";
  cacheLife("max");
  cacheTag("projects", "developers");

  const tsQuery = toTsQuery(query);

  const [projectResults, developerResults] = await Promise.all([
    searchProjects(tsQuery),
    searchDevelopers(query),
  ]);

  return [
    ...projectResults.map((project) => ({
      type: "project" as const,
      label: project.name,
      href: `/projects/${project.slug}`,
      meta: `D${project.districtNumber} · ${project.region ?? ""}`,
    })),
    ...developerResults.map((developer) => ({
      type: "developer" as const,
      label: developer.name,
      href: `/developers/${developer.slug}`,
      meta: "",
    })),
  ];
}

async function searchProjects(tsQuery: string | null) {
  if (!tsQuery) return [];

  return db
    .select({
      name: projects.name,
      slug: projects.slug,
      districtNumber: projects.districtNumber,
      region: projects.region,
    })
    .from(projects)
    .where(sql`${projects.searchVector} @@ to_tsquery('english', ${tsQuery})`)
    .orderBy(
      sql`ts_rank(${projects.searchVector}, to_tsquery('english', ${tsQuery})) desc`,
    )
    .limit(6);
}

async function searchDevelopers(query: string) {
  return db
    .select({
      name: developers.name,
      slug: developers.slug,
    })
    .from(developers)
    .where(ilike(developers.name, `%${query}%`))
    .limit(4);
}
