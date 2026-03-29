"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MarketPsfByBedroom } from "@/lib/queries/bedroom-analytics";

const BEDROOM_TYPES = ["1BR", "2BR", "3BR", "4BR", "5BR", "Penthouse"] as const;

const CHART_COLOURS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--foreground)",
] as const;

interface BedroomPsfChartProps {
  data: MarketPsfByBedroom[];
}

function ChartTooltip({
  active,
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
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ) : null,
      )}
    </div>
  );
}

export function BedroomPsfChart({ data }: BedroomPsfChartProps) {
  if (data.length === 0) {
    return (
      <div className="border-2 border-foreground rounded-none p-8 h-[350px] flex items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">
          No bedroom PSF data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground rounded-none p-4 h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
            interval={11}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
            tickFormatter={(v: number) => `$${v.toLocaleString()}`}
          />
          <Tooltip content={<ChartTooltip />} />
          {BEDROOM_TYPES.map((type, i) => (
            <Line
              key={type}
              type="monotone"
              dataKey={type}
              name={type}
              stroke={CHART_COLOURS[i]}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
