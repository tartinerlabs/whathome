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
import type { PsfDataPoint } from "@/lib/types";

interface PsfChartProps {
  data: PsfDataPoint[];
  height?: number;
}

export function PsfChart({ data, height = 250 }: PsfChartProps) {
  return (
    <div
      className="border-2 border-foreground rounded-none p-4"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
            domain={["dataMin - 50", "dataMax + 50"]}
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
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "PSF"]}
          />
          <Area
            type="linear"
            dataKey="psf"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.15}
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
