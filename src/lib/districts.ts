import type { Region } from "@/lib/types";

interface DistrictMeta {
  name: string;
  region: Region;
}

export const DISTRICT_NAMES: Record<number, DistrictMeta> = {
  1: { name: "Raffles Place, Cecil, Marina, People's Park", region: "CCR" },
  2: { name: "Anson, Tanjong Pagar", region: "CCR" },
  3: { name: "Queenstown, Tiong Bahru", region: "CCR" },
  4: { name: "Telok Blangah, Harbourfront", region: "CCR" },
  5: {
    name: "Pasir Panjang, Hong Leong Garden, Clementi New Town",
    region: "RCR",
  },
  6: { name: "High Street, Beach Road, City Hall", region: "CCR" },
  7: { name: "Middle Road, Golden Mile", region: "CCR" },
  8: { name: "Little India", region: "RCR" },
  9: { name: "Orchard, Cairnhill, River Valley", region: "CCR" },
  10: { name: "Ardmore, Bukit Timah, Holland Road, Tanglin", region: "CCR" },
  11: { name: "Watten Estate, Novena, Thomson", region: "CCR" },
  12: { name: "Balestier, Toa Payoh, Serangoon", region: "RCR" },
  13: { name: "Macpherson, Braddell", region: "RCR" },
  14: { name: "Geylang, Eunos", region: "RCR" },
  15: { name: "Katong, Joo Chiat, Amber Road", region: "RCR" },
  16: { name: "Bedok, Upper East Coast, Eastwood, Kew Drive", region: "OCR" },
  17: { name: "Loyang, Changi", region: "OCR" },
  18: { name: "Tampines, Pasir Ris", region: "OCR" },
  19: { name: "Serangoon Garden, Hougang, Ponggol", region: "OCR" },
  20: { name: "Bishan, Ang Mo Kio", region: "OCR" },
  21: { name: "Upper Bukit Timah, Clementi Park, Ulu Pandan", region: "OCR" },
  22: { name: "Jurong", region: "OCR" },
  23: {
    name: "Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang",
    region: "OCR",
  },
  24: { name: "Lim Chu Kang, Tengah", region: "OCR" },
  25: { name: "Kranji, Woodgrove, Woodlands", region: "OCR" },
  26: { name: "Upper Thomson, Springleaf", region: "OCR" },
  27: { name: "Yishun, Sembawang", region: "OCR" },
  28: { name: "Seletar", region: "OCR" },
};
