function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function CtaSection() {
  return (
    <section className="bg-foreground px-6 py-20 text-center md:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-sans text-3xl font-bold text-background md:text-[42px]">
          Start Your Property Research
        </h2>
        <p className="mx-auto mt-4 max-w-md font-mono text-sm text-background/70">
          Every new launch. Every district. AI-powered insights.
        </p>
        <a
          href="/projects"
          className="mt-8 inline-flex items-center gap-2 bg-background px-8 py-4 font-mono text-[13px] font-semibold tracking-wider text-foreground transition-opacity hover:opacity-90"
        >
          EXPLORE PROJECTS
          <ArrowRightIcon />
        </a>
      </div>
    </section>
  );
}
