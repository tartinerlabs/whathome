/**
 * Centralised AI model configuration.
 *
 * Uses Vercel AI Gateway — model strings route automatically.
 * Change these strings to switch providers without code changes.
 */

/** Fast + cheap model for structured extraction (tenure parsing, unit classification). */
export const enrichModel = "google/gemini-3.1-flash-lite-preview";

/** Model for generating project descriptions and investment analysis. */
export const analysisModel = "google/gemini-3.1-flash-lite-preview";
