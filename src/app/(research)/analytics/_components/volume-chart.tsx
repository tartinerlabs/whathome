"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const volumeData = [
  { quarter: "2024 Q2", volume: 1842 },
  { quarter: "2024 Q3", volume: 2156 },
  { quarter: "2024 Q4", volume: 1934 },
  { quarter: "2025 Q1", volume: 2287 },
  { quarter: "2025 Q2", volume: 2543 },
  { quarter: "2025 Q3", volume: 1876 },
  { quarter: "2025 Q4", volume: 2098 },
  { quarter: "2026 Q1", volume: 2312 },
];

export function VolumeChart() {
  return (
    <div className="border-2 border-foreground rounded-none p-4 h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={volumeData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
          <XAxis
            dataKey="quarter"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
            tickFormatter={(v: number) => v.toLocaleString()}
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
              Number(value).toLocaleString(),
              "Transactions",
            ]}
          />
          <Bar dataKey="volume" fill="var(--chart-1)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
