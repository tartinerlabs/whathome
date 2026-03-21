import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  amenitiesByProject,
  developers,
  getProjectBySlug,
  projects,
  psfTrendByProject,
  unitMixByProject,
} from "@/lib/mock-data";
import { AiSummary } from "./components/ai-summary";
import { NearbyAmenities } from "./components/nearby-amenities";
import { PricingSection } from "./components/pricing-section";
import { ProjectGallery } from "./components/project-gallery";
import { ProjectHero } from "./components/project-hero";
import { PsfChartSection } from "./components/psf-chart-section";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.name,
    description: `${project.name} — ${project.totalUnits} units by ${project.developerName} in D${project.districtNumber}. ${project.tenure} · TOP ${project.topDate}.`,
    openGraph: {
      images: [
        {
          url: `/api/og?slug=${slug}`,
          width: 1200,
          height: 630,
          alt: project.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og?slug=${slug}`],
    },
  };
}

function getJsonLd(project: NonNullable<ReturnType<typeof getProjectBySlug>>) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.name,
    description: project.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: project.address,
      addressLocality: "Singapore",
      postalCode: project.postalCode,
      addressCountry: "SG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: project.latitude,
      longitude: project.longitude,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const developer = developers.find((d) => d.id === project.developerId);
  const units = unitMixByProject[slug] ?? [];
  const psfData = psfTrendByProject[slug] ?? [];
  const amenities = amenitiesByProject[slug] ?? [];

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from trusted server data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getJsonLd(project)),
        }}
      />

      <ProjectHero project={project} developerSlug={developer?.slug ?? ""} />

      {units.length > 0 && <PricingSection units={units} />}

      {psfData.length > 0 && <PsfChartSection data={psfData} />}

      {amenities.length > 0 && <NearbyAmenities amenities={amenities} />}

      <ProjectGallery projectName={project.name} />

      <AiSummary summary={project.aiSummary} />

      <section className="border-b-2 border-foreground px-6 py-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <a
            href={`/projects/${slug}/transactions`}
            className="inline-flex items-center border-2 border-foreground rounded-none px-6 py-3 shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wide text-sm"
          >
            View All Transactions &rarr;
          </a>
        </div>
      </section>
    </>
  );
}
