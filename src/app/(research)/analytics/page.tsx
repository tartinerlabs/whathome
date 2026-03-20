import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { PriceIndexChart } from "./_components/price-index-chart";
import { RegionPsfChart } from "./_components/region-psf-chart";
import { VolumeChart } from "./_components/volume-chart";

export const metadata: Metadata = {
  title: "Market Analytics",
  description:
    "Singapore property market trends and data. Price index movements, transaction volumes, and PSF analysis by region.",
};

export default function AnalyticsPage() {
  return (
    <>
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <SectionHeader title="Price Index" meta="Q2 2024 – Q1 2026" />
          <PriceIndexChart />
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
    </>
  );
}
