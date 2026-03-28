"use client";

import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const chartColours = ["var(--chart-1)", "var(--chart-3)", "var(--chart-5)"];

const chip =
  "border-2 border-foreground rounded-none font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 cursor-pointer transition-colors";

interface ProjectComparisonProps {
  projects: Project[];
}

export function ProjectComparison({ projects }: ProjectComparisonProps) {
  const [{ slugs }, setFilters] = useQueryStates({
    slugs: parseAsArrayOf(parseAsString).withDefault([]),
  });

  function toggleProject(slug: string) {
    const current = slugs ?? [];
    if (current.includes(slug)) {
      const next = current.filter((s) => s !== slug);
      setFilters({ slugs: next.length > 0 ? next : null });
    } else if (current.length < 3) {
      setFilters({ slugs: [...current, slug] });
    }
  }

  const selectedProjects = projects.filter((p) =>
    (slugs ?? []).includes(p.slug),
  );

  // TODO: Fetch PSF trend data for selected projects via API
  const mergedPsfData: Record<string, unknown>[] = [];

  return (
    <div className="space-y-8">
      {/* Project selector */}
      <div className="space-y-2">
        <p className="uppercase font-bold tracking-wide text-[10px] text-muted-foreground">
          Select Projects (max 3)
        </p>
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => toggleProject(p.slug)}
              className={cn(
                chip,
                (slugs ?? []).includes(p.slug)
                  ? "bg-foreground text-background"
                  : "bg-transparent text-foreground",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {selectedProjects.length === 0 ? (
        <div className="border-2 border-foreground p-12 text-center">
          <p className="text-muted-foreground">
            Select 2–3 projects above to compare pricing, unit mix, and PSF
            trends.
          </p>
        </div>
      ) : (
        <>
          {/* Comparison table */}
          <div className="border-2 border-foreground overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="p-3 text-left uppercase font-bold tracking-wide text-[10px]">
                    Metric
                  </th>
                  {selectedProjects.map((p) => (
                    <th
                      key={p.slug}
                      className="p-3 text-left uppercase font-bold tracking-wide text-[10px]"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Developer",
                    values: selectedProjects.map((p) => p.developerName),
                  },
                  {
                    label: "Region",
                    values: selectedProjects.map((p) => p.region),
                  },
                  {
                    label: "District",
                    values: selectedProjects.map((p) => `D${p.districtNumber}`),
                  },
                  {
                    label: "Tenure",
                    values: selectedProjects.map((p) => p.tenure),
                  },
                  {
                    label: "Total Units",
                    values: selectedProjects.map((p) =>
                      p.totalUnits.toLocaleString(),
                    ),
                  },
                  {
                    label: "Units Sold",
                    values: selectedProjects.map(
                      (p) =>
                        `${p.unitsSold.toLocaleString()} (${Math.round((p.unitsSold / p.totalUnits) * 100)}%)`,
                    ),
                  },
                  {
                    label: "TOP",
                    values: selectedProjects.map((p) => p.topDate),
                  },
                  {
                    label: "Unit Types",
                    values: selectedProjects.map(() => "—"),
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-b-2 border-foreground">
                    <td className="p-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {row.label}
                    </td>
                    {row.values.map((value, i) => (
                      <td
                        key={selectedProjects[i].slug}
                        className="p-3 font-mono text-sm"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PSF overlay chart */}
          {mergedPsfData.length > 0 && (
            <div className="space-y-4">
              <h2 className="uppercase font-bold tracking-wide text-lg">
                PSF Trend Comparison
              </h2>
              <div className="border-2 border-foreground rounded-none p-4 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mergedPsfData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                      }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--foreground)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                      }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--foreground)" }}
                      tickFormatter={(v: number) => `$${v.toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "2px solid var(--foreground)",
                        borderRadius: "0",
                        fontSize: "12px",
                        fontFamily: "var(--font-mono)",
                      }}
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                      ]}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                    {selectedProjects.map((p, i) => (
                      <Area
                        key={p.slug}
                        type="linear"
                        dataKey={p.slug}
                        name={p.name}
                        stroke={chartColours[i]}
                        fill={chartColours[i]}
                        fillOpacity={0.1}
                        strokeWidth={2.5}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
