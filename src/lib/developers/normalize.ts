import { slugify } from "@/lib/slug";

/**
 * Verified mapping of URA SPV/JV entity names → consumer-facing parent brands.
 * Keys are UPPERCASE for case-insensitive lookup.
 * Research confirmed via web search (Mar 2026).
 */
const SPV_TO_BRAND: Record<string, string> = {
  // A
  "165@LOYANG PTE LTD": "Jinmac / KY Group",
  "39 ROBINSON ROAD PTE LTD": "Tuan Sing Holdings",
  "ASK DEVELOPMENT PTE LTD": "Amara Holdings / Santarli / Kay Lim",
  "ACE SHENTON DEVELOPMENT PTE LTD/SHENTON COMMERCIAL PROPERTY PTE LTD/SHENTON HOTEL PROPERTY PTE LTD/SHENTON OFFICE PROPERTY PTE LTD/SHENTON RESIDENTIAL PROPERTY PTE LTD":
    "Perennial Holdings",
  "AMERALD LAND PTE LTD": "Amerald Land",
  "ANDERSON INTERNATIONAL PROPERTIES PTE. LTD/RAFFLES LEGEND PROPERTIES PTE. LTD.":
    "Kheng Leong",
  "APEX ASIA (2) PTE. LTD.": "Apex Asia Development",

  // B
  "BAYSHORE WALK PTE LTD": "SingHaiyi Group",
  "BOULEVARD DEVELOPMENT PTE LTD/BOULEVARD MIDTOWN PTE LTD": "IOI Properties",
  "BUKIT ONE PTE. LTD.": "Bukit Sembawang Estates",

  // C
  "CDL ARIES PTE LTD": "City Developments Limited",
  "CDL LIBRA PTE LTD/CDL CONSERVO PTE LTD/CENTRO PROPERTY HOLDING PTE LTD":
    "City Developments Limited",
  "CDL LIBRA PTE. LTD.": "City Developments Limited",
  "CDL PISCES COMMERCIAL PTE LTD/CDL PISCES SERVICED RESIDENCES PTE LTD/HONG LEONG PROPERTIES PTE LTD":
    "City Developments Limited / Hong Leong",
  "CDL STELLAR PTE. LTD.": "City Developments Limited",
  "CDL STELLAR PTE LTD": "City Developments Limited",
  "CDL ZENITH PTE LTD": "City Developments Limited",
  "CDL-MFA ALTAIR PROPERTY PTE LTD/CDL-MFA VEGA PROPERTY PTE LTD":
    "City Developments Limited / Mitsui Fudosan",
  "CDL-MFA ALTAIR PROPERTY PTE. LTD. & CDL-MFA VEGA PROPERTY PTE. LTD.":
    "City Developments Limited / Mitsui Fudosan",
  "CNQC REALTY (PHOENIX) PTE LTD": "Qingjian Realty",
  "CSC LAND GROUP (SINGAPORE) PTE LTD/SEKISUI HOUSE LTD/FRASERS PROPERTY PHOENIX II PTE LTD":
    "CSC Land Group / Sekisui House / Frasers Property",
  "CARMEL DEVELOPMENT PTE LTD": "Hong Leong Holdings / GuocoLand",
  "CENTRA NOVENA PTE LTD": "Centra Novena",
  "CHUAN PARK DEVELOPMENT PTE LTD": "Kingsford Development / MCC Land",
  "CHUAN PARK DEVELOPMENT PTE. LTD.": "Kingsford Development / MCC Land",

  // D
  "DAIRY FARM WALK JV DEVELOPMENT PTE. LTD.": "Apex Asia / Santarli",
  "DAIRY FARM WALK JV DEVELOPMENT PTE LTD": "Apex Asia / Santarli",
  "DBS TRUSTEE LIMITED/LEGEND COMMERCIAL TRUSTEE PTE LTD/LEGEND QUAY PTE LTD":
    "City Developments Limited / CapitaLand Development",

  // E
  "EG PROPERTIES PTE LTD": "Euro Properties",
  "EL DEVELOPMENT (BUONA VISTA) PTE LTD/EL DEVELOPMENT (ONE-NORTH) PTE LTD":
    "EL Development",
  "EAST ASIA SOPHIA DEVELOPMENT PTE LTD": "Dongya Xinhua Group",
  "EAST RESIDENCES PTE LTD": "Far East Organization",
  "EVELYN PTE LTD": "Victory Land Group",

  // F
  "FE LANDMARK PTE LTD/FEC RESIDENCES TRUSTEE PTE LTD/FEC RETAIL TRUSTEE PTE LTD":
    "Far East Organization / Sino Group",
  "FABER RESIDENCE PTE LTD": "GuocoLand / Hong Leong Holdings",
  "FAIRVIEW DEVELOPMENTS PTE LTD": "Tong Eng Group",
  "FRAGRANCE GRANDEUR PTE LTD": "Fragrance Group",

  // G
  "GLG CAPITAL PTE LTD": "GuocoLand / Hong Leong Group",
  "GMC PROPERTY PTE. LTD.": "Perennial Holdings",
  "GOLDEN RAY EDGE 3 PTE LTD": "MCL Land / Sinarmas Land",
  "GRAND DUNMAN PTE LTD": "SingHaiyi Group / CSC Land Group",
  "GRANGE 1866 PTE LTD": "Heeton Holdings",

  // H
  "HC LAND (CLEMENTI) PTE LTD": "MCL Land / CSC Land Group",
  "HOI HUP SUNWAY TAMPINES RESIDENTIAL PTE. LTD.":
    "Hoi Hup Realty / Sunway Developments",
  "HOI HUP SUNWAY TAMPINES RESIDENTIAL PTE LTD/HUP SUNWAY TAMPINES COMMERCIAL PTE LTD":
    "Hoi Hup Realty / Sunway Developments",
  "HOI HUP SUNWAY JURONG PTE LTD": "Hoi Hup Realty / Sunway Developments",
  "HOI HUP SUNWAY JURONG PTE. LTD.": "Hoi Hup Realty / Sunway Developments",
  "HOI HUP SUNWAY KATONG PTE LTD": "Hoi Hup Realty / Sunway Developments",
  "HOI HUP SUNWAY KENT RIDGE PTE LTD": "Hoi Hup Realty / Sunway Developments",
  "HOI HUP SUNWAY PLANTATION PTE LTD": "Hoi Hup Realty / Sunway Developments",
  "HOI HUP SUNWAY PLANTATION PTE. LTD.": "Hoi Hup Realty / Sunway Developments",
  "HOLLY DEVELOPMENT PTE. LTD.":
    "UOL Group / Kheng Leong / CapitaLand Development",
  "HOLLY DEVELOPMENT PTE LTD":
    "UOL Group / Kheng Leong / CapitaLand Development",
  "HPL PROPERTIES PTE LTD": "Hotel Properties Limited",
  "HILLSIDE VIEW DEVELOPMENT PTE LTD": "Tong Eng Group",
  "HONG HOW LAND PTE LTD": "Tong Eng Group",
  "HONG LEONG HOLDINGS LIMITED": "Hong Leong Group",

  // K
  "KSH ULTRA UNITY PTE LTD": "KSH Holdings",
  "KEFI DEVELOPMENT PTE LTD": "Kefi Development",
  "KIMEN REALTY PTE LTD": "Kimen Realty",
  "KINGSFORD LENTOR PROJECT PTE LTD": "Kingsford Development",
  "KINGSFORD MARINA DEVELOPMENT PTE LTD": "Kingsford Development",
  "KINGSFORD MARINA DEVELOPMENT PTE. LTD.": "Kingsford Development",
  "KINGSFORD REAL ESTATE DEVELOPMENT PTE LTD": "Kingsford Development",

  // L
  "LAKESIDE RESIDENTIAL PTE LTD": "Chip Eng Seng / SingHaiyi / KSH Holdings",
  "LENTOR CENTRAL DEVELOPMENTS PTE LTD":
    "Forsea Holdings / Soilbuild Group / United Engineers",
  "LENTOR CENTRAL PARK PTE LTD":
    "Hong Leong Holdings / GuocoLand / CSC Land Group",
  "LENTOR CENTRAL PARK PTE. LTD.":
    "Hong Leong Holdings / GuocoLand / CSC Land Group",
  "LENTOR HILLS DEVELOPMENT PTE LTD": "Hong Leong Holdings / GuocoLand / TID",
  "LENTOR MANSION PTE LTD": "GuocoLand / Hong Leong Holdings",
  "LENTOR VIEW PTE LTD": "TID (Hong Leong / Mitsui Fudosan)",

  // M
  "MCC LAND (TMK) PTE LTD": "MCC Land",
  "MNG 108 PTE LTD": "MNG Development",
  "MARGARET RISE DEVELOPMENT PTE LTD": "GuocoLand / Hong Leong Holdings",
  "MARGARET RISE DEVELOPMENT PTE. LTD.": "GuocoLand / Hong Leong Holdings",
  "MARINA CENTRE HOLDINGS PTE LTD/SINGAPORE LAND GROUP LTD":
    "UOL Group / Singapore Land Group",
  "MAXWELL COMMERCIAL PTE LTD/MAXWELL RESIDENTIAL PTE LTD":
    "Chip Eng Seng / SingHaiyi",
  "MEDIA CIRCLE DEVELOPMENT PTE LTD": "Qingjian Realty / Forsea Holdings",
  "MEQUITY GS PTE LTD": "Macly Group",
  "MEQUITY HILLS PTE LTD": "Macly Group / Roxy-Pacific Holdings",
  "MEQUITY K PTE LTD": "Macly Group",

  // N
  "NS PROPERTY (HAIG) PTE LTD": "Nanshan Group",

  // O
  "OPTIMUS HILL PTE LTD": "Optimus Hill",
  "ORCHARD SOPHIA PTE LTD": "DB2Land",

  // P
  "PASIR RIS DEVELOPMENT PTE. LTD.":
    "Qingjian Realty / Forsea Holdings / ZACD Group",
  "PASIR RIS DEVELOPMENT PTE LTD":
    "Qingjian Realty / Forsea Holdings / ZACD Group",
  "PEAK CRESCENT PTE LTD": "Kheng Leong / Low Keng Huat",
  "PEAK VISTA PTE LTD": "Kheng Leong",
  "PRIMEST LAND V1 PTE LTD": "Primest Land Group",

  // R
  "RH KATONG PTE LTD": "Roxy-Pacific Holdings",
  "RIVERSIDE PROPERTY PTE. LTD": "Frasers Property / Sekisui House",
  "RIVERSIDE PROPERTY PTE LTD": "Frasers Property / Sekisui House",
  "RL BAGNALL PTE LTD": "Roxy-Pacific Holdings",
  "RIVER MODERN PTE LTD": "GuocoLand",
  "RIVER VALLEY TOWER PTE LTD": "Frasers Property",
  "ROBIN DEVELOPMENT PTE LTD": "Lian Huat Group",

  // S
  "SIM LIAN JV (NORTHBANK) PTE. LTD.": "Sim Lian Group",
  "SIM LIAN JV (NORTHBANK) PTE LTD": "Sim Lian Group",
  "SIM LIAN JV (DAIRY FARM) PTE LTD": "Sim Lian Group",
  "SIM LIAN JV (KATONG) PTE LTD": "Sim Lian Group",
  "SIM LIAN JV (TAMPINES 7) PTE LTD": "Sim Lian Group",
  "SL CAPITAL (8) PTE LTD": "Sustained Land / Ho Lee Group",
  "SHENTON RESIDENTIAL PROPERTY PTE. LTD": "Perennial Holdings",
  "SHUN TAK CUSCADEN RESIDENTIAL PTE LTD": "Shun Tak Holdings",
  "SIN THAI HIN DEVELOPMENT PTE LTD": "Sin Thai Hin Holdings",
  "SING HOLDINGS (YISHUN) PTE LTD": "Sing Holdings",
  "SINGAPORE UNITED ESTATES (PRIVATE) LIMITED.": "Bukit Sembawang Estates",
  "SINGAPORE UNITED ESTATES (PRIVATE) LIMITED": "Bukit Sembawang Estates",
  "SINGAPORE UNITED ESTATES PTE LTD": "Bukit Sembawang Estates",
  "SOPHIA RESIDENTIAL PTE LTD/SOPHIA COMMERCIAL PTE LTD":
    "Chip Eng Seng / SingHaiyi",
  "SPRINGLEAF RESIDENCE PTE LTD": "GuocoLand / Hong Leong Holdings",
  "SPRINGLEAF RESIDENCE PTE. LTD.": "GuocoLand / Hong Leong Holdings",
  "SPRINGLEAF RESIDENCE PTE. LTD. ": "GuocoLand / Hong Leong Holdings",

  // T
  "TQS (2) DEVELOPMENT PTE LTD": "Qingjian Realty / Santarli Realty",
  "TQS DEVELOPMENT PTE LTD":
    "Qingjian Realty / Santarli Realty / Heeton Holdings",
  "TANGLIN R.E. HOLDINGS PTE LTD": "CapitaLand Development",
  "TAURUS PROPERTIES SG PTE LTD": "City Developments Limited / MCL Land",
  "TEMBUSU RESIDENTIAL PTE LTD": "City Developments Limited / MCL Land",
  "TENGAH GARDEN DEVELOPMENT PTE LTD/TGA DEVELOPMENT PTE LTD":
    "Hong Leong Holdings / GuocoLand / CSC Land",
  "TOPAZ RESIDENTIAL PTE LTD":
    "UOL Group / Singapore Land / CapitaLand Development",
  "TOPAZ RESIDENTIAL PTE LTD/TOPAZ COMMERCIAL PTE LTD":
    "UOL Group / Singapore Land / CapitaLand Development",
  "TRANSCEND RESIDENTIAL (TOA PAYOH) PTE LTD":
    "City Developments Limited / Frasers Property / Sekisui House",
  "TRIPARTITE DEVELOPERS PTE LTD":
    "Hong Leong Holdings / City Developments Limited / TID",
  "TUAS VIEW DEVELOPMENT PTE LTD": "CapitaLand Development",

  // U
  "UE DEVELOPMENT (ANSON) PTE LTD": "United Engineers (Yanlord Land)",
  "UNITED VENTURE DEVELOPMENT (MEYER) PTE. LTD.": "UOL Group / Singapore Land",
  "UNITED VENTURE DEVELOPMENT (MEYER) PTE LTD": "UOL Group / Singapore Land",
  "UNITED VENTURE DEVELOPMENT (NO. 7) PTE. LTD.": "UOL Group / Singapore Land",
  "UNITED VENTURE DEVELOPMENT (NO.7) PTE LTD": "UOL Group / Singapore Land",
  "UNITED VENTURE DEVELOPMENT (NO. 5) PTE LTD": "UOL Group / Singapore Land",
  "UNITED VENTURE DEVELOPMENT (WATTEN) PTE LTD": "UOL Group / Singapore Land",
  "URBAN PARK PTE LTD": "Far East Organization",

  // V
  "VALERIAN RESIDENTIAL PTE LTD": "Allgreen Properties",
  "VALERIAN RESIDENTIAL PTE. LTD.": "Allgreen Properties",

  // W
  "WINCHAMP INVESTMENT PTE LTD": "Wing Tai Holdings",
  "WHITE HILLS DEVELOPMENT PTE LTD": "White Hills Development",
  "WINVILLE INVESTMENT PTE LTD": "Wing Tai Holdings",

  // Z
  "ZACD LV DEVELOPMENT PTE LTD": "ZACD Group",
  "ZACD PROPERTY PTE LTD": "ZACD Group",
};

/**
 * Normalise a raw URA SPV/JV entity name to a consumer-facing parent brand.
 * Exact match against a verified static lookup table.
 * Falls back to stripping legal suffixes if no match found.
 */
export function normaliseDeveloperName(spvName: string): string {
  const key = spvName.trim().toUpperCase();

  // Direct lookup
  if (key in SPV_TO_BRAND) {
    return SPV_TO_BRAND[key];
  }

  // Try without trailing whitespace/period variations
  const cleaned = key.replace(/\.\s*$/, "").replace(/\s+$/, "");
  if (cleaned in SPV_TO_BRAND) {
    return SPV_TO_BRAND[cleaned];
  }

  return cleanSpvName(spvName.trim());
}

/** Strip common legal suffixes from an SPV name as a fallback. */
function cleanSpvName(name: string): string {
  return name
    .replace(/\s*\(?\s*pte\.?\s*\)?\s*ltd\.?\s*/gi, "")
    .replace(/\s*private\s+limited\s*/gi, "")
    .replace(/\s*limited\s*$/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Get the slug for a normalised developer brand name.
 */
export function developerSlug(brandName: string): string {
  return slugify(brandName);
}

/**
 * Batch-normalise an array of SPV names.
 * Returns a Map of original SPV name → parent brand.
 */
export function normaliseDeveloperNames(
  spvNames: string[],
): Map<string, string> {
  const result = new Map<string, string>();
  for (const name of spvNames) {
    result.set(name, normaliseDeveloperName(name));
  }
  return result;
}
