import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { getDistrictStats } from "@/lib/queries/districts";
import { DistrictCard } from "./components/district-card";

export const metadata: Metadata = {
  title: "Districts",
  description:
    "Browse Singapore's 28 property districts. View average PSF, project counts, and median prices by district.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Singapore Property Districts (D1–D28)",
  description:
    "Browse Singapore's 28 property districts. View average PSF, project counts, and median prices by district.",
  url: "https://whathome.sg/districts",
  isPartOf: {
    "@type": "WebSite",
    name: "WhatHome",
    url: "https://whathome.sg",
  },
};

export default async function DistrictsPage() {
  const districts = await getDistrictStats();

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from trusted static data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeader title="District Browser" meta="D1–D28" />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {districts.map((district) => (
              <DistrictCard key={district.number} district={district} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
