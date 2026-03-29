import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { SectionHeader } from "@/components/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDecadeBedroomCagr,
  getMarketPsfByBedroom,
} from "@/lib/queries/bedroom-analytics";
import { getMarketRentalYieldByBedroom } from "@/lib/queries/rentals";
import { HarmonisationCaveat } from "./components/harmonisation-caveat";

const BedroomPsfChart = dynamic(
  () => import("./components/bedroom-psf-chart").then((m) => m.BedroomPsfChart),
  {
    loading: () => <Skeleton className="h-[350px] w-full" />,
  },
);

const CagrHeatmap = dynamic(
  () => import("./components/cagr-heatmap").then((m) => m.CagrHeatmap),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
  },
);

const YieldByRegionChart = dynamic(
  () =>
    import("./components/yield-by-region-chart").then(
      (m) => m.YieldByRegionChart,
    ),
  {
    loading: () => <Skeleton className="h-[350px] w-full" />,
  },
);

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
