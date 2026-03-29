# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**WhatHome** — Singapore property research site for new condo launches, built under Tartiner Labs. AI agents auto-populate data from gov APIs, web sources, and YouTube reviewers. Research directory only — not a marketplace. No agent listings, no buyer-seller transactions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + React Compiler |
| Styling | Tailwind CSS v4 + shadcn/ui (Lyra style, Base UI) |
| Database | Neon Postgres + Drizzle ORM (`snake_case` casing) |
| Auth | Better Auth (email + social, admin plugin for roles) |
| AI | Vercel AI Gateway (model strings route automatically) |
| Workflows | Vercel Workflow DevKit (`workflow` package) |
| Charts | Recharts |
| URL State | nuqs (shareable filter URLs) |
| Package Manager | pnpm |
| Hosting | Vercel (ISR for SEO-critical pages) |
| Blob Storage | Vercel Blob |
| Icons | Hugeicons (free set) |
| Local Dev | portless (`https://whathome.localhost:1355`) |
| Tooling | Biome 2, Husky, commitlint, gitleaks |
| Analytics | PostHog (proxied via rewrites in next.config.ts) |

## Commands

```bash
pnpm dev              # Start dev server → https://whathome.localhost:1355
pnpm build            # Production build
pnpm start            # Start production server
pnpm check            # Biome lint + format check
pnpm format           # Biome lint + format auto-fix
pnpm typecheck        # TypeScript type check (tsc --noEmit)
pnpm db:generate      # Generate Drizzle migration SQL from schema changes
pnpm db:push          # Push schema changes directly to database
pnpm db:migrate       # Run pending migrations
pnpm db:studio        # Open Drizzle Studio (DB browser)
pnpm auth:generate    # Regenerate Better Auth schema → src/db/schema/auth.ts
```

After `pnpm db:push`, always run `pnpm db:generate` to keep migration files in sync.

## Architecture

### Route Groups

```
src/app/
  (marketing)/          — Homepage, about (nested (site)/ sub-group)
  (research)/           — Public SEO pages: projects, developers, districts, analytics, compare
  (dashboard)/          — Authenticated: dashboard, project editor, settings
  (auth)/               — Login, signup
  api/
    auth/[...all]/      — Better Auth catch-all
    cron/               — Cron endpoints (daily-ingest, prices)
    workflows/          — WDK workflow triggers (ingest, research, analyze, backfill)
    admin/              — Admin API routes
    images/             — Image upload + serving
    search/             — Full-text search endpoint
    analytics/          — Page view tracking
```

### Query Layer

All data access lives in `src/lib/queries/` — one file per domain (projects, transactions, developers, districts, market-data, rentals, bedroom-analytics, admin, search). These functions use `"use cache"` with `cacheLife("max")` and `cacheTag()` for ISR. Expensive aggregations use `"use cache: remote"` to survive redeploys. Cache invalidation uses `revalidateTag` from `next/cache` directly at each call site (no wrapper functions).

Cache tags follow Redis key-style colon-separated naming (e.g. `project:${slug}`, `projects`, `developers`, `districts`, `market:prices`, `bedrooms:analytics`, `transactions`, `search`, `rentals`).

### Domain Types

`src/lib/types.ts` defines all shared interfaces (`Project`, `Developer`, `Transaction`, `NearbyAmenity`, `DistrictInfo`, `PriceIndex`, `UnitMixRow`) and type unions (`Region`, `Tenure`, `ProjectStatus`, `SaleType`, `PropertyType`, `AmenityType`). The query layer maps raw DB rows to these types before returning to UI.

### Data Providers

External API clients live in `src/lib/providers/`:
- `data-gov.ts` — data.gov.sg (transactions, price indices)
- `ura.ts` — URA Data Service API (transactions, developer sales, pipeline, rentals)
- `onemap.ts` — OneMap API (planning areas, coordinate conversion)

### Workflows

Workflow definitions live in `src/workflows/` (not under `app/`). Route handlers in `src/app/api/workflows/` just call `start(workflow)`. Workflows use `"use workflow"` and `"use step"` directives from Workflow DevKit. The `next.config.ts` wraps config with `withWorkflow()`.

### AI Models

Centralised in `src/lib/ai/model.ts`. Uses Vercel AI Gateway — model strings like `"google/gemini-3.1-flash-lite-preview"` route automatically. No provider-specific SDK imports needed.

### Auth

Better Auth with email + Google social login. Server-side: `src/lib/auth.ts`. Client-side: `src/lib/auth-client.ts`. `src/proxy.ts` protects `/dashboard/*` routes. Admin role via Better Auth's `admin()` plugin.

### Formatting

`src/lib/format.ts` handles DB → display conversions: `toNumber()` for Drizzle numeric strings, `formatPrice()`, `formatPsf()`, `formatTenure()`, `parseRawTenure()`. Use these instead of inline formatting.

## Conventions

- **Server Components by default** — `"use client"` only when interactivity or browser APIs needed
- **Drizzle schema** in `src/db/schema/` — `pgTable`, `uuid().primaryKey().defaultRandom()`, `timestamp().defaultNow()`, `snake_case` casing, relations exported separately
- **Biome 2**: double quotes, 2-space indent, recommended rules. `src/components/ui/` and `src/lib/utils.ts` are excluded from linting (shadcn-managed)
- **Conventional commits** enforced via commitlint — scopes are disallowed (`scope-empty: always`). Format: `feat: description`, not `feat(scope): description`
- **Pre-commit hooks**: gitleaks (secret scanning) + lint-staged (Biome check)
- **Path alias**: `@/*` → `./src/*`
- **ISR**: query functions use `"use cache"` + `cacheTag()`; after agent runs, call `revalidateTag(\`project:${slug}\`, "max")` directly
- **SEO**: every public page has `generateMetadata`, JSON-LD where applicable, dynamic OG images via `/api/og`
- **Local dev URL**: `https://whathome.localhost:1355` via portless — do not use `localhost:3000`
- **Next.js 16 async APIs**: `await cookies()`, `await headers()`, `await params`, `await searchParams`
- **proxy.ts** (not middleware.ts) at `src/proxy.ts` for route protection
- **British spelling** in all docs and copy (colour, organise, behaviour)

## Environment Variables

See `.env.example` for required variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CRON_SECRET`, `DATAGOV_API_KEY`, `ONEMAP_EMAIL`/`ONEMAP_EMAIL_PASSWORD`, `URA_ACCESS_KEY`, PostHog keys, Google OAuth credentials. `CRON_SECRET` auth is only enforced in production.

## Contextual Rules

`.claude/rules/` contains path-scoped rules that auto-activate:
- `frontend.md` — triggered on `src/**/*.tsx` edits
- `database.md` — Drizzle schema and query patterns
- `agents.md` — AI agent tools and workflow patterns
- `api-routes.md` — route handler conventions

@AGENTS.md
@SCHEMA.md
@ARCHITECTURE.md
@DATA_SOURCES.md
@FEATURES.md
