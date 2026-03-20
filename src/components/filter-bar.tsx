"use client";

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const regions = ["CCR", "RCR", "OCR"] as const;
const tenures = ["freehold", "99-year", "999-year"] as const;
const statuses = [
  "upcoming",
  "launched",
  "selling",
  "sold_out",
  "completed",
] as const;
const districtNumbers = Array.from({ length: 28 }, (_, i) => i + 1);

const statusLabels: Record<string, string> = {
  upcoming: "Upcoming",
  launched: "Launched",
  selling: "Selling",
  sold_out: "Sold Out",
  completed: "Completed",
};

const tenureLabels: Record<string, string> = {
  freehold: "Freehold",
  "99-year": "99-Year",
  "999-year": "999-Year",
};

const chip =
  "border-2 border-foreground rounded-none font-bold uppercase text-[10px] tracking-wider px-2 py-0.5";
const label = "uppercase font-bold tracking-wide text-[10px]";

export function FilterBar() {
  const [filters, setFilters] = useQueryStates({
    regions: parseAsArrayOf(parseAsString).withDefault([]),
    district: parseAsInteger,
    tenures: parseAsArrayOf(parseAsString).withDefault([]),
    statuses: parseAsArrayOf(parseAsString).withDefault([]),
  });

  function toggleItem(key: "regions" | "tenures" | "statuses", item: string) {
    const current = filters[key] ?? [];
    const next = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    setFilters({ [key]: next.length > 0 ? next : null });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <span className={cn(label, "text-muted-foreground mr-1")}>Region</span>
        {regions.map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => toggleItem("regions", region)}
            className={cn(
              chip,
              "cursor-pointer transition-colors",
              (filters.regions ?? []).includes(region)
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground",
            )}
          >
            {region}
          </button>
        ))}

        <span className={cn(label, "text-muted-foreground ml-2 mr-1")}>
          District
        </span>
        <Select
          value={filters.district?.toString() ?? ""}
          onValueChange={(v) =>
            setFilters({ district: v ? Number.parseInt(v, 10) : null })
          }
        >
          <SelectTrigger className="border-2 border-foreground rounded-none w-[100px] h-8 text-xs">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {districtNumbers.map((d) => (
              <SelectItem key={d} value={String(d)}>
                D{d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className={cn(label, "text-muted-foreground mr-1")}>Tenure</span>
        {tenures.map((tenure) => (
          <button
            key={tenure}
            type="button"
            onClick={() => toggleItem("tenures", tenure)}
            className={cn(
              chip,
              "cursor-pointer transition-colors",
              (filters.tenures ?? []).includes(tenure)
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground",
            )}
          >
            {tenureLabels[tenure]}
          </button>
        ))}

        <span className={cn(label, "text-muted-foreground ml-2 mr-1")}>
          Status
        </span>
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => toggleItem("statuses", status)}
            className={cn(
              chip,
              "cursor-pointer transition-colors",
              (filters.statuses ?? []).includes(status)
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground",
            )}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>
    </div>
  );
}
