export type { PsfDataPoint, UnitMixRow } from "@/components/preview/types";

export type Region = "CCR" | "RCR" | "OCR";
export type Tenure = "freehold" | "99-year" | "999-year" | "103-year";
export type ProjectStatus =
  | "upcoming"
  | "launched"
  | "selling"
  | "sold_out"
  | "completed";
export type SaleType = "new_sale" | "sub_sale" | "resale";
export type PropertyType = "condo" | "apt" | "ec" | "strata_landed";
export type AmenityType =
  | "mrt"
  | "bus_interchange"
  | "school"
  | "mall"
  | "park"
  | "hospital";

export interface Project {
  id: string;
  name: string;
  slug: string;
  developerId: string;
  developerName: string;
  districtNumber: number;
  region: Region;
  address: string;
  postalCode: string;
  tenure: Tenure;
  tenureYears: number | null;
  totalUnits: number;
  unitsSold: number;
  launchDate: string;
  topDate: string;
  completionDate: string | null;
  status: ProjectStatus;
  latitude: number;
  longitude: number;
  siteArea: number | null;
  plotRatio: number | null;
  description: string;
  aiSummary: string | null;
}

export interface Developer {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logoUrl: string | null;
  projectCount: number;
  totalUnits: number;
}

export interface Transaction {
  id: string;
  projectSlug: string;
  projectName: string;
  unitNumber: string;
  floorRange: string;
  areaSqft: number;
  transactedPrice: number;
  pricePsf: number;
  contractDate: string;
  saleType: SaleType;
  propertyType: PropertyType;
  district: number;
  tenure: string;
}

export interface NearbyAmenity {
  id: string;
  amenityType: AmenityType;
  name: string;
  distanceMeters: number;
  walkMinutes: number;
}

export interface DistrictInfo {
  number: number;
  name: string;
  region: Region;
  projectCount: number;
  avgPsf: number;
  medianPrice: number;
}

export interface PriceIndex {
  quarter: string;
  ccr: number;
  rcr: number;
  ocr: number;
  overall: number;
}
