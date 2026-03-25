/**
 * Sanitise user input for PostgreSQL full-text search.
 *
 * Strips special tsquery characters, splits on whitespace, and joins
 * with `&` (AND) so all terms must match. Returns `null` if no valid
 * terms remain (caller should skip the FTS query).
 */
export function toTsQuery(input: string): string | null {
  const terms = input
    .replace(/[&|!():*<>'"\\]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 0);

  if (!terms.length) return null;

  return terms.join(" & ");
}
