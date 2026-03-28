import { desc } from "drizzle-orm";
import type { Route } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { auth } from "@/lib/auth";
import { TriggerButton } from "../components/trigger-buttons";

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight">
          Projects
        </h1>
        <TriggerButton
          endpoint="/api/workflows/backfill"
          label="Backfill Unresearched"
          body={{ batchSize: 10 }}
        />
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ProjectsTable />
      </Suspense>
    </div>
  );
}

async function ProjectsTable() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      districtNumber: projects.districtNumber,
      region: projects.region,
      totalUnits: projects.totalUnits,
      lastResearchedAt: projects.lastResearchedAt,
    })
    .from(projects)
    .orderBy(desc(projects.updatedAt))
    .limit(100);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>District</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Units</TableHead>
          <TableHead>Researched</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="max-w-[250px] truncate text-xs font-medium">
              <Link
                href={`/projects/${project.slug}` as Route}
                className="underline"
              >
                {project.name}
              </Link>
            </TableCell>
            <TableCell className="font-mono text-xs">
              D{project.districtNumber ?? "\u2014"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {project.region ?? "\u2014"}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {project.totalUnits ?? "\u2014"}
            </TableCell>
            <TableCell>
              {project.lastResearchedAt ? (
                <Badge variant="outline">
                  {project.lastResearchedAt.toLocaleDateString("en-SG")}
                </Badge>
              ) : (
                <Badge variant="destructive">No</Badge>
              )}
            </TableCell>
            <TableCell className="flex gap-1">
              <TriggerButton
                endpoint="/api/workflows/research"
                label="Research"
                body={{ projectId: project.id }}
              />
              <Link
                href={`/dashboard/projects/${project.id}/edit` as Route}
                className="inline-flex h-7 items-center rounded-none border border-border px-2.5 font-mono text-xs hover:bg-muted"
              >
                Edit
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
