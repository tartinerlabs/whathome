"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { PsfDataPoint, ThemeVariant } from "./types";
import { variantStyles } from "./variant-styles";

interface PsfChartProps {
  data: PsfDataPoint[];
  variant: ThemeVariant;
}

export function PsfChart({ data, variant }: PsfChartProps) {
  const styles = variantStyles[variant];

  return (
    <div className="space-y-2">
      <h3 className={cn(styles.heading, "text-sm")}>PSF Trend (12 Months)</h3>
      <div className={cn(styles.chartContainer, "h-[250px]")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray={variant === "full" ? "0" : "3 3"}
              stroke="var(--border)"
            />
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
              domain={["dataMin - 50", "dataMax + 50"]}
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border:
                  variant === "full"
                    ? "2px solid var(--foreground)"
                    : "1px solid var(--border)",
                borderRadius: variant === "full" ? "0" : "8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
              }}
              formatter={(value: number) => [
                `$${value.toLocaleString()}`,
                "PSF",
              ]}
            />
            <Area
              type={variant === "full" ? "linear" : "monotone"}
              dataKey="psf"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.15}
              strokeWidth={variant === "full" ? 2.5 : 2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
