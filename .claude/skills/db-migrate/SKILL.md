---
name: db-migrate
description: Generate and apply Drizzle ORM database migrations
user_invocable: true
---

# /db-migrate

Generate and apply database migrations using Drizzle Kit.

## Steps

1. **Generate migration**
   ```bash
   pnpm drizzle-kit generate
   ```
   This creates SQL migration files in the `drizzle/` folder.

2. **Review generated SQL**
   Read the latest migration file in `drizzle/` and summarize:
   - Tables created/altered/dropped
   - Columns added/removed/modified
   - Indexes or constraints changed

   Ask for confirmation before proceeding if destructive changes detected (DROP TABLE, DROP COLUMN).

3. **Apply migration**
   ```bash
   pnpm drizzle-kit push
   ```

4. **Verify**
   ```bash
   pnpm drizzle-kit studio
   ```
   Report success and list affected tables.

## Safety Checks
- Warn before any destructive operations (drops, column removals)
- Check that schema files in `src/db/schema/` are consistent
- Verify DATABASE_URL is set in environment
