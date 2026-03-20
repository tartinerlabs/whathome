import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import {
  districts,
  getDistrictByNumber,
  getProjectsByDistrict,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const regionColours: Record<string, string> = {
  CCR: "bg-chart-1 text-white",
  RCR: "bg-chart-3 text-white",
  OCR: "bg-chart-5 text-white",
};

export function generateStaticParams() {
  return districts.map((d) => ({ number: String(d.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const district = getDistrictByNumber(Number.parseInt(number, 10));
  if (!district) return { title: "District Not Found" };

  return {
    title: `District ${district.number} — ${district.name}`,
    description: `D${district.number} ${district.name} (${district.region}) — ${district.projectCount} projects, average $${district.avgPsf.toLocaleString()} psf.`,
  };
}

export default async function DistrictDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const districtNum = Number.parseInt(number, 10);
  const district = getDistrictByNumber(districtNum);
  if (!district) notFound();

  const districtProjects = getProjectsByDistrict(districtNum);

  return (
    <>
      <section className="border-b-2 border-foreground px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-5xl font-bold">
              D{district.number}
            </span>
            <div>
              <h1 className="font-sans text-2xl font-bold tracking-tight">
                {district.name}
              </h1>
              <Badge
                className={cn(
                  "mt-1 rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-wider",
                  regionColours[district.region],
                )}
              >
                {district.region}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="border-2 border-foreground p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Projects
              </p>
              <p className="mt-1 font-mono text-2xl font-bold">
                {district.projectCount}
              </p>
            </div>
            <div className="border-2 border-foreground p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Average PSF
              </p>
              <p className="mt-1 font-mono text-2xl font-bold">
                ${district.avgPsf.toLocaleString()}
              </p>
            </div>
            <div className="border-2 border-foreground p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Median Price
              </p>
              <p className="mt-1 font-mono text-2xl font-bold">
                ${(district.medianPrice / 1_000_000).toFixed(2)}M
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeader
            title={`Projects in District ${district.number}`}
            meta={`${districtProjects.length} PROJECTS`}
          />

          {districtProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {districtProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-foreground p-12 text-center">
              <p className="text-muted-foreground">
                No projects currently tracked in this district. Check back after
                the next data ingestion run.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
