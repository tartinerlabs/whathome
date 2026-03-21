export interface FeaturedProject {
  name: string;
  slug: string;
  developer: string;
  area: string;
  region: "CCR" | "RCR" | "OCR";
  psfFrom: number;
  totalUnits: number;
}

export interface MarketStat {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
}

export const featuredProjects: FeaturedProject[] = [
  {
    name: "Aurelle of Tampines",
    slug: "aurelle-of-tampines",
    developer: "CDL & Frasers",
    area: "Tampines",
    region: "OCR",
    psfFrom: 1488,
    totalUnits: 760,
  },
  {
    name: "Arina East Residences",
    slug: "arina-east-residences",
    developer: "Capitaland",
    area: "Marine Parade",
    region: "RCR",
    psfFrom: 2320,
    totalUnits: 346,
  },
  {
    name: "One Marina Gardens",
    slug: "one-marina-gardens",
    developer: "Kingsford & TIID",
    area: "Marina Bay",
    region: "CCR",
    psfFrom: 2700,
    totalUnits: 937,
  },
];

export const marketStats: MarketStat[] = [
  {
    label: "CCR Price Index",
    value: "189.2",
    change: "+2.1%",
    isPositive: true,
  },
  {
    label: "RCR Price Index",
    value: "203.8",
    change: "+3.8%",
    isPositive: true,
  },
  {
    label: "OCR Price Index",
    value: "212.4",
    change: "+1.5%",
    isPositive: true,
  },
  {
    label: "New Sales (YTD)",
    value: "8,542",
    change: "+12.4%",
    isPositive: true,
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: "01",
    title: "Browse",
    description:
      "Explore new condo launches filtered by district, region, developer, or price range.",
  },
  {
    number: "02",
    title: "Analyse",
    description:
      "Read AI-generated investment analysis, nearby amenity maps, and pricing trend charts.",
  },
  {
    number: "03",
    title: "Compare",
    description:
      "Put projects side by side to compare unit mixes, PSF trends, and neighbourhood features.",
  },
];
