import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterBar } from "@/components/filter-bar";
import { SectionHeader } from "@/components/section-header";
import { getProjects } from "@/lib/queries/projects";
import { ProjectGrid } from "./components/project-grid";
import { loadSearchParams } from "./search-params";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse all Singapore new condo launches. Filter by region, district, tenure, and status to find your next property research target.",
};

async function ProjectResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await loadSearchParams(searchParams);
  const { items, total } = await getProjects(filters);

  return (
    <>
      <SectionHeader title="All Projects" meta={`${total} PROJECTS`} />
      <ProjectGrid projects={items} />
    </>
  );
}

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <FilterBar />
        <Suspense
          fallback={<SectionHeader title="All Projects" meta="LOADING..." />}
        >
          <ProjectResults searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
