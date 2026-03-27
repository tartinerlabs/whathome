import type { BedroomPsfDataPoint } from "@/lib/queries/transactions";

const BEDROOM_TYPES = ["1BR", "2BR", "3BR", "4BR", "5BR", "Penthouse"] as const;

interface BedroomSummaryTableProps {
  psfData: BedroomPsfDataPoint[];
}

export function BedroomSummaryTable({ psfData }: BedroomSummaryTableProps) {
  // Count how many data points each bedroom type has
  const counts: Record<string, number> = {};
  const latestPsf: Record<string, number | null> = {};

  for (const row of psfData) {
    for (const type of BEDROOM_TYPES) {
      if (!counts[type]) counts[type] = 0;
      if (row[type] != null) {
        counts[type]++;
        if (latestPsf[type] === undefined) {
          latestPsf[type] = row[type];
        }
      }
    }
  }

  const hasData = Object.values(counts).some((c) => c > 0);
  if (!hasData) return null;

  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-4">
        <h2 className="uppercase font-bold tracking-wide text-lg">
          Bedroom Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-foreground text-sm font-mono">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted">
                <th className="p-3 text-left font-bold uppercase tracking-wide">
                  Bedroom
                </th>
                <th className="p-3 text-right font-bold uppercase tracking-wide">
                  Data Points
                </th>
                <th className="p-3 text-right font-bold uppercase tracking-wide">
                  Latest PSF
                </th>
              </tr>
            </thead>
            <tbody>
              {BEDROOM_TYPES.map((type) => {
                const n = counts[type] ?? 0;
                if (n === 0) return null;
                const psf = latestPsf[type];
                return (
                  <tr key={type} className="border-b border-foreground/20">
                    <td className="p-3 font-medium">{type}</td>
                    <td className="p-3 text-right text-muted-foreground">
                      {n}
                    </td>
                    <td className="p-3 text-right">
                      {psf != null ? `$${psf.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
