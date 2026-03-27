import type { TransactionPair } from "@/lib/queries/transaction-pairs";

interface TransactionChainsProps {
  pairs: TransactionPair[];
}

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export function TransactionChains({ pairs }: TransactionChainsProps) {
  if (!pairs.length) return null;

  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-4">
        <h2 className="uppercase font-bold tracking-wide text-lg">
          Transaction Chains
        </h2>
        <p className="text-sm text-muted-foreground">
          Buy-sell pairs matched by same project and unit area.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-foreground text-sm font-mono">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted">
                {[
                  "Area (sqft)",
                  "Buy Date",
                  "Buy Price",
                  "Sell Date",
                  "Sell Price",
                  "Holding",
                  "Profit %",
                  "CAGR",
                ].map((h) => (
                  <th
                    key={h}
                    className="p-3 text-left font-bold uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pairs.slice(0, 20).map((pair) => {
                const years = (pair.holdingMonths / 12).toFixed(1);
                const profitSign = pair.profitPercent >= 0 ? "+" : "";
                const cagrSign = pair.annualisedReturn >= 0 ? "+" : "";
                return (
                  <tr key={pair.id} className="border-b border-foreground/20">
                    <td className="p-3 text-right">
                      {pair.areaSqft > 0 ? pair.areaSqft.toLocaleString() : "—"}
                    </td>
                    <td className="p-3 text-right">{pair.buyDate ?? "—"}</td>
                    <td className="p-3 text-right">
                      {pair.buyPrice > 0 ? formatPrice(pair.buyPrice) : "—"}
                    </td>
                    <td className="p-3 text-right">{pair.sellDate ?? "—"}</td>
                    <td className="p-3 text-right">
                      {pair.sellPrice > 0 ? formatPrice(pair.sellPrice) : "—"}
                    </td>
                    <td className="p-3 text-right">{years}y</td>
                    <td
                      className={
                        pair.profitPercent >= 0
                          ? "p-3 text-right text-green-600 dark:text-green-400"
                          : "p-3 text-right text-red-600 dark:text-red-400"
                      }
                    >
                      {profitSign}
                      {pair.profitPercent.toFixed(1)}%
                    </td>
                    <td
                      className={
                        pair.annualisedReturn >= 0
                          ? "p-3 text-right text-green-600 dark:text-green-400"
                          : "p-3 text-right text-red-600 dark:text-red-400"
                      }
                    >
                      {cagrSign}
                      {pair.annualisedReturn.toFixed(2)}%
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
