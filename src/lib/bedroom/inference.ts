export type UnitType = "1BR" | "2BR" | "3BR" | "4BR" | "5BR" | "Penthouse";

export interface CuratedRange {
  unitType: UnitType;
  sizeSqftMin: number;
  sizeSqftMax: number;
}

// Default area ranges (sqft) — wider than research.ts ranges to handle overlap
const DEFAULT_RANGES: CuratedRange[] = [
  { unitType: "1BR", sizeSqftMin: 420, sizeSqftMax: 700 },
  { unitType: "2BR", sizeSqftMin: 700, sizeSqftMax: 1100 },
  { unitType: "3BR", sizeSqftMin: 900, sizeSqftMax: 1500 },
  { unitType: "4BR", sizeSqftMin: 1345, sizeSqftMax: 2150 },
  { unitType: "5BR", sizeSqftMin: 1500, sizeSqftMax: 2150 },
  { unitType: "Penthouse", sizeSqftMin: 2200, sizeSqftMax: Infinity },
];

// GFA harmonisation adjustment factor: post-June 2023 areas are ~10% smaller
const HARMONISATION_FACTOR = 0.9; // adjust area upward by dividing by this

/**
 * Infers bedroom type from area with GFA harmonisation handling.
 *
 * @param areaSqft - The strata area in square feet
 * @param isPostHarmonisation - Whether this transaction is post-GFA harmonisation (June 2023)
 * @param curatedRanges - Optional curated ranges from projectUnits table
 * @returns The inferred unit type, or null if the area is ambiguous/out of range
 */
export function inferBedroomType(
  areaSqft: number,
  isPostHarmonisation: boolean | null,
  curatedRanges?: CuratedRange[],
): UnitType | null {
  // Normalise area for post-harmonisation transactions (adjust upward)
  const effectiveArea = isPostHarmonisation
    ? areaSqft / HARMONISATION_FACTOR
    : areaSqft;

  // If curated ranges exist, use those first
  if (curatedRanges && curatedRanges.length > 0) {
    return matchAgainstCuratedRanges(effectiveArea, curatedRanges);
  }

  // Otherwise use default ranges
  return matchAgainstDefaultRanges(effectiveArea);
}

function matchAgainstCuratedRanges(
  area: number,
  curatedRanges: CuratedRange[],
): UnitType | null {
  // Find all ranges that contain this area
  const matchingRanges = curatedRanges.filter(
    (r) => area >= r.sizeSqftMin && area <= r.sizeSqftMax,
  );

  if (matchingRanges.length === 0) {
    return null; // Area outside all curated ranges
  }

  if (matchingRanges.length === 1) {
    return matchingRanges[0].unitType;
  }

  // Area falls in overlap zones — prefer the range whose midpoint is closest
  return findClosestMidpoint(area, matchingRanges);
}

function matchAgainstDefaultRanges(area: number): UnitType | null {
  const matchingRanges = DEFAULT_RANGES.filter(
    (r) => area >= r.sizeSqftMin && area <= r.sizeSqftMax,
  );

  if (matchingRanges.length === 0) {
    return null; // Area outside all ranges
  }

  if (matchingRanges.length === 1) {
    return matchingRanges[0].unitType;
  }

  // Area falls in overlap zones — prefer the range whose midpoint is closest
  return findClosestMidpoint(area, matchingRanges);
}

function findClosestMidpoint(
  area: number,
  ranges: CuratedRange[],
): UnitType | null {
  let closestRange: CuratedRange | null = null;
  let minDistance = Infinity;

  for (const range of ranges) {
    const midpoint = (range.sizeSqftMin + range.sizeSqftMax) / 2;
    const distance = Math.abs(area - midpoint);

    if (distance < minDistance) {
      minDistance = distance;
      closestRange = range;
    }
  }

  return closestRange?.unitType ?? null;
}
