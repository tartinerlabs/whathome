import { svy21ToWgs84 } from "@/lib/geo";

const DATAGOV_BASE_URL = "https://data.gov.sg/api/action/datastore_search";

// --- Dataset IDs ---

/** MOE General information of schools (tabular CSV, 31 columns) */
const SCHOOLS_DATASET = "d_688b934f82c1059ed0a6993d2a829089";

/** LTA MRT Station Exit Points — deduplicate by STATION_NA for centroids */
const MRT_STATIONS_DATASET = "d_b39d3a0871985372d7e1637193335da5";

/** LTA Commuter Facilities — bus stops, interchanges, terminals (GeoJSON) */
const BUS_FACILITIES_DATASET = "d_778e6d2eaf4a3812aab0d1a1bdf7fd38";

/** MOH CHAS Clinics — healthcare facilities (GeoJSON, SVY21 coordinates) */
const HEALTHCARE_DATASET = "d_548c33ea2d99e29ec63a7cc9edcccedc";

/** NParks Parks point centroids (GeoJSON) */
const PARKS_DATASET = "d_0542d48f0991541706b58059381a6eca";

/** Supermarkets (GeoJSON) — proxy for malls; no dedicated mall dataset exists */
const SUPERMARKETS_DATASET = "d_cac2c32f01960a3ad7202a99c27268a0";

/** URA Non-landed Property Price Index by Locality, Quarterly (CCR/RCR/OCR) */
const PRICE_INDEX_DATASET = "d_f65e490a8ad430f60a9a3d9df2bff2a0";

// --- Shared types ---

export interface Amenity {
  name: string;
  type: "mrt" | "bus_interchange" | "school" | "mall" | "park" | "hospital";
  latitude: number;
  longitude: number;
}

interface CkanResponse<T> {
  success: boolean;
  result: {
    records: T[];
    total: number;
    limit: number;
  };
}

async function fetchRecords<T>(datasetId: string, limit = 500): Promise<T[]> {
  const allRecords: T[] = [];
  let offset = 0;

  while (true) {
    const url = `${DATAGOV_BASE_URL}?resource_id=${datasetId}&offset=${offset}&limit=${limit}`;

    const response = await fetch(url, {
      headers: { "x-api-key": process.env.DATAGOV_API_KEY! },
    });
    if (!response.ok) {
      throw new Error(
        `data.gov.sg API error: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as CkanResponse<T>;
    if (!json.success) {
      throw new Error("data.gov.sg query failed");
    }

    const records = json.result.records;
    allRecords.push(...records);

    if (records.length < limit || allRecords.length >= json.result.total) break;
    offset += limit;
  }

  return allRecords;
}

type GeoRecord = Record<
  string,
  string | number | Record<string, unknown> | null
>;

function extractName(record: GeoRecord): string {
  return String(
    record.STATION_NA ??
      record.HCI_NAME ??
      record.Name ??
      record.NAME ??
      record.name ??
      record.Description ??
      "Unknown",
  );
}

function extractCoords(
  record: GeoRecord,
): { latitude: number; longitude: number } | null {
  const lat = Number(record.LATITUDE ?? record.latitude ?? record.lat);
  const lng = Number(record.LONGITUDE ?? record.longitude ?? record.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
    return { latitude: lat, longitude: lng };
  }

  return null;
}

function recordsToAmenities(
  records: GeoRecord[],
  type: Amenity["type"],
  filter?: (record: GeoRecord) => boolean,
): Amenity[] {
  const amenities: Amenity[] = [];

  for (const record of records) {
    if (filter && !filter(record)) continue;
    const coords = extractCoords(record);
    if (!coords) continue;
    amenities.push({ name: extractName(record), type, ...coords });
  }

  return amenities;
}

// --- Public API ---

export async function getMrtStations(): Promise<Amenity[]> {
  const records = await fetchRecords<GeoRecord>(MRT_STATIONS_DATASET);

  // Dataset has multiple exits per station — deduplicate by STATION_NA,
  // averaging coordinates to get a station centroid
  const stationMap = new Map<string, { lats: number[]; lngs: number[] }>();

  for (const record of records) {
    const coords = extractCoords(record);
    if (!coords) continue;

    const name = String(record.STATION_NA ?? extractName(record));
    const existing = stationMap.get(name);
    if (existing) {
      existing.lats.push(coords.latitude);
      existing.lngs.push(coords.longitude);
    } else {
      stationMap.set(name, {
        lats: [coords.latitude],
        lngs: [coords.longitude],
      });
    }
  }

  const amenities: Amenity[] = [];
  for (const [name, { lats, lngs }] of stationMap) {
    amenities.push({
      name,
      type: "mrt",
      latitude: lats.reduce((a, b) => a + b, 0) / lats.length,
      longitude: lngs.reduce((a, b) => a + b, 0) / lngs.length,
    });
  }

  return amenities;
}

export async function getBusInterchanges(): Promise<Amenity[]> {
  const records = await fetchRecords<GeoRecord>(BUS_FACILITIES_DATASET);

  return recordsToAmenities(records, "bus_interchange", (record) => {
    const name = extractName(record).toLowerCase();
    const desc = String(
      record.Description ?? record.DESCRIPTION ?? "",
    ).toLowerCase();

    return (
      desc.includes("interchange") ||
      desc.includes("terminal") ||
      name.includes("interchange") ||
      name.includes("terminal")
    );
  });
}

interface SchoolRecord {
  school_name: string;
  postal_code: string;
  address: string;
  mainlevel_code: string;
  [key: string]: string;
}

export async function getSchools(): Promise<Amenity[]> {
  const records = await fetchRecords<SchoolRecord>(SCHOOLS_DATASET);

  // Schools dataset has no coordinates — return with 0,0 for geocoding later
  return records
    .filter((r) => r.school_name)
    .map(
      (r): Amenity => ({
        name: r.school_name,
        type: "school",
        latitude: 0,
        longitude: 0,
      }),
    );
}

export async function getParks(): Promise<Amenity[]> {
  const records = await fetchRecords<GeoRecord>(PARKS_DATASET);
  return recordsToAmenities(records, "park");
}

export async function getHealthcareFacilities(): Promise<Amenity[]> {
  const records = await fetchRecords<GeoRecord>(HEALTHCARE_DATASET);

  const amenities: Amenity[] = [];

  for (const record of records) {
    const name = String(record.HCI_NAME ?? extractName(record));

    let coords = extractCoords(record);

    // Fall back to SVY21 properties if lat/lng columns are missing
    if (!coords) {
      const easting = Number.parseFloat(String(record.X_COORDINATE ?? ""));
      const northing = Number.parseFloat(String(record.Y_COORDINATE ?? ""));
      if (
        Number.isFinite(easting) &&
        Number.isFinite(northing) &&
        easting > 0 &&
        northing > 0
      ) {
        coords = svy21ToWgs84(easting, northing);
      }
    }

    if (!coords) continue;
    amenities.push({ name, type: "hospital", ...coords });
  }

  return amenities;
}

export async function getMalls(): Promise<Amenity[]> {
  const records = await fetchRecords<GeoRecord>(SUPERMARKETS_DATASET);
  return recordsToAmenities(records, "mall");
}

/** Fetch all amenity types in parallel. */
export async function getAllAmenities(): Promise<Amenity[]> {
  const [mrt, buses, parks, healthcare, malls] = await Promise.all([
    getMrtStations(),
    getBusInterchanges(),
    getParks(),
    getHealthcareFacilities(),
    getMalls(),
  ]);

  // Schools excluded from bulk fetch — no coordinates, need geocoding
  return [...mrt, ...buses, ...parks, ...healthcare, ...malls];
}

// --- Price Indices ---

interface PriceIndexRecord {
  quarter: string;
  market_segment: string;
  price_index: string;
  _id: number;
}

const SEGMENT_TO_REGION: Record<string, "CCR" | "RCR" | "OCR"> = {
  "Core Central Region": "CCR",
  "Rest of Central Region": "RCR",
  "Outside Central Region": "OCR",
};

export interface PriceIndexRow {
  quarter: string;
  region: "CCR" | "RCR" | "OCR";
  indexValue: number;
}

export async function getPriceIndexData(): Promise<PriceIndexRow[]> {
  const records = await fetchRecords<PriceIndexRecord>(PRICE_INDEX_DATASET);

  const rows: PriceIndexRow[] = [];

  for (const record of records) {
    const region = SEGMENT_TO_REGION[record.market_segment];
    if (!region) continue;

    const indexValue = Number.parseFloat(record.price_index);
    if (!Number.isFinite(indexValue)) continue;

    rows.push({ quarter: record.quarter, region, indexValue });
  }

  return rows;
}
