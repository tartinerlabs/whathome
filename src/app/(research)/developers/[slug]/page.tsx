import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { SectionHeader } from "@/components/section-header";
import { getDeveloperBySlug } from "@/lib/queries/developers";

// TODO: Pre-render high-traffic developers
export async function generateStaticParams() {
  return [{ slug: "__placeholder__" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDeveloperBySlug(slug);
  if (!data) return { title: "Developer Not Found" };

  const { developer } = data;

  return {
    title: developer.name,
    description: `${developer.name} — ${developer.projectCount} projects, ${developer.totalUnits.toLocaleString()} total units. View their full Singapore property portfolio.`,
  };
}

export default async function DeveloperDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getDeveloperBySlug(slug);
  if (!data) notFound();

  const { developer, projects: devProjects } = data;

  return (
    <>
      <section className="border-b-2 border-foreground px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <h1 className="font-sans text-3xl font-bold tracking-tight md:text-4xl">
            {developer.name}
          </h1>

          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {developer.description}
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="border-2 border-foreground p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Projects
              </p>
              <p className="mt-1 font-mono text-2xl font-bold">
                {developer.projectCount}
              </p>
            </div>
            <div className="border-2 border-foreground p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Units
              </p>
              <p className="mt-1 font-mono text-2xl font-bold">
                {developer.totalUnits.toLocaleString()}
              </p>
            </div>
            {developer.website && (
              <div className="border-2 border-foreground p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Website
                </p>
                <a
                  href={developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-mono text-sm underline underline-offset-2 hover:text-muted-foreground transition-colors truncate"
                >
                  {developer.website.replace("https://", "")}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionHeader
            title={`Projects by ${developer.name}`}
            meta={`${devProjects.length} PROJECTS`}
          />

          {devProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {devProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-foreground p-12 text-center">
              <p className="text-muted-foreground">
                No projects currently tracked for this developer.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
