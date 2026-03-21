/**
 * data.gov.sg client — amenity datasets (MRT, schools, parks, hospitals).
 *
 * Two API patterns:
 * 1. Tabular (CSV): GET /api/action/datastore_search?resource_id={id}&limit=N&offset=N
 * 2. GeoJSON: Initiate download → poll → fetch GeoJSON FeatureCollection
 *
 * Rate limit: 5 req/min (no API key needed for public datasets).
 *
 * @see https://guide.data.gov.sg/developer-guide/api-overview
 */

const BASE_URL = "https://data.gov.sg/api/action";

// --- Dataset IDs ---

/** MOE General information of schools (tabular CSV, 31 columns) */
const SCHOOLS_DATASET = "d_688b934f82c1059ed0a6993d2a829089";

/** LTA Train Station Exit Points (GeoJSON with coordinates) */
const MRT_STATIONS_DATASET = "d_b39d3a0871985372d7e1337a3039e4db";

/** LTA Commuter Facilities — bus stops, interchanges, terminals (GeoJSON) */
const BUS_FACILITIES_DATASET = "d_778e6d2eaf4a3812aab0d1a1bdf7fd38";

/** MOH CHAS Clinics — healthcare facilities (GeoJSON) */
const HEALTHCARE_DATASET = "d_548c33ea2d99e29ec63a7cc9edcccedc";

/** NParks Parks (GeoJSON) */
const PARKS_DATASET = "d_0542d48be5614a1586715913e28c4cd8";

/** Shopping malls / supermarkets (GeoJSON) */
const SUPERMARKETS_DATASET = "d_cac2c32f01960a3ad7202a99c27268a0";

// --- Shared types ---

export interface Amenity {
  name: string;
  type: "mrt" | "bus_interchange" | "school" | "mall" | "park" | "hospital";
  latitude: number;
  longitude: number;
}

// --- Tabular API ---

interface DatastoreResponse<T> {
  success: boolean;
  result: {
    records: T[];
    total: number;
    _links: { next?: string };
  };
}

async function fetchTabular<T>(datasetId: string, limit = 5000): Promise<T[]> {
  const allRecords: T[] = [];
  let offset = 0;

  while (true) {
    const url = `${BASE_URL}/datastore_search?resource_id=${datasetId}&limit=${limit}&offset=${offset}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `data.gov.sg API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as DatastoreResponse<T>;
    const records = data.result.records;
    allRecords.push(...records);

    if (records.length < limit) break;
    offset += limit;
  }

  return allRecords;
}

// --- GeoJSON download API ---

interface PollDownloadResponse {
  data: { url: string };
  code: number;
}

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

interface GeoJsonFeature {
  type: "Feature";
  properties: Record<string, string>;
  geometry: {
    type: string;
    coordinates: number[]; // [lng, lat] or [lng, lat, elevation]
  };
}

async function fetchGeoJson(datasetId: string): Promise<GeoJsonFeature[]> {
  // Step 1: Initiate download
  const initUrl = `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/initiate-download`;
  const initResponse = await fetch(initUrl, { method: "GET" });

  if (!initResponse.ok) {
    throw new Error(
      `data.gov.sg initiate download failed: ${initResponse.status}`,
    );
  }

  const initData = (await initResponse.json()) as PollDownloadResponse;

  if (initData.code !== 0 || !initData.data?.url) {
    // Try poll-download as fallback
    const pollUrl = `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/poll-download`;
    const pollResponse = await fetch(pollUrl);

    if (!pollResponse.ok) {
      throw new Error(
        `data.gov.sg poll download failed: ${pollResponse.status}`,
      );
    }

    const pollData = (await pollResponse.json()) as PollDownloadResponse;

    if (pollData.code !== 0 || !pollData.data?.url) {
      throw new Error("data.gov.sg: unable to get download URL");
    }

    return fetchGeoJsonFromUrl(pollData.data.url);
  }

  return fetchGeoJsonFromUrl(initData.data.url);
}

async function fetchGeoJsonFromUrl(url: string): Promise<GeoJsonFeature[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GeoJSON fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as GeoJsonFeatureCollection;
  return data.features ?? [];
}

function extractName(properties: Record<string, string>): string {
  // data.gov.sg GeoJSON uses various property names
  return (
    properties.Name ??
    properties.NAME ??
    properties.name ??
    properties.STATION_NAME ??
    properties.STN_NAME ??
    properties.Description ??
    "Unknown"
  );
}

function extractCoords(
  feature: GeoJsonFeature,
): { latitude: number; longitude: number } | null {
  const coords = feature.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;

  // GeoJSON is [lng, lat]
  const [longitude, latitude] = coords;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude === 0 ||
    longitude === 0
  ) {
    return null;
  }

  return { latitude, longitude };
}

// --- Helpers ---

function featuresToAmenities(
  features: GeoJsonFeature[],
  type: Amenity["type"],
  filter?: (f: GeoJsonFeature) => boolean,
): Amenity[] {
  const amenities: Amenity[] = [];

  for (const f of features) {
    if (filter && !filter(f)) continue;
    const coords = extractCoords(f);
    if (!coords) continue;
    amenities.push({ name: extractName(f.properties), type, ...coords });
  }

  return amenities;
}

// --- Public API ---

export async function getMrtStations(): Promise<Amenity[]> {
  const features = await fetchGeoJson(MRT_STATIONS_DATASET);
  return featuresToAmenities(features, "mrt");
}

export async function getBusInterchanges(): Promise<Amenity[]> {
  const features = await fetchGeoJson(BUS_FACILITIES_DATASET);

  return featuresToAmenities(features, "bus_interchange", (f) => {
    const name = extractName(f.properties).toLowerCase();
    const desc = (
      f.properties.Description ??
      f.properties.DESCRIPTION ??
      ""
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
  const records = await fetchTabular<SchoolRecord>(SCHOOLS_DATASET);

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
  const features = await fetchGeoJson(PARKS_DATASET);
  return featuresToAmenities(features, "park");
}

export async function getHealthcareFacilities(): Promise<Amenity[]> {
  const features = await fetchGeoJson(HEALTHCARE_DATASET);
  return featuresToAmenities(features, "hospital");
}

export async function getMalls(): Promise<Amenity[]> {
  const features = await fetchGeoJson(SUPERMARKETS_DATASET);
  return featuresToAmenities(features, "mall");
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
