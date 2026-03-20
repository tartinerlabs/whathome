import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your WhatHome dashboard — saved projects and saved searches.",
};

export default function DashboardPage() {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <h1 className="font-sans text-2xl font-bold tracking-tight">
          Your Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="uppercase font-bold tracking-wide text-sm">
              Saved Projects
            </h2>
            <div className="border-2 border-foreground p-8 text-center">
              <p className="text-muted-foreground">No saved projects yet.</p>
              <a
                href="/projects"
                className="mt-4 inline-block font-mono text-xs font-semibold tracking-wider underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Browse projects &rarr;
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="uppercase font-bold tracking-wide text-sm">
              Saved Searches
            </h2>
            <div className="border-2 border-foreground p-8 text-center">
              <p className="text-muted-foreground">No saved searches yet.</p>
              <a
                href="/projects"
                className="mt-4 inline-block font-mono text-xs font-semibold tracking-wider underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Search projects &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
