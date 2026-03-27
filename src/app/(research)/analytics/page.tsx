import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { getPriceIndices } from "@/lib/queries/market-data";
import { PriceIndexChart } from "./components/price-index-chart";
import { RegionPsfChart } from "./components/region-psf-chart";
import { VolumeChart } from "./components/volume-chart";

export const metadata: Metadata = {
  title: "Market Analytics",
  description:
    "Singapore property market trends and data. Price index movements, transaction volumes, and PSF analysis by region.",
};

export default async function AnalyticsPage() {
  const priceIndices = await getPriceIndices();

  return (
    <>
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <SectionHeader title="Price Index" meta="Q2 2024 – Q1 2026" />
          <PriceIndexChart data={priceIndices} />
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <SectionHeader title="Transaction Volume" meta="QUARTERLY" />
          <VolumeChart />
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <SectionHeader title="Average PSF by Region" meta="CURRENT" />
          <RegionPsfChart />
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-4">
          <SectionHeader title="Bedroom Performance" meta="ANALYTICS" />
          <p className="text-muted-foreground text-sm">
            Compare returns, rental yields, and PSF trends across bedroom types
            and decades.
          </p>
          <Link
            href="/analytics/bedroom"
            className="inline-block border-2 border-foreground px-6 py-3 font-medium transition-colors hover:bg-foreground hover:text-background"
          >
            View Bedroom Analytics
          </Link>
        </div>
      </section>
    </>
  );
}
