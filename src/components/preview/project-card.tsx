import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProjectCardData, ThemeVariant } from "./types";
import { variantStyles } from "./variant-styles";

interface ProjectCardProps {
  project: ProjectCardData;
  variant: ThemeVariant;
}

const statusLabels: Record<ProjectCardData["status"], string> = {
  upcoming: "Upcoming",
  launched: "Launched",
  selling: "Selling",
  sold_out: "Sold Out",
  completed: "Completed",
};

const regionColours: Record<ProjectCardData["region"], string> = {
  CCR: "bg-chart-1 text-white",
  RCR: "bg-chart-3 text-white",
  OCR: "bg-chart-5 text-white",
};

export function ProjectCard({ project, variant }: ProjectCardProps) {
  const styles = variantStyles[variant];
  const soldPercentage = Math.round(
    (project.unitsSold / project.totalUnits) * 100,
  );

  return (
    <Card className={cn(styles.card, "gap-0")}>
      {/* Thumbnail placeholder */}
      <div
        className={cn(
          "h-40 bg-muted flex items-center justify-center",
          variant === "full"
            ? "border-b-2 border-foreground"
            : "border-b border-border",
        )}
      >
        <span className={cn("text-muted-foreground", styles.label)}>
          {project.name}
        </span>
      </div>

      <CardHeader className={cn(styles.cardHeader, "gap-2 py-3")}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={cn(styles.heading, "text-sm leading-tight")}>
            {project.name}
          </CardTitle>
          <Badge className={cn(styles.badge, regionColours[project.region])}>
            {project.region}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          by {project.developer} · D{project.district}
        </p>
      </CardHeader>

      <CardContent className="py-3 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className={cn(styles.label, "text-muted-foreground")}>
            PSF Range
          </span>
          <span className="font-mono font-semibold text-sm">
            ${project.psfMin.toLocaleString()} – $
            {project.psfMax.toLocaleString()}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className={cn(styles.label, "text-muted-foreground")}>TOP</span>
          <span className="font-mono text-sm">{project.topDate}</span>
        </div>

        {/* Sales progress bar */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className={cn(styles.label, "text-muted-foreground")}>
              Units Sold
            </span>
            <span className="font-mono text-xs">
              {project.unitsSold}/{project.totalUnits} ({soldPercentage}%)
            </span>
          </div>
          <div
            className={cn(
              "h-2 w-full bg-muted overflow-hidden",
              variant === "full" ? "border border-foreground" : "rounded-full",
            )}
          >
            <div
              className={cn(
                "h-full bg-foreground transition-all",
                variant === "soft" && "rounded-full",
              )}
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter
        className={cn(
          "py-2 px-4 flex items-center justify-between",
          variant === "full"
            ? "border-t-2 border-foreground"
            : "border-t border-border",
        )}
      >
        <Badge variant="outline" className={cn(styles.badge)}>
          {project.tenure}
        </Badge>
        <Badge
          variant="secondary"
          className={cn(
            styles.badge,
            project.status === "selling" && "bg-success/20 text-success",
            project.status === "sold_out" &&
              "bg-destructive/10 text-destructive",
          )}
        >
          {statusLabels[project.status]}
        </Badge>
      </CardFooter>
    </Card>
  );
}
