interface FeaturedProject {
  name: string;
  slug: string;
  developer: string;
  area: string;
  region: "CCR" | "RCR" | "OCR";
  psfFrom: number;
  totalUnits: number;
}

interface FeaturedCardProps {
  project: FeaturedProject;
}

export function FeaturedCard({ project }: FeaturedCardProps) {
  return (
    <a
      href={`/projects/${project.slug}`}
      className="group flex flex-col border-2 border-foreground bg-card transition-shadow hover:shadow-[4px_4px_0px_0px_var(--foreground)]"
    >
      <div className="h-48 bg-muted" />

      <div className="flex flex-col gap-3 p-4">
        <span className="w-fit bg-tag-bg px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
          {project.region}
        </span>

        <h3 className="font-sans text-lg font-semibold">{project.name}</h3>

        <p className="font-mono text-xs text-muted-foreground">
          {project.developer} &middot; {project.area}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              FROM
            </p>
            <p className="font-sans text-sm font-bold">
              ${project.psfFrom.toLocaleString()} psf
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              UNITS
            </p>
            <p className="font-sans text-sm font-bold">
              {project.totalUnits.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}
