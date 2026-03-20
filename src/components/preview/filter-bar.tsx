"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ThemeVariant } from "./types";
import { variantStyles } from "./variant-styles";

interface FilterBarProps {
  variant: ThemeVariant;
}

const regions = ["CCR", "RCR", "OCR"] as const;
const tenures = ["Freehold", "99-Year", "999-Year"] as const;
const statuses = ["Upcoming", "Launched", "Selling", "Sold Out"] as const;
const districts = Array.from({ length: 28 }, (_, i) => i + 1);

export function FilterBar({ variant }: FilterBarProps) {
  const styles = variantStyles[variant];
  const [activeRegions, setActiveRegions] = useState<string[]>([
    "CCR",
    "RCR",
    "OCR",
  ]);
  const [activeTenures, setActiveTenures] = useState<string[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string,
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
    );
  };

  return (
    <div className="space-y-3">
      <h3 className={cn(styles.heading, "text-sm")}>Filters</h3>
      <div className="flex flex-wrap gap-2 items-center">
        {/* Region toggles */}
        <span className={cn(styles.label, "text-muted-foreground mr-1")}>
          Region
        </span>
        {regions.map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => toggleItem(activeRegions, setActiveRegions, region)}
            className={cn(
              styles.chip,
              "cursor-pointer transition-colors",
              activeRegions.includes(region)
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground",
            )}
          >
            {region}
          </button>
        ))}

        {/* District select */}
        <span className={cn(styles.label, "text-muted-foreground ml-2 mr-1")}>
          District
        </span>
        <Select defaultValue="">
          <SelectTrigger className={cn(styles.input, "w-[100px] h-8 text-xs")}>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d} value={String(d)}>
                D{d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Tenure toggles */}
        <span className={cn(styles.label, "text-muted-foreground mr-1")}>
          Tenure
        </span>
        {tenures.map((tenure) => (
          <button
            key={tenure}
            type="button"
            onClick={() => toggleItem(activeTenures, setActiveTenures, tenure)}
            className={cn(
              styles.chip,
              "cursor-pointer transition-colors",
              activeTenures.includes(tenure)
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground",
            )}
          >
            {tenure}
          </button>
        ))}

        {/* Status chips */}
        <span className={cn(styles.label, "text-muted-foreground ml-2 mr-1")}>
          Status
        </span>
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() =>
              toggleItem(activeStatuses, setActiveStatuses, status)
            }
            className={cn(
              styles.chip,
              "cursor-pointer transition-colors",
              activeStatuses.includes(status)
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground",
            )}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
