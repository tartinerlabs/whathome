import { SectionHeader } from "@/components/section-header";

const howItWorksSteps = [
  {
    number: "01",
    title: "Browse",
    description:
      "Explore new condo launches filtered by district, region, developer, or price range.",
  },
  {
    number: "02",
    title: "Analyse",
    description:
      "Read AI-generated investment analysis, nearby amenity maps, and pricing trend charts.",
  },
  {
    number: "03",
    title: "Compare",
    description:
      "Put projects side by side to compare unit mixes, PSF trends, and neighbourhood features.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b-2 border-foreground bg-secondary px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <SectionHeader title="How It Works" />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {howItWorksSteps.map((step) => (
            <div
              key={step.number}
              className="border-2 border-foreground bg-card p-6"
            >
              <span className="font-sans text-5xl font-bold text-muted-foreground">
                {step.number}
              </span>
              <h3 className="mt-4 font-sans text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 font-mono text-[13px] leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
