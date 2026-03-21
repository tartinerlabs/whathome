import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { svy21ToWgs84 } from "@/lib/geo";
import { slugify } from "./slug";

interface ProjectStubInput {
  name: string;
  district: number;
  marketSegment: string | null;
  svyX: number | null;
  svyY: number | null;
}

/**
 * Find a project by name, or create a stub if it does not exist.
 * Returns the project ID and slug.
 */
export async function findOrCreateProject(
  input: ProjectStubInput,
): Promise<{ id: string; slug: string; isNew: boolean }> {
  // Check if project already exists (case-insensitive via uppercase comparison)
  const existing = await db
    .select({ id: projects.id, slug: projects.slug })
    .from(projects)
    .where(eq(projects.name, input.name))
    .limit(1);

  if (existing.length > 0) {
    return { id: existing[0].id, slug: existing[0].slug, isNew: false };
  }

  // Convert SVY21 → WGS84 if coordinates available
  let latitude: string | null = null;
  let longitude: string | null = null;
  if (input.svyX && input.svyY) {
    const coords = svy21ToWgs84(input.svyX, input.svyY);
    latitude = String(coords.latitude);
    longitude = String(coords.longitude);
  }

  // Map URA marketSegment to region enum
  const regionMap: Record<string, "CCR" | "RCR" | "OCR"> = {
    CCR: "CCR",
    RCR: "RCR",
    OCR: "OCR",
  };
  const region = input.marketSegment
    ? (regionMap[input.marketSegment] ?? null)
    : null;

  const slug = slugify(input.name);

  // Handle slug collisions by appending district
  let finalSlug = slug;
  const slugCheck = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (slugCheck.length > 0) {
    finalSlug = `${slug}-d${input.district}`;
  }

  const [inserted] = await db
    .insert(projects)
    .values({
      name: input.name,
      slug: finalSlug,
      districtNumber: input.district,
      region,
      marketSegment: input.marketSegment,
      svyX: input.svyX ? String(input.svyX) : null,
      svyY: input.svyY ? String(input.svyY) : null,
      latitude,
      longitude,
      status: "upcoming",
    })
    .returning({ id: projects.id, slug: projects.slug });

  return { id: inserted.id, slug: inserted.slug, isNew: true };
}
