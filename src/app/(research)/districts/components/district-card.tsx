import { Badge } from "@/components/ui/badge";
import type { DistrictInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DistrictCardProps {
  district: DistrictInfo;
}

const regionColours: Record<DistrictInfo["region"], string> = {
  CCR: "bg-chart-1 text-white",
  RCR: "bg-chart-3 text-white",
  OCR: "bg-chart-5 text-white",
};

export function DistrictCard({ district }: DistrictCardProps) {
  return (
    <a href={`/districts/${district.number}`} className="group block">
      <div className="border-2 border-foreground p-4 transition-all hover:shadow-[4px_4px_0px_0px_var(--foreground)]">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-2xl font-bold">
            D{district.number}
          </span>
          <Badge
            className={cn(
              "rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-wider",
              regionColours[district.region],
            )}
          >
            {district.region}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
          {district.name}
        </p>

        <div className="mt-3 flex items-center justify-between border-t-2 border-foreground pt-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Projects
            </p>
            <p className="font-mono font-semibold">{district.projectCount}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Avg PSF
            </p>
            <p className="font-mono font-semibold">
              ${district.avgPsf.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}
