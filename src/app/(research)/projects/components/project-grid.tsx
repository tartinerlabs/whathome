"use client";

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/mock-data";

export function ProjectGrid() {
  const [filters] = useQueryStates({
    q: parseAsString,
    regions: parseAsArrayOf(parseAsString).withDefault([]),
    district: parseAsInteger,
    tenures: parseAsArrayOf(parseAsString).withDefault([]),
    statuses: parseAsArrayOf(parseAsString).withDefault([]),
  });

  const filtered = projects.filter((project) => {
    if (filters.q) {
      const query = filters.q.toLowerCase();
      const searchable = [
        project.name,
        project.address,
        project.developerName,
        `D${project.districtNumber}`,
        project.region,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }

    if (
      filters.regions.length > 0 &&
      !filters.regions.includes(project.region)
    ) {
      return false;
    }

    if (
      filters.district != null &&
      project.districtNumber !== filters.district
    ) {
      return false;
    }

    if (
      filters.tenures.length > 0 &&
      !filters.tenures.includes(project.tenure)
    ) {
      return false;
    }

    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(project.status)
    ) {
      return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center border-2 border-dashed border-foreground/30">
        <p className="font-mono text-sm text-muted-foreground">
          No projects match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
