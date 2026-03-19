---
paths:
  - "src/db/**/*"
---

# Database Rules (Drizzle ORM + Neon Postgres)

## Schema Conventions
- Use `pgTable` from `drizzle-orm/pg-core`
- Table casing: `snake_case` (configured via Drizzle `casing` option)
- IDs: `text("id")` with `$defaultFn(() => createId())` (nanoid/cuid2)
- Timestamps: `timestamp("created_at").defaultNow()`, `timestamp("updated_at").defaultNow().$onUpdate(() => new Date())`
- Enums: Use `pgEnum` for fixed value sets (status, region, tenure, etc.)

## Relations
- Export relations separately from table definitions
- Use `relations()` from `drizzle-orm` for type-safe joins
- Foreign keys with `references(() => table.id)` and appropriate `onDelete` behavior

## Schema Files
Each domain gets its own schema file in `src/db/schema/`:
- `projects.ts` — projects, project_units, nearby_amenities, project_images
- `transactions.ts` — transactions
- `developers.ts` — developers
- `market-data.ts` — price_indices
- `users.ts` — saved_projects, saved_searches
- `videos.ts` — video_sources
- `research.ts` — research_runs
- `auth.ts` — Better Auth tables

## Migration Workflow
1. Edit schema files
2. `pnpm drizzle-kit generate` — generates SQL migration
3. Review generated SQL in `drizzle/` folder
4. `pnpm drizzle-kit push` — apply to database
5. Verify with `pnpm drizzle-kit studio`

## Query Patterns
- Use `db.select().from(table)` for reads
- Use `db.insert(table).values({})` for writes
- Use `db.update(table).set({}).where()` for updates
- Prefer `eq()`, `and()`, `or()` from `drizzle-orm` for conditions
