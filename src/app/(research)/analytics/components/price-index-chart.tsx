"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { priceIndices } from "@/lib/mock-data";

const lines = [
  { key: "ccr", name: "CCR", colour: "var(--chart-1)" },
  { key: "rcr", name: "RCR", colour: "var(--chart-3)" },
  { key: "ocr", name: "OCR", colour: "var(--chart-5)" },
  { key: "overall", name: "Overall", colour: "var(--foreground)" },
];

export function PriceIndexChart() {
  return (
    <div className="border-2 border-foreground rounded-none p-4 h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={priceIndices}
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
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "2px solid var(--foreground)",
              borderRadius: "0",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
            }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="linear"
              dataKey={line.key}
              name={line.name}
              stroke={line.colour}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
