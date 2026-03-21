import { SectionHeader } from "@/components/section-header";
import { FeaturedCard } from "./featured-card";
import { featuredProjects } from "./mock-data";

export function FeaturedLaunches() {
  return (
    <section className="border-b-2 border-foreground bg-secondary px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Featured Launches"
          action={{ label: "VIEW ALL", href: "/new-launches" }}
        />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <FeaturedCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
