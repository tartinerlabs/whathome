export type ThemeVariant = "full" | "soft";

export interface ProjectCardData {
  name: string;
  slug: string;
  developer: string;
  district: number;
  region: "CCR" | "RCR" | "OCR";
  status: "upcoming" | "launched" | "selling" | "sold_out" | "completed";
  tenure: "freehold" | "99-year" | "999-year" | "103-year";
  psfMin: number;
  psfMax: number;
  totalUnits: number;
  unitsSold: number;
  topDate: string;
  thumbnailUrl?: string;
}

export interface UnitMixRow {
  unitType: "1BR" | "2BR" | "3BR" | "4BR" | "5BR" | "Penthouse";
  sizeSqftMin: number;
  sizeSqftMax: number;
  pricePsf: number;
  priceFrom: number;
  priceTo: number;
  totalCount: number;
  soldCount: number;
}

export interface PsfDataPoint {
  month: string;
  psf: number;
}

export interface FilterState {
  regions: ("CCR" | "RCR" | "OCR")[];
  district: number | null;
  tenures: ("freehold" | "99-year" | "999-year" | "103-year")[];
  statuses: ("upcoming" | "launched" | "selling" | "sold_out" | "completed")[];
}
