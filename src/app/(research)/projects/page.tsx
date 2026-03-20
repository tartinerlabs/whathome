import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterBar } from "@/components/filter-bar";
import { SectionHeader } from "@/components/section-header";
import { projects } from "@/lib/mock-data";
import { ProjectGrid } from "./_components/project-grid";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse all Singapore new condo launches. Filter by region, district, tenure, and status to find your next property research target.",
};

export default function ProjectsPage() {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeader
          title="All Projects"
          meta={`${projects.length} PROJECTS`}
        />

        <Suspense>
          <FilterBar />
          <ProjectGrid />
        </Suspense>
      </div>
    </section>
  );
}
