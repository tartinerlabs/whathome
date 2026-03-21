import { SectionHeader } from "@/components/section-header";
import { cn } from "@/lib/utils";
import { marketStats } from "./mock-data";

export function MarketSnapshot() {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeader title="Market Snapshot" meta="Q1 2026" />

        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {marketStats.map((stat) => (
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
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
