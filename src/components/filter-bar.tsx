"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DISTRICT_NAMES } from "@/lib/districts";
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

function DistrictCombobox({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const displayLabel = value
    ? `D${value} — ${DISTRICT_NAMES[value].name}`
    : "All districts";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="flex h-8 w-[340px] items-center justify-between border-2 border-foreground bg-transparent px-3 text-xs hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-shadow cursor-pointer"
        >
          <span className={value ? "" : "text-muted-foreground"}>
            {displayLabel}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="ml-2 size-3 shrink-0 opacity-50"
            strokeWidth={2}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[340px] rounded-none border-2 border-foreground p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search district..." />
          <CommandList>
            <CommandEmpty>No district found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
                data-checked={!value}
              >
                All districts
              </CommandItem>
              {districtNumbers.map((district) => (
                <CommandItem
                  key={district}
                  value={`D${district} ${DISTRICT_NAMES[district].name}`}
                  onSelect={() => {
                    onChange(district === value ? null : district);
                    setOpen(false);
                  }}
                  data-checked={value === district}
                >
                  <span className="font-bold">D{district}</span>
                  <span className="text-muted-foreground">
                    {DISTRICT_NAMES[district].name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FilterBar() {
  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString,
      regions: parseAsArrayOf(parseAsString).withDefault([]),
      district: parseAsInteger,
      tenures: parseAsArrayOf(parseAsString).withDefault([]),
      statuses: parseAsArrayOf(parseAsString).withDefault([]),
    },
    { shallow: false },
  );

  function toggleItem(key: "regions" | "tenures" | "statuses", item: string) {
    const current = filters[key] ?? [];
    const next = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    setFilters({ [key]: next.length > 0 ? next : null });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={filters.q ?? ""}
          onChange={(e) => setFilters({ q: e.target.value || null })}
          placeholder="Search by project name, address, or developer..."
          className="h-9 flex-1 border-2 border-foreground bg-transparent px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--foreground)]"
        />
        {filters.q && (
          <button
            type="button"
            onClick={() => setFilters({ q: null })}
            className={cn(chip, "cursor-pointer bg-foreground text-background")}
          >
            Clear
          </button>
        )}
      </div>

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
        <DistrictCombobox
          value={filters.district}
          onChange={(value) => setFilters({ district: value })}
        />
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
