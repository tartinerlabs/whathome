---
paths:
  - "src/db/**/*"
---

# Database Rules (Drizzle ORM + Neon Postgres)

## Schema Conventions
- Use `pgTable` from `drizzle-orm/pg-core`
- Table casing: `snake_case` (configured via Drizzle `casing` option)
- IDs: `uuid().primaryKey().defaultRandom()` (Postgres-native `gen_random_uuid()`)
- Timestamps: `timestamp("created_at").defaultNow()`, `timestamp("updated_at").defaultNow().$onUpdate(() => new Date())`
- Enums: Use `pgEnum` for fixed value sets (status, region, tenure, etc.)

## Relations
- Export relations separately from table definitions
- Use `relations()` from `drizzle-orm` for type-safe joins
- Foreign keys with `references(() => table.id)` and appropriate `onDelete` behaviour

## Schema Files
Each domain gets its own schema file in `src/db/schema/`:
- `developers.ts` — developers
- `projects.ts` — projects (enums: region, tenure, project_status)
- `project-details.ts` — project_units, nearby_amenities, project_images
- `transactions.ts` — transactions
- `price-indices.ts` — price_indices
- `page-views.ts` — page_views

## Migration Workflow
1. Edit schema files
2. `pnpm db:generate` — generates SQL migration
3. Review generated SQL in `drizzle/` folder
4. `pnpm db:push` — apply to database
5. Verify with `pnpm db:studio`

## Query Patterns
- Use `db.select().from(table)` for reads
- Use `db.insert(table).values({})` for writes
- Use `db.update(table).set({}).where()` for updates
- Prefer `eq()`, `and()`, `or()` from `drizzle-orm` for conditions
