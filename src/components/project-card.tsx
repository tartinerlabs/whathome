import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SharedTransition } from "./transitions";

interface ProjectCardProps {
  project: Project;
}

const regionColours: Record<Project["region"], string> = {
  CCR: "bg-chart-1 text-white",
  RCR: "bg-chart-3 text-white",
  OCR: "bg-chart-5 text-white",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const soldPercentage = Math.round(
    (project.unitsSold / project.totalUnits) * 100,
  );

  return (
    <Link
      href={`/projects/${project.slug}`}
      transitionTypes={["transition-to-detail"]}
      className="group block"
    >
      <Card className="gap-0 border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--foreground)] transition-shadow group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
        <SharedTransition name={`project-image-${project.slug}`}>
          <div className="h-40 bg-muted flex items-center justify-center border-b-2 border-foreground">
            <span className="uppercase font-bold tracking-wide text-[10px] text-muted-foreground">
              {project.name}
            </span>
          </div>
        </SharedTransition>

        <CardHeader className="border-b-2 border-foreground gap-2 py-3">
          <div className="flex items-start justify-between gap-2">
            <SharedTransition name={`project-title-${project.slug}`}>
              <CardTitle className="uppercase font-bold tracking-wide text-sm leading-tight">
                {project.name}
              </CardTitle>
            </SharedTransition>
            <Badge
              className={cn(
                "rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-wider",
                regionColours[project.region],
              )}
            >
              {project.region}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            by {project.developerName} · D{project.districtNumber}
          </p>
        </CardHeader>

        <CardContent className="py-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="uppercase font-bold tracking-wide text-[10px] text-muted-foreground">
              PSF Range
            </span>
            <span className="font-mono font-semibold text-sm">
              $
              {project.slug === "the-collective-at-one-sophia"
                ? "2,480"
                : Math.min(
                    ...[project.unitsSold > 0 ? 1000 : 2480],
                  ).toLocaleString()}{" "}
              psf
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="uppercase font-bold tracking-wide text-[10px] text-muted-foreground">
              TOP
            </span>
            <span className="font-mono text-sm">{project.topDate}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="uppercase font-bold tracking-wide text-[10px] text-muted-foreground">
                Units Sold
              </span>
              <span className="font-mono text-xs">
                {project.unitsSold}/{project.totalUnits} ({soldPercentage}%)
              </span>
            </div>
            <div className="h-2 w-full bg-muted overflow-hidden border border-foreground">
              <div
                className="h-full bg-foreground transition-all"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="py-2 px-4 flex items-center justify-between border-t-2 border-foreground">
          <Badge
            variant="outline"
            className="rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-wider"
          >
            {project.tenure}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
