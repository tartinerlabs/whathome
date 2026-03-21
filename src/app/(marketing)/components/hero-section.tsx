"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/projects?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/projects");
    }
  }

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

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex h-14 w-full max-w-[680px] items-center gap-3 border-2 border-foreground bg-background px-4 transition-shadow focus-within:shadow-[4px_4px_0px_0px_var(--foreground)]"
        >
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project name, district, or developer..."
            className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="bg-foreground px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-background transition-colors hover:bg-foreground/80"
          >
            SEARCH
          </button>
        </form>

        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Trending: D15 &middot; Tampines &middot; Bukit Timah &middot; Jurong
          East
        </p>
      </div>
    </section>
  );
}
