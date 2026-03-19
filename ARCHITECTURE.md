# Site Architecture

## Route Map

```
src/app/
  (marketing)/                    -- Homepage, about
    page.tsx                      -- Hero, featured launches, market snapshot, search
    about/page.tsx

  (research)/                     -- Public SEO content
    projects/page.tsx             -- Filterable project listing
    projects/[slug]/page.tsx      -- Project detail (KEY SEO PAGE)
    projects/[slug]/transactions/page.tsx
    new-launches/page.tsx
    developers/page.tsx
    developers/[slug]/page.tsx
    districts/page.tsx
    districts/[number]/page.tsx
    compare/page.tsx              -- Side-by-side comparison
    analytics/page.tsx            -- Market analytics dashboard

  (user)/                         -- Authenticated user area
    dashboard/page.tsx            -- Saved projects, saved searches
    settings/page.tsx

  (admin)/                        -- Admin panel (role-gated)
    admin/page.tsx
    admin/agents/page.tsx
    admin/agents/[runId]/page.tsx
    admin/projects/page.tsx
    admin/projects/[id]/edit/page.tsx

  (auth)/
    login/page.tsx
    signup/page.tsx

  api/
    auth/[...all]/route.ts
    agents/{ingest,research,analyze,backfill,youtube}/route.ts
    cron/{daily-ingest,weekly-index}/route.ts
    og/route.tsx                  -- Dynamic OG images
    search/route.ts

  sitemap.ts
  robots.ts
```

## Key Page: Project Detail (`/projects/[slug]`)

- Pricing table with unit mix
- Transaction PSF chart over time (Recharts)
- Nearby amenities with walking distances
- Floor plans gallery
- AI investment analysis
- "What reviewers say" (YouTube-sourced insights)
- Developer link
- JSON-LD structured data (`RealEstateListing`)
- ISR with `revalidateTag('project:${slug}')` for granular cache invalidation
