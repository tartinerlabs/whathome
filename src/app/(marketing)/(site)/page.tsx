import type { Metadata } from "next";
import { CtaSection } from "../components/cta-section";
import { FeaturedLaunches } from "../components/featured-launches";
import { HeroSection } from "../components/hero-section";
import { HowItWorks } from "../components/how-it-works";
import { MarketSnapshot } from "../components/market-snapshot";

export const metadata: Metadata = {
  title: "WhatHome — Singapore New Condo Launch Research",
  description:
    "Research every new condo launch in Singapore. AI-powered analysis on pricing, amenities, and investment potential.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "WhatHome",
      url: "https://whathome.sg",
      description:
        "Research every new condo launch in Singapore. AI-powered analysis on pricing, amenities, and investment potential.",
    },
    {
      "@type": "Organization",
      name: "Tartiner Labs",
      url: "https://whathome.sg",
      brand: {
        "@type": "Brand",
        name: "WhatHome",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from trusted static data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <FeaturedLaunches />
      <MarketSnapshot />
      <HowItWorks />
      <CtaSection />
    </>
  );
}
