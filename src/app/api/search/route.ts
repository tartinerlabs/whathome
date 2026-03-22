import { ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { developers, projects } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return Response.json([]);
  }

  const pattern = `%${q}%`;

  const [projectResults, developerResults] = await Promise.all([
    db
      .select({
        name: projects.name,
        slug: projects.slug,
        districtNumber: projects.districtNumber,
        region: projects.region,
      })
      .from(projects)
      .where(
        or(ilike(projects.name, pattern), ilike(projects.address, pattern)),
      )
      .limit(6),
    db
      .select({
        name: developers.name,
        slug: developers.slug,
      })
      .from(developers)
      .where(ilike(developers.name, pattern))
      .limit(4),
  ]);

  const results = [
    ...projectResults.map((p) => ({
      type: "project" as const,
      label: p.name,
      href: `/projects/${p.slug}`,
      meta: `D${p.districtNumber} · ${p.region ?? ""}`,
    })),
    ...developerResults.map((d) => ({
      type: "developer" as const,
      label: d.name,
      href: `/developers/${d.slug}`,
      meta: "",
    })),
  ];

  return Response.json(results);
}
