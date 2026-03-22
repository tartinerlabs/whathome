import { SectionHeader } from "@/components/section-header";
import { DISTRICT_NAMES } from "@/lib/constants/districts";
import { getFeaturedLaunches } from "@/lib/queries/projects";
import { FeaturedCard } from "./featured-card";

export async function FeaturedLaunches() {
  const projects = await getFeaturedLaunches(3);

  const featured = projects.map((p) => ({
    name: p.name,
    slug: p.slug,
    developer: p.developerName,
    area: DISTRICT_NAMES[p.districtNumber]?.name.split(",")[0] ?? "",
    region: p.region,
    psfFrom: 0,
    totalUnits: p.totalUnits,
  }));

  return (
    <section className="border-b-2 border-foreground bg-secondary px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Featured Launches"
          action={{ label: "VIEW ALL", href: "/new-launches" }}
        />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <FeaturedCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
