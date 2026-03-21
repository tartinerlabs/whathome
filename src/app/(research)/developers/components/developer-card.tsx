import type { Developer } from "@/lib/types";

interface DeveloperCardProps {
  developer: Developer;
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  return (
    <a href={`/developers/${developer.slug}`} className="group block">
      <div className="flex flex-col border-2 border-foreground p-6 shadow-[4px_4px_0px_0px_var(--foreground)] transition-all group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] h-full">
        <h3 className="uppercase font-bold tracking-wide text-sm">
          {developer.name}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {developer.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t-2 border-foreground pt-4 mt-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Projects
            </p>
            <p className="font-mono text-lg font-bold">
              {developer.projectCount}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Units
            </p>
            <p className="font-mono text-lg font-bold">
              {developer.totalUnits.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}
