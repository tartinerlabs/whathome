import { SectionHeader } from "@/components/section-header";
import { getMarketSnapshot } from "@/lib/queries/market-data";
import { cn } from "@/lib/utils";

export async function MarketSnapshot() {
  const { latestQuarter, stats } = await getMarketSnapshot();

  if (!stats.length) {
    return (
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Market Snapshot" />
          <p className="mt-4 text-muted-foreground">
            Market data not yet available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeader title="Market Snapshot" meta={latestQuarter} />

        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-2 border-foreground p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 font-sans text-3xl font-bold tracking-tight lg:text-[42px]">
                {stat.value}
              </p>
              <p
                className={cn(
                  "mt-1 font-mono text-xs font-semibold",
                  stat.isPositive ? "text-success" : "text-destructive",
                )}
              >
                {stat.change >= 0 ? "+" : ""}
                {stat.change}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
