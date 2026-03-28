import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  developerSales,
  developers,
  pipelineProjects,
  projects,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  developerSlug,
  normaliseDeveloperNames,
} from "@/lib/developers/normalize";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 1. Collect all distinct SPV names from both tables
  const salesNames = await db
    .selectDistinct({ name: developerSales.developer })
    .from(developerSales);

  const pipelineNames = await db
    .selectDistinct({ name: pipelineProjects.developerName })
    .from(pipelineProjects);

  const allSpvNames = [
    ...new Set([
      ...salesNames.map((row) => row.name).filter(Boolean),
      ...pipelineNames.map((row) => row.name).filter(Boolean),
    ]),
  ] as string[];

  // 2. Normalise SPV names → parent brands
  const spvToBrand = normaliseDeveloperNames(allSpvNames);

  // 3. Insert unique brands into developers table
  const uniqueBrands = [...new Set(spvToBrand.values())];
  let developersCreated = 0;
  const brandToId = new Map<string, string>();

  for (const brand of uniqueBrands) {
    const slug = developerSlug(brand);

    const [existing] = await db
      .select({ id: developers.id })
      .from(developers)
      .where(eq(developers.slug, slug))
      .limit(1);

    if (existing) {
      brandToId.set(brand, existing.id);
      continue;
    }

    const [inserted] = await db
      .insert(developers)
      .values({ name: brand, slug })
      .returning({ id: developers.id });

    brandToId.set(brand, inserted.id);
    developersCreated++;
  }

  // 4. Build SPV → developer ID lookup
  const spvToDevId = new Map<string, string>();
  for (const [spvName, brand] of spvToBrand) {
    const developerid = brandToId.get(brand);
    if (developerid) {
      spvToDevId.set(spvName.toUpperCase(), developerid);
    }
  }

  // 5. Link projects to developers via developer_sales / pipeline_projects
  let projectsLinked = 0;

  const unlinkedProjects = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(sql`${projects.developerId} IS NULL`);

  for (const project of unlinkedProjects) {
    // Try developer_sales first (more recent data)
    const [sale] = await db
      .select({ developer: developerSales.developer })
      .from(developerSales)
      .where(eq(developerSales.projectName, project.name))
      .limit(1);

    if (sale?.developer) {
      const developerId = spvToDevId.get(sale.developer.toUpperCase());
      if (developerId) {
        await db
          .update(projects)
          .set({ developerId })
          .where(eq(projects.id, project.id));
        projectsLinked++;
        continue;
      }
    }

    // Fallback to pipeline_projects
    const [pipeline] = await db
      .select({ developerName: pipelineProjects.developerName })
      .from(pipelineProjects)
      .where(eq(pipelineProjects.projectName, project.name))
      .limit(1);

    if (pipeline?.developerName) {
      const developerId = spvToDevId.get(pipeline.developerName.toUpperCase());
      if (developerId) {
        await db
          .update(projects)
          .set({ developerId })
          .where(eq(projects.id, project.id));
        projectsLinked++;
      }
    }
  }

  return Response.json({
    spvNames: allSpvNames.length,
    uniqueBrands: uniqueBrands.length,
    developersCreated,
    projectsLinked,
    unlinkedProjects: unlinkedProjects.length,
  });
}
