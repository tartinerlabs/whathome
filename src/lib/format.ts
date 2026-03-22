/**
 * Formatting utilities for DB → display conversion.
 *
 * Drizzle `numeric` columns return as strings. These helpers
 * handle the conversion so components receive numbers.
 */

/** Convert Drizzle numeric string to number. Returns 0 for null/undefined/NaN. */
export function toNumber(value: string | null | undefined): number {
  if (value == null) return 0;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** DB tenure enum (`99_year`) → display format (`99-year`). */
export function formatTenure(tenure: string | null | undefined): string {
  if (!tenure) return "N/A";
  return tenure.replace(/_/g, "-");
}

/** Parse display tenure (`99-year`) → DB enum (`99_year`). */
export function parseTenure(display: string): string {
  return display.replace(/-/g, "_");
}

/** Format price with dollar sign and commas: `$1,234,567`. */
export function formatPrice(value: number | null | undefined): string {
  if (value == null || value === 0) return "N/A";
  return `$${value.toLocaleString("en-SG")}`;
}

/** Format PSF: `$1,234 psf`. */
export function formatPsf(value: number | null | undefined): string {
  if (value == null || value === 0) return "N/A";
  return `$${Math.round(value).toLocaleString("en-SG")} psf`;
}
