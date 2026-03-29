"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "project" | "developer";
  label: string;
  href: string;
  meta: string;
}

interface SearchAutocompleteProps {
  variant?: "hero" | "header";
}

export function SearchAutocomplete({
  variant = "hero",
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: SearchResult[]) => setResults(data))
        .catch(() => {});
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      window.location.href = results[activeIndex].href;
      setOpen(false);
      setQuery("");
      return;
    }
    const trimmed = query.trim();
    router.push(
      trimmed
        ? (`/projects?q=${encodeURIComponent(trimmed)}` as never)
        : "/projects",
    );
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-3 border-2 border-foreground bg-background px-4 transition-shadow",
          isHero
            ? "h-14 max-w-[680px] focus-within:shadow-[4px_4px_0px_0px_var(--foreground)]"
            : "h-9 w-64 focus-within:shadow-[2px_2px_0px_0px_var(--foreground)]",
        )}
      >
        <SearchIcon size={isHero ? 20 : 16} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            isHero
              ? "Search by project name, district, or developer..."
              : "Search..."
          }
          className={cn(
            "flex-1 bg-transparent font-mono text-foreground placeholder:text-muted-foreground focus:outline-none",
            isHero ? "text-sm" : "text-xs",
          )}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="search-results"
          aria-activedescendant={
            activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
          }
          autoComplete="off"
        />
        {isHero && (
          <button
            type="submit"
            className="bg-foreground px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-background transition-colors hover:bg-foreground/80"
          >
            SEARCH
          </button>
        )}
      </form>

      {open && results.length > 0 && (
        <div
          id="search-results"
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_var(--foreground)]",
            isHero ? "max-w-[680px]" : "",
          )}
        >
          {results.map((result, i) => (
            <div
              key={result.href}
              id={`search-result-${i}`}
              role="option"
              tabIndex={-1}
              aria-selected={i === activeIndex}
            >
              <Link
                href={result.href as never}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 transition-colors",
                  i === activeIndex
                    ? "bg-foreground text-background"
                    : "hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider",
                    i === activeIndex
                      ? "text-background/60"
                      : "text-muted-foreground",
                  )}
                >
                  {result.type === "project" ? "PRJ" : "DEV"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-semibold">
                    {result.label}
                  </p>
                  <p
                    className={cn(
                      "truncate font-mono text-[11px]",
                      i === activeIndex
                        ? "text-background/60"
                        : "text-muted-foreground",
                    )}
                  >
                    {result.meta}
                  </p>
                </div>
              </Link>
            </div>
          ))}
          <div className="border-t-2 border-foreground/20">
            <button
              type="button"
              onClick={() => {
                const trimmed = query.trim();
                router.push(
                  (trimmed
                    ? `/projects?q=${encodeURIComponent(trimmed)}`
                    : "/projects") as never,
                );
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-2 px-4 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              View all results for &ldquo;{query.trim()}&rdquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
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
