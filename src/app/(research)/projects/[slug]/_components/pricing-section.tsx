import { PriceTable } from "@/components/price-table";
import type { UnitMixRow } from "@/lib/types";

interface PricingSectionProps {
  units: UnitMixRow[];
}

export function PricingSection({ units }: PricingSectionProps) {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-4">
        <h2 className="uppercase font-bold tracking-wide text-lg">
          Unit Mix & Pricing
        </h2>
        <PriceTable units={units} />
      </div>
    </section>
  );
}
