import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { SectionHeader } from "@/components/section-header";
import { projects } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "New Launches",
  description:
    "Discover upcoming and recently launched new condos in Singapore. Be the first to research the latest property launches.",
};

export default function NewLaunchesPage() {
  const newLaunches = projects.filter(
    (p) =>
      p.status === "upcoming" ||
      p.status === "launched" ||
      p.status === "selling",
  );

  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeader title="New Launches" meta="UPCOMING & LAUNCHED" />

        <p className="max-w-2xl font-mono text-sm text-muted-foreground">
          Discover the latest new condo launches in Singapore. Be the first to
          research upcoming projects.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newLaunches.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
