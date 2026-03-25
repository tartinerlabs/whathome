import Image from "next/image";
import type { projectImages } from "@/db/schema";

interface ProjectGalleryProps {
  projectName: string;
  images: (typeof projectImages.$inferSelect)[];
}

const PLACEHOLDERS = [
  "Site Plan",
  "Floor Plan — 2BR",
  "Floor Plan — 3BR",
  "Render — Facade",
  "Render — Pool",
  "Location Map",
];

export function ProjectGallery({ projectName, images }: ProjectGalleryProps) {
  if (images.length > 0) {
    return (
      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl space-y-4">
          <h2 className="uppercase font-bold tracking-wide text-lg">Gallery</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative h-48 border-2 border-foreground overflow-hidden"
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? `${projectName} — ${image.imageType}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-4">
        <h2 className="uppercase font-bold tracking-wide text-lg">Gallery</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {PLACEHOLDERS.map((label) => (
            <div
              key={label}
              className="flex h-48 items-center justify-center border-2 border-foreground bg-muted"
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          Images for {projectName} will be available after agent research
          completes.
        </p>
      </div>
    </section>
  );
}
