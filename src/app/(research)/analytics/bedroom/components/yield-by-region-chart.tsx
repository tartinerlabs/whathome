"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MarketRentalYieldRow } from "@/lib/queries/rentals";

const _BEDROOM_TYPES = ["1BR", "2BR", "3BR", "4BR", "5BR"] as const;
const REGIONS = ["CCR", "RCR", "OCR"] as const;

const REGION_COLOURS: Record<string, string> = {
  CCR: "var(--chart-1)",
  RCR: "var(--chart-3)",
  OCR: "var(--chart-5)",
};

interface YieldByRegionChartProps {
  data: MarketRentalYieldRow[];
}

function ChartTooltip({
  active,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="border-2 border-foreground bg-card p-3"
      style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
    >
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) =>
        entry.value != null ? (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium">
              {entry.value.toFixed(2)}%
            </span>
          </div>
        ) : null,
      )}
    </div>
  );
}

// Pivot data: [{ bedroom: "1BR", CCR: 3.2, RCR: 3.5, OCR: 3.8 }, ...]
function pivotData(
  data: MarketRentalYieldRow[],
): Array<Record<string, string | number>> {
  const byBedroom = new Map<string, Record<string, number | string>>();
  for (const row of data) {
    if (!byBedroom.has(row.bedroom)) {
      byBedroom.set(row.bedroom, { bedroom: row.bedroom });
    }
    byBedroom.get(row.bedroom)![row.region] = row.grossYield;
  }
  return Array.from(byBedroom.values());
}

export function YieldByRegionChart({ data }: YieldByRegionChartProps) {
  if (data.length === 0) {
    return (
      <div className="border-2 border-foreground rounded-none p-8 h-[350px] flex items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">
          No rental yield data available yet.
        </p>
      </div>
    );
  }

  const chartData = pivotData(data);

  return (
    <div className="border-2 border-foreground rounded-none p-4 h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
          <XAxis
            dataKey="bedroom"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
            }}
          />
          {REGIONS.map((region) => (
            <Bar
              key={region}
              dataKey={region}
              name={region}
              fill={REGION_COLOURS[region]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
