import { SearchAutocomplete } from "@/components/search-autocomplete";

export function HeroSection() {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <span className="inline-flex items-center rounded-full border-2 border-foreground px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[2px]">
          NEW LAUNCHES 2026
        </span>

        <h1 className="mt-8 max-w-4xl font-sans text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
          Research Every New Condo Launch in Singapore
        </h1>

        <p className="mt-6 max-w-[680px] font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
          AI-powered analysis on pricing, amenities, and investment potential
          &mdash; all in one place.
        </p>

        <div className="mt-8">
          <SearchAutocomplete variant="hero" />
        </div>

        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Trending: D15 &middot; Tampines &middot; Bukit Timah &middot; Jurong
          East
        </p>
      </div>
    </section>
  );
}
