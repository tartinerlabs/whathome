import type { Metadata } from "next";
import { SectionHeader } from "@/components/section-header";
import { getDevelopers } from "@/lib/queries/developers";
import { DeveloperCard } from "./components/developer-card";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "Browse Singapore property developers. View project portfolios, track records, and total units delivered.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Singapore Property Developer Directory",
  description:
    "Browse Singapore property developers. View project portfolios, track records, and total units delivered.",
  url: "https://whathome.sg/developers",
  isPartOf: {
    "@type": "WebSite",
    name: "WhatHome",
    url: "https://whathome.sg",
  },
};

export default async function DevelopersPage() {
  const devs = await getDevelopers();

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from trusted static data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeader
            title="Developer Directory"
            meta={`${devs.length} DEVELOPERS`}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {devs.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
