"use client";

import type { DecadeBedroomCagr } from "@/lib/queries/bedroom-analytics";

const BEDROOM_TYPES = ["1BR", "2BR", "3BR", "4BR", "5BR", "Penthouse"] as const;
const DECADES = ["2000s", "2010s", "2020s"] as const;
const REGIONS = ["CCR", "RCR", "OCR"] as const;

function cellBg(cagr: number | null, n: number): string {
  if (n < 5) return "bg-muted";
  if (cagr === null) return "bg-muted";
  const intensity = Math.min(Math.abs(cagr) / 12, 1) * 0.25;
  return cagr >= 0
    ? `rgba(0,0,0,${intensity})`
    : `rgba(220,50,50,${intensity})`;
}

interface CagrHeatmapProps {
  data: DecadeBedroomCagr[];
}

export function CagrHeatmap({ data }: CagrHeatmapProps) {
  const byKey = new Map<string, DecadeBedroomCagr>();
  for (const row of data) {
    byKey.set(`${row.decade}::${row.bedroom}::${row.region}`, row);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm font-mono">
        <thead>
          <tr>
            <th className="border-2 border-foreground p-2 text-left text-muted-foreground">
              Decade
            </th>
            {BEDROOM_TYPES.map((b) => (
              <th
                key={b}
                className="border-2 border-foreground p-2 text-center text-muted-foreground"
              >
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DECADES.flatMap((decade) =>
            REGIONS.map((region) => (
              <tr key={`${decade}::${region}`}>
                <td className="border-2 border-foreground p-2 align-top text-muted-foreground">
                  {decade} {region}
                </td>
                {BEDROOM_TYPES.map((bedroom) => {
                  const key = `${decade}::${bedroom}::${region}`;
                  const row = byKey.get(key);
                  const cagr = row?.medianCagr ?? null;
                  const n = row?.sampleSize ?? 0;
                  return (
                    <td
                      key={`${decade}::${bedroom}`}
                      className={`border-2 border-foreground p-2 text-center ${cellBg(cagr, n)}`}
                    >
                      {n < 5 ? (
                        <span className="text-xs text-muted-foreground">
                          N&lt;5
                        </span>
                      ) : cagr !== null ? (
                        <>
                          <span
                            className={
                              cagr >= 0 ? "text-foreground" : "text-destructive"
                            }
                          >
                            {cagr >= 0 ? "+" : ""}
                            {cagr.toFixed(1)}%
                          </span>
                          <br />
                          <span className="text-xs text-muted-foreground">
                            N={n}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
