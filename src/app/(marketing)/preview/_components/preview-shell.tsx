"use client";

import { useEffect, useState } from "react";
import type { ThemeVariant } from "@/components/preview";
import {
  FilterBar,
  PriceTable,
  ProjectCard,
  PsfChart,
} from "@/components/preview";
import {
  mockProjects,
  mockPsfTrend,
  mockUnitMix,
} from "@/components/preview/mock-data";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function VariantPanel({ variant }: { variant: ThemeVariant }) {
  return (
    <div className="space-y-6">
      <FilterBar variant={variant} />

      <div className="grid gap-4 sm:grid-cols-2">
        {mockProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} variant={variant} />
        ))}
      </div>

      <PriceTable units={mockUnitMix} variant={variant} />

      <PsfChart data={mockPsfTrend} variant={variant} />
    </div>
  );
}

export function PreviewShell() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialise from localStorage or system preference
    const stored = localStorage.getItem("whathome-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      // Follow system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("whathome-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("whathome-theme", "light");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              WhatHome{" "}
              <span className="text-muted-foreground font-normal text-sm">
                / Design Preview
              </span>
            </h1>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 items-center gap-2 border-2 border-foreground bg-background px-3 text-xs font-bold uppercase tracking-wide shadow-[2px_2px_0px_0px_var(--foreground)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Desktop: side-by-side grid */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
          {/* Full variant */}
          <div className="space-y-4 pr-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                Full
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                neobrutalist
              </span>
            </div>
            <VariantPanel variant="full" />
          </div>

          {/* Separator */}
          <Separator orientation="vertical" className="mx-0" />

          {/* Soft variant */}
          <div className="space-y-4 pl-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Soft</h2>
              <span className="text-xs text-muted-foreground font-mono">
                neobrutalist
              </span>
            </div>
            <VariantPanel variant="soft" />
          </div>
        </div>

        {/* Mobile: tabs */}
        <div className="lg:hidden">
          <Tabs defaultValue="full">
            <TabsList className="w-full">
              <TabsTrigger
                value="full"
                className="flex-1 font-bold uppercase tracking-wide"
              >
                Full
              </TabsTrigger>
              <TabsTrigger value="soft" className="flex-1">
                Soft
              </TabsTrigger>
            </TabsList>
            <TabsContent value="full" className="mt-6">
              <VariantPanel variant="full" />
            </TabsContent>
            <TabsContent value="soft" className="mt-6">
              <VariantPanel variant="soft" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
