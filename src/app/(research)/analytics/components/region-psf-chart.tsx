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

const regionData = [
  { region: "CCR", avgPsf: 2850, medianPsf: 2780 },
  { region: "RCR", avgPsf: 2380, medianPsf: 2320 },
  { region: "OCR", avgPsf: 1420, medianPsf: 1380 },
];

export function RegionPsfChart() {
  return (
    <div className="border-2 border-foreground rounded-none p-4 h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={regionData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
          <XAxis
            dataKey="region"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--foreground)" }}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
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
            formatter={(value) => [`$${Number(value).toLocaleString()}`]}
          />
          <Legend
            wrapperStyle={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
            }}
          />
          <Bar dataKey="avgPsf" name="Average PSF" fill="var(--chart-1)" />
          <Bar dataKey="medianPsf" name="Median PSF" fill="var(--chart-3)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
