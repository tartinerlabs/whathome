import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "WhatHome is a research directory for Singapore new condo launches. AI-powered data, transparent pricing, and investment analysis — built by Tartiner Labs.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-sans text-4xl font-bold tracking-tighter md:text-5xl">
            About WhatHome
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            WhatHome is a research directory for Singapore&rsquo;s new condo
            launches. Not a marketplace — no agent listings, no buyer-seller
            transactions. Just data, analysis, and transparency.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <h2 className="font-sans text-2xl font-bold tracking-tight">
            How We Work
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Automated Ingestion",
                description:
                  "AI agents fetch transaction data from data.gov.sg and URA APIs daily. Every new sale, every price movement — captured automatically.",
              },
              {
                number: "02",
                title: "Research Agents",
                description:
                  "When a new project is detected, AI agents research developer details, pricing, nearby amenities, and investment potential from web sources.",
              },
              {
                number: "03",
                title: "Transparent Analysis",
                description:
                  "All data is presented openly with sources cited. Our AI summaries are clearly labelled — we help you research, not make decisions for you.",
              },
            ].map((step) => (
              <div key={step.number} className="border-2 border-foreground p-6">
                <span className="font-mono text-3xl font-bold text-muted-foreground">
                  {step.number}
                </span>
                <h3 className="mt-4 uppercase font-bold tracking-wide text-sm">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <h2 className="font-sans text-2xl font-bold tracking-tight">
            Data Sources
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                name: "data.gov.sg",
                description:
                  "Private residential transaction records, price indices, and CEA agent data. Free, public API.",
              },
              {
                name: "URA Data Service",
                description:
                  "Supplementary transaction data, rental statistics, and vacancy rates from the Urban Redevelopment Authority.",
              },
              {
                name: "OneMap API",
                description:
                  "Geocoding and nearby amenity data — MRT stations, schools, shopping centres, parks, and hospitals.",
              },
              {
                name: "YouTube Transcripts",
                description:
                  "AI-extracted insights from Singapore property reviewers including Eric Chiew, PropertyLimBrothers, and JNA Real Estate.",
              },
            ].map((source) => (
              <div key={source.name} className="border-2 border-foreground p-4">
                <h3 className="uppercase font-bold tracking-wide text-[10px]">
                  {source.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {source.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-secondary px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-sans text-2xl font-bold tracking-tight">
            Built by Tartiner Labs
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Tartiner Labs is a small Singapore-based product studio. We build
            tools that make information more accessible. WhatHome is our first
            public project — born from the frustration of researching new condo
            launches across dozens of fragmented sources.
          </p>
        </div>
      </section>
    </>
  );
}
