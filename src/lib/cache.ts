import { revalidateTag } from "next/cache";

/** Invalidate a single project and the project listings. */
export function revalidateProject(slug: string) {
  revalidateTag(`project:${slug}`, "max");
  revalidateTag("projects", "max");
}

/** Invalidate all cached data (after bulk ingestion). */
export function revalidateAll() {
  revalidateTag("projects", "max");
  revalidateTag("developers", "max");
  revalidateTag("districts", "max");
  revalidateTag("market-data", "max");
}
