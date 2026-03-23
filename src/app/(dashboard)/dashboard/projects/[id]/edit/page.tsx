import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { auth } from "@/lib/auth";
import { revalidateProject } from "@/lib/cache";

async function updateProject(formData: FormData) {
  "use server";

  const projectId = formData.get("projectId") as string;
  const slug = formData.get("slug") as string;

  const updates: Record<string, unknown> = {};

  const fields = [
    "address",
    "postalCode",
    "tenure",
    "topDate",
    "launchDate",
    "description",
  ] as const;

  for (const field of fields) {
    const value = formData.get(field) as string;
    if (value) updates[field] = value;
  }

  const numericFields = ["totalUnits", "unitsSold", "tenureYears"] as const;
  for (const field of numericFields) {
    const value = formData.get(field) as string;
    if (value) updates[field] = Number.parseInt(value, 10);
  }

  const status = formData.get("status") as string;
  if (status) updates.status = status;

  if (Object.keys(updates).length) {
    await db.update(projects).set(updates).where(eq(projects.id, projectId));
    revalidateProject(slug);
  }

  redirect("/dashboard/projects");
}

export function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/projects"
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          &larr; All Projects
        </Link>
        <h1 className="font-sans text-2xl font-extrabold tracking-tight">
          Edit Project
        </h1>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <EditForm projectId={id} />
      </Suspense>
    </div>
  );
}

async function EditForm({ projectId }: { projectId: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-sm">{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateProject} className="space-y-4">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="slug" value={project.slug} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={project.address ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={project.postalCode ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure</Label>
              <select
                id="tenure"
                name="tenure"
                defaultValue={project.tenure ?? ""}
                className="flex h-8 w-full rounded-none border border-border bg-background px-2.5 font-mono text-xs"
              >
                <option value="">Unknown</option>
                <option value="freehold">Freehold</option>
                <option value="99_year">99-year</option>
                <option value="999_year">999-year</option>
                <option value="103_year">103-year</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenureYears">Tenure Years</Label>
              <Input
                id="tenureYears"
                name="tenureYears"
                type="number"
                defaultValue={project.tenureYears ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={project.status ?? ""}
                className="flex h-8 w-full rounded-none border border-border bg-background px-2.5 font-mono text-xs"
              >
                <option value="upcoming">Upcoming</option>
                <option value="launched">Launched</option>
                <option value="selling">Selling</option>
                <option value="sold_out">Sold Out</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="totalUnits">Total Units</Label>
              <Input
                id="totalUnits"
                name="totalUnits"
                type="number"
                defaultValue={project.totalUnits ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitsSold">Units Sold</Label>
              <Input
                id="unitsSold"
                name="unitsSold"
                type="number"
                defaultValue={project.unitsSold ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="launchDate">Launch Date</Label>
              <Input
                id="launchDate"
                name="launchDate"
                type="date"
                defaultValue={project.launchDate ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topDate">TOP Date</Label>
              <Input
                id="topDate"
                name="topDate"
                type="date"
                defaultValue={project.topDate ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={project.description ?? ""}
              className="flex w-full rounded-none border border-border bg-background px-3 py-2 font-mono text-xs"
            />
          </div>

          {project.aiSummary && (
            <div className="space-y-2">
              <Label>AI Summary (read-only)</Label>
              <pre className="overflow-auto whitespace-pre-wrap rounded-none border border-border bg-muted/30 p-3 font-mono text-xs">
                {project.aiSummary}
              </pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit">Save Changes</Button>
            <Link
              href="/dashboard/projects"
              className="inline-flex h-8 items-center rounded-none border border-border px-2.5 font-mono text-xs hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
