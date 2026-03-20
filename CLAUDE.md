# WhatHome

**Singapore property research site for new condo launches**, built under Tartiner Labs. AI agents auto-populate data from gov APIs, web sources, and YouTube reviewers.

> Research directory — not a marketplace. No agent listings, no buyer-seller transactions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + React Compiler |
| Styling | Tailwind CSS v4 + shadcn/ui (Maia style, Base UI) |
| Database | Neon Postgres + Drizzle ORM (`snake_case` casing) |
| Auth | Better Auth (email + social, admin roles) |
| AI Agents | Vercel AI SDK + `@ai-sdk/anthropic` |
| Durable Jobs | Vercel Workflow DevKit |
| Charts | Recharts |
| URL State | nuqs (shareable filter URLs) |
| Package Manager | pnpm |
| Hosting | Vercel (ISR for SEO-critical pages) |
| Blob Storage | Vercel Blob (floor plans, site plans, renders) |
| Icons | Hugeicons (free set) |
| Tooling | Biome 2, Husky, commitlint, gitleaks |

## Design Direction

Neobrutalist style (full vs soft TBD — compare at `/preview`). Monochrome/neutral palette. Light + dark mode with toggle.

## Conventions

- **Server Components by default** — `"use client"` only when interactivity or browser APIs needed
- **Drizzle schema**: `pgTable`, `text()` IDs, `timestamp()` defaults, `snake_case` casing, separate relation exports
- **Biome 2**: 2-space indent, recommended rules, import organising
- **Conventional commits**: enforced via commitlint (`feat:`, `fix:`, `chore:`, etc.)
- **Path alias**: `@/*` → `./src/*`
- **ISR**: `generateStaticParams` + `revalidate`; after agent runs, `revalidateTag()` for affected projects
- **SEO**: Every public page has `generateMetadata`, JSON-LD where applicable, dynamic OG images

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm check        # Biome lint + format check
pnpm format       # Biome lint + format auto-fix
```

## Phased Rollout

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Design Preview — neobrutalist theme demos at `/preview` | Current |
| 1 | Foundation — DB schema, data.gov.sg client, ingestion agent | Next |
| 2 | Core Site — listings, filters, project detail, ISR, SEO | |
| 3 | AI Agents — research + analysis agents, admin panel | |
| 4 | Analytics & Users — charts, comparison, accounts | |
| 5 | Backfill & Polish — YouTube agent, URA API, search, Blob | |

@AGENTS.md
@SCHEMA.md
@ARCHITECTURE.md
@DATA_SOURCES.md
@FEATURES.md
