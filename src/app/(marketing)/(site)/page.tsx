import type { Metadata } from "next";
import { CtaSection } from "../_components/cta-section";
import { FeaturedLaunches } from "../_components/featured-launches";
import { HeroSection } from "../_components/hero-section";
import { HowItWorks } from "../_components/how-it-works";
import { MarketSnapshot } from "../_components/market-snapshot";

export const metadata: Metadata = {
  title: "WhatHome — Singapore New Condo Launch Research",
  description:
    "Research every new condo launch in Singapore. AI-powered analysis on pricing, amenities, and investment potential.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedLaunches />
      <MarketSnapshot />
      <HowItWorks />
      <CtaSection />
    </>
  );
}
