import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { analysisModel } from "@/lib/ai/model";

/**
 * Standalone analysis workflow — regenerates description + aiSummary
 * for an already-enriched project. Use when you want to re-run just
 * the AI text without re-doing enrichment/amenities.
 */
export async function analysisWorkflow(projectId: string) {
  "use workflow";

  const startTime = Date.now();

  const context = await stepLoadContext(projectId);
  const result = await stepGenerateAnalysis(context);
  await stepSave(projectId, context.slug, result.description, result.aiSummary);

  return {
    projectId,
    projectName: context.name,
    totalTokens: result.totalTokens,
    durationMs: Date.now() - startTime,
  };
}

interface ProjectContext {
  id: string;
  name: string;
  slug: string;
  districtNumber: number | null;
  region: string | null;
  address: string | null;
  tenure: string | null;
  tenureYears: number | null;
  totalUnits: number | null;
  unitsSold: number | null;
  developerName: string | null;
  units: Array<{
    unitType: string | null;
    sizeSqftMin: number | null;
    sizeSqftMax: number | null;
    pricePsf: string | null;
    priceFrom: number | null;
    priceTo: number | null;
  }>;
  amenities: Array<{
    amenityType: string;
    name: string;
    distanceMeters: number | null;
    walkMinutes: number | null;
  }>;
  transactionCount: number;
}

async function stepLoadContext(projectId: string): Promise<ProjectContext> {
  "use step";

  console.log("[analysis] Loading context for project %s", projectId);

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      developer: true,
      units: true,
      nearbyAmenities: true,
      transactions: { limit: 1 },
    },
  });

  if (!project) throw new Error(`Project ${projectId} not found`);

  const { transactions: txnSchema } = await import("@/db/schema");
  const count = await db.$count(txnSchema, eq(txnSchema.projectId, projectId));

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    districtNumber: project.districtNumber,
    region: project.region,
    address: project.address,
    tenure: project.tenure,
    tenureYears: project.tenureYears,
    totalUnits: project.totalUnits,
    unitsSold: project.unitsSold,
    developerName: project.developer?.name ?? null,
    units: project.units.map((u) => ({
      unitType: u.unitType,
      sizeSqftMin: u.sizeSqftMin,
      sizeSqftMax: u.sizeSqftMax,
      pricePsf: u.pricePsf,
      priceFrom: u.priceFrom,
      priceTo: u.priceTo,
    })),
    amenities: project.nearbyAmenities.map((a) => ({
      amenityType: a.amenityType,
      name: a.name,
      distanceMeters: a.distanceMeters,
      walkMinutes: a.walkMinutes,
    })),
    transactionCount: count,
  };
}

async function stepGenerateAnalysis(
  context: ProjectContext,
): Promise<{ description: string; aiSummary: string; totalTokens: number }> {
  "use step";

  console.log(`[analysis] Generating analysis for ${context.name}`);

  // Find comparable projects in same district
  const comparables = await db
    .select({
      name: projects.name,
      districtNumber: projects.districtNumber,
      region: projects.region,
      totalUnits: projects.totalUnits,
      tenure: projects.tenure,
    })
    .from(projects)
    .where(eq(projects.districtNumber, context.districtNumber ?? 0))
    .limit(10);

  const { text, usage } = await generateText({
    model: analysisModel,
    system: `You are a Singapore property investment analyst. Write factual, data-driven content using British spelling.

Write TWO sections separated by "---":

SECTION 1 - DESCRIPTION (2-3 paragraphs):
A factual project description covering location, developer, key features, unit types, and target market.

SECTION 2 - AI SUMMARY (structured analysis):
- Value proposition (PSF relative to area averages)
- Location strengths and weaknesses
- Capital appreciation outlook
- Suitable buyer profile (own-stay vs investment)
- Key risks

Be concise and specific. Cite numbers from the data provided.`,
    prompt: `Analyse this Singapore property project:\n${JSON.stringify(context, null, 2)}\n\nComparable projects in district:\n${JSON.stringify(comparables, null, 2)}`,
  });

  const parts = text.split("---").map((p) => p.trim());
  const description = parts[0] ?? text;
  const aiSummary = parts[1] ?? "";

  console.log(
    `[analysis] Generated ${text.length} chars, ${usage.totalTokens} tokens`,
  );

  return { description, aiSummary, totalTokens: usage.totalTokens ?? 0 };
}

async function stepSave(
  projectId: string,
  slug: string,
  description: string,
  aiSummary: string,
): Promise<void> {
  "use step";

  console.log(`[analysis] Saving analysis for ${slug}`);

  await db
    .update(projects)
    .set({
      description,
      aiSummary,
      lastResearchedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  revalidateTag(`project:${slug}`, "max");
}
