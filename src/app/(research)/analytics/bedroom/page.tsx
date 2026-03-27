import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import {
  getDecadeBedroomCagr,
  getMarketPsfByBedroom,
} from "@/lib/queries/bedroom-analytics";
import { getMarketRentalYieldByBedroom } from "@/lib/queries/rentals";
import { BedroomPsfChart } from "./components/bedroom-psf-chart";
import { CagrHeatmap } from "./components/cagr-heatmap";
import { HarmonisationCaveat } from "./components/harmonisation-caveat";
import { YieldByRegionChart } from "./components/yield-by-region-chart";

export const metadata: Metadata = {
  title: "Bedroom Performance Analytics",
  description:
    "Singapore condo bedroom-type performance analytics. Compare returns, rental yields, and PSF trends by bedroom type across decades.",
};

export default async function BedroomAnalyticsPage() {
  const [psfData, cagrData, yieldData] = await Promise.all([
    getMarketPsfByBedroom(),
    getDecadeBedroomCagr(),
    getMarketRentalYieldByBedroom(),
  ]);

  return (
    <>
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <SectionHeader
            title="PSF Trend by Bedroom Type"
            meta="MONTHLY — 5 YEARS"
          />
          <HarmonisationCaveat />
          <BedroomPsfChart data={psfData} />
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <SectionHeader
            title="CAGR by Decade & Bedroom Type"
            meta="HOLDING-PERIOD RETURNS"
          />
          <HarmonisationCaveat />
          <CagrHeatmap data={cagrData} />
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <SectionHeader
            title="Rental Yield by Bedroom & Region"
            meta="LAST 24 MONTHS"
          />
          <YieldByRegionChart data={yieldData} />
        </div>
      </section>
    </>
  );
}
