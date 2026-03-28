import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectHeroProps {
  project: Project;
  developerSlug: string;
}

const regionColours: Record<Project["region"], string> = {
  CCR: "bg-chart-1 text-white",
  RCR: "bg-chart-3 text-white",
  OCR: "bg-chart-5 text-white",
};

export function ProjectHero({ project, developerSlug }: ProjectHeroProps) {
  const soldPercentage = Math.round(
    (project.unitsSold / project.totalUnits) * 100,
  );

  return (
    <section className="border-b-2 border-foreground px-6 py-12 md:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <h1 className="font-sans text-3xl font-bold tracking-tight md:text-4xl">
            {project.name}
          </h1>
          <p className="text-muted-foreground">
            by{" "}
            <a
              href={`/developers/${developerSlug}`}
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              {project.developerName}
            </a>{" "}
            · {project.address}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            className={cn(
              "rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-wider",
              regionColours[project.region],
            )}
          >
            {project.region}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-wider"
          >
            {project.tenure}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-wider"
          >
            D{project.districtNumber}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="border-2 border-foreground p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Units
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">
              {project.totalUnits.toLocaleString()}
            </p>
          </div>
          <div className="border-2 border-foreground p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Units Sold
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">
              {project.unitsSold.toLocaleString()}{" "}
              <span className="text-sm text-muted-foreground">
                ({soldPercentage}%)
              </span>
            </p>
          </div>
          <div className="border-2 border-foreground p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              TOP
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">
              {project.topDate}
            </p>
          </div>
          <div className="border-2 border-foreground p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Site Area
            </p>
            <p className="mt-1 font-mono text-2xl font-bold">
              {project.siteArea
                ? `${project.siteArea.toLocaleString()} sqm`
                : "—"}
            </p>
          </div>
        </div>

        {project.description && (
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}
      </div>
    </section>
  );
}
