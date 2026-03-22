import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/types";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
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
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
