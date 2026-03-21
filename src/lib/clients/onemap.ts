/**
 * OneMap API client — auth + planning area query only.
 *
 * Base URL: https://www.onemap.gov.sg
 * Auth: POST /api/auth/post/getToken with email/password, returns 3-day JWT.
 *
 * @see https://www.onemap.gov.sg/apidocs
 */

const BASE_URL = "https://www.onemap.gov.sg";

// Module-level token cache (resets on cold start)
let cachedToken: { value: string; expiresAt: number } | null = null;

function getCredentials(): { email: string; password: string } {
  const email = process.env.ONEMAP_EMAIL;
  const password = process.env.ONEMAP_EMAIL_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "ONEMAP_EMAIL and ONEMAP_EMAIL_PASSWORD environment variables are required",
    );
  }
  return { email, password };
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const { email, password } = getCredentials();

  const response = await fetch(`${BASE_URL}/api/auth/post/getToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(
      `OneMap auth failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expiry_timestamp: string;
  };

  // Cache with 1 hour buffer before actual expiry
  const expiresAt = Number(data.expiry_timestamp) * 1000 - 60 * 60 * 1000;

  cachedToken = {
    value: data.access_token,
    expiresAt,
  };

  return data.access_token;
}

interface PlanningAreaResponse {
  pln_area_n: string;
  geojson?: unknown;
}

/**
 * Query which planning area a coordinate falls in.
 *
 * @param latitude WGS84 latitude
 * @param longitude WGS84 longitude
 * @returns Planning area name, or null if not found
 */
export async function getPlanningArea(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const token = await getToken();

  const url = new URL(`${BASE_URL}/api/public/popapi/getPlanningarea`);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));

  const response = await fetch(url.toString(), {
    headers: { Authorization: token },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`OneMap planning area query failed: ${response.status}`);
  }

  const data = (await response.json()) as PlanningAreaResponse[];
  if (!data.length) return null;

  return data[0].pln_area_n ?? null;
}
