import { SectionHeader } from "@/components/section-header";
import { howItWorksSteps } from "./mock-data";

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
