import type { Metadata } from "next";
import { Suspense } from "react";
import { getProjects } from "@/lib/queries/projects";
import { ProjectComparison } from "./components/project-comparison";

export const metadata: Metadata = {
  title: "Compare Projects",
  description:
    "Compare Singapore new condo launches side by side. Analyse pricing, unit mix, PSF trends, and key metrics across 2–3 projects.",
};

export default async function ComparePage() {
  const { items } = await getProjects({ pageSize: 100 });

  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight">
            Compare Projects
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select 2–3 projects to compare side by side.
          </p>
        </div>

        <Suspense>
          <ProjectComparison projects={items} />
        </Suspense>
      </div>
    </section>
  );
}
