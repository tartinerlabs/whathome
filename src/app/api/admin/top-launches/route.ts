import { and, desc, eq, gt, ilike } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { developerSales, projects } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(_request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  // Find the latest refPeriod in developer_sales
  const [latestPeriod] = await db
    .select({ refPeriod: developerSales.refPeriod })
    .from(developerSales)
    .orderBy(desc(developerSales.refPeriod))
    .limit(1);

  if (!latestPeriod) {
    return Response.json([]);
  }

  const rows = await db
    .select({
      projectName: developerSales.projectName,
      developer: developerSales.developer,
      district: developerSales.district,
      unitsAvail: developerSales.unitsAvail,
      soldInMonth: developerSales.soldInMonth,
      soldToDate: developerSales.soldToDate,
      refPeriod: developerSales.refPeriod,
      projectId: projects.id,
      projectSlug: projects.slug,
      lastResearchedAt: projects.lastResearchedAt,
    })
    .from(developerSales)
    .leftJoin(projects, ilike(developerSales.projectName, projects.name))
    .where(
      and(
        eq(developerSales.refPeriod, latestPeriod.refPeriod),
        gt(developerSales.unitsAvail, 0),
      ),
    )
    .orderBy(desc(developerSales.soldInMonth))
    .limit(20);

  return Response.json(rows);
}
