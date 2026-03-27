/**
 * Maps URA rental noOfBedRoom values to unitTypeEnum values.
 *
 * URA rental data uses: "1", "2", "3", "4", "5 & above"
 * unitTypeEnum uses:    "1BR", "2BR", "3BR", "4BR", "5BR", "Penthouse"
 */

export type UraBedroom = "1" | "2" | "3" | "4" | "5 & above";

/** Maps URA rental bedroom text to unit type enum. */
export const BEDROOM_MAP: Record<string, string> = {
  "1": "1BR",
  "2": "2BR",
  "3": "3BR",
  "4": "4BR",
  "5 & above": "5BR",
};

/**
 * Convert a URA rental noOfBedRoom value to a unitTypeEnum value.
 * Returns null if the value is not recognised.
 */
export function mapBedroom(
  uraBedroom: string | null | undefined,
): string | null {
  if (!uraBedroom) return null;
  return BEDROOM_MAP[uraBedroom] ?? null;
}

/**
 * Reverse map: unitTypeEnum value to URA rental value.
 */
export const BEDROOM_MAP_REVERSE: Record<string, string> = {
  "1BR": "1",
  "2BR": "2",
  "3BR": "3",
  "4BR": "4",
  "5BR": "5 & above",
  Penthouse: "5 & above",
};
