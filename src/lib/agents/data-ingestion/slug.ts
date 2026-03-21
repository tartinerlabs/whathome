/**
 * Slugify a project name for URL-safe slugs.
 *
 * "AURELLE OF TAMPINES" → "aurelle-of-tampines"
 * "THE ARDEN (PHASE 2)" → "the-arden-phase-2"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Normalise a URA project name for matching.
 * URA names are UPPERCASE, may have extra spaces or punctuation.
 */
export function normaliseProjectName(name: string): string {
  return name.toUpperCase().replace(/\s+/g, " ").trim();
}
