/**
 * SVY21 → WGS84 coordinate conversion.
 *
 * SVY21 (Singapore) uses a Transverse Mercator projection.
 * Reference: Singapore Land Authority SVY21 Technical Reference.
 */

// SVY21 projection parameters
const A = 6378137; // Semi-major axis of WGS84 ellipsoid
const F = 1 / 298.257223563; // Flattening
const ORIGIN_LAT = (1 + 22 / 60 + 2.9154 / 3600) * (Math.PI / 180); // 1°22′02.9154″N
const ORIGIN_LNG = (103 + 49 / 60 + 31.9752 / 3600) * (Math.PI / 180); // 103°49′31.9752″E
const FALSE_NORTHING = 38744.572;
const FALSE_EASTING = 28001.642;
const SCALE_FACTOR = 1;

// Derived constants
const B = A * (1 - F); // Semi-minor axis
const E2 = 2 * F - F * F; // Eccentricity squared
const E4 = E2 * E2;
const E6 = E4 * E2;
const A0 = 1 - E2 / 4 - (3 * E4) / 64 - (5 * E6) / 256;
const A2 = (3 / 8) * (E2 + E4 / 4 + (15 * E6) / 128);
const A4 = (15 / 256) * (E4 + (3 * E6) / 4);
const A6 = (35 * E6) / 3072;

function meridianDistance(lat: number): number {
  return (
    A *
    (A0 * lat -
      A2 * Math.sin(2 * lat) +
      A4 * Math.sin(4 * lat) -
      A6 * Math.sin(6 * lat))
  );
}

function footpointLatitude(m: number): number {
  const n = (A - B) / (A + B);
  const n2 = n * n;
  const n3 = n2 * n;
  const n4 = n2 * n2;

  const g =
    A *
    (1 - n) *
    (1 - n2) *
    (1 + (9 * n2) / 4 + (225 * n4) / 64) *
    (Math.PI / 180);
  const sigma = (m * Math.PI) / (180 * g);

  const latPrime =
    sigma +
    ((3 * n) / 2 - (27 * n3) / 32) * Math.sin(2 * sigma) +
    ((21 * n2) / 16 - (55 * n4) / 32) * Math.sin(4 * sigma) +
    ((151 * n3) / 96) * Math.sin(6 * sigma) +
    ((1097 * n4) / 512) * Math.sin(8 * sigma);

  return latPrime;
}

/**
 * Convert SVY21 coordinates (Easting, Northing) to WGS84 (latitude, longitude).
 *
 * @param easting - SVY21 X coordinate (Easting)
 * @param northing - SVY21 Y coordinate (Northing)
 * @returns WGS84 latitude and longitude in decimal degrees
 */
export function svy21ToWgs84(
  easting: number,
  northing: number,
): { latitude: number; longitude: number } {
  const mOrigin = meridianDistance(ORIGIN_LAT);
  const mPrime = mOrigin + (northing - FALSE_NORTHING) / SCALE_FACTOR;
  const fPhi = footpointLatitude(mPrime / A);

  const sinFPhi = Math.sin(fPhi);
  const sin2FPhi = sinFPhi * sinFPhi;
  const cosFPhi = Math.cos(fPhi);
  const tanFPhi = Math.tan(fPhi);
  const tan2FPhi = tanFPhi * tanFPhi;
  const tan4FPhi = tan2FPhi * tan2FPhi;

  const rho = (A * (1 - E2)) / (1 - E2 * sin2FPhi) ** 1.5;
  const nu = A / Math.sqrt(1 - E2 * sin2FPhi);
  const psi = nu / rho;
  const psi2 = psi * psi;
  const psi3 = psi2 * psi;
  const psi4 = psi3 * psi;

  const t = tanFPhi;
  const t2 = tan2FPhi;
  const t4 = tan4FPhi;
  const t6 = t4 * t2;

  const x = (easting - FALSE_EASTING) / (SCALE_FACTOR * nu);
  const x2 = x * x;
  const x3 = x2 * x;
  const x5 = x3 * x2;
  const x7 = x5 * x2;

  // Latitude
  const latTerm1 =
    ((t / (SCALE_FACTOR * rho)) * ((easting - FALSE_EASTING) * x)) / 2;
  const latTerm2 =
    (((t / (SCALE_FACTOR * rho)) * ((easting - FALSE_EASTING) * x3)) / 24) *
    (-4 * psi2 + 9 * psi * (1 - t2) + 12 * t2);
  const latTerm3 =
    (((t / (SCALE_FACTOR * rho)) * ((easting - FALSE_EASTING) * x5)) / 720) *
    (8 * psi4 * (11 - 24 * t2) -
      12 * psi3 * (21 - 71 * t2) +
      15 * psi2 * (15 - 98 * t2 + 15 * t4) +
      180 * psi * (5 * t2 - 3 * t4) +
      360 * t4);
  const latTerm4 =
    (((t / (SCALE_FACTOR * rho)) * ((easting - FALSE_EASTING) * x7)) / 40320) *
    (1385 - 3633 * t2 + 4095 * t4 + 1575 * t6);

  const lat = fPhi - latTerm1 + latTerm2 - latTerm3 + latTerm4;

  // Longitude
  const secFPhi = 1 / cosFPhi;
  const lngTerm1 = x * secFPhi;
  const lngTerm2 = ((x3 * secFPhi) / 6) * (psi + 2 * t2);
  const lngTerm3 =
    ((x5 * secFPhi) / 120) *
    (-4 * psi3 * (1 - 6 * t2) + psi2 * (9 - 68 * t2) + 72 * psi * t2 + 24 * t4);
  const lngTerm4 =
    ((x7 * secFPhi) / 5040) * (61 + 662 * t2 + 1320 * t4 + 720 * t6);

  const lng = ORIGIN_LNG + lngTerm1 - lngTerm2 + lngTerm3 - lngTerm4;

  return {
    latitude: lat * (180 / Math.PI),
    longitude: lng * (180 / Math.PI),
  };
}
