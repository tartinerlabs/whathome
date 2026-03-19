---
name: setup-phase
description: "[EPHEMERAL] Scaffold project dependencies and folder structure — delete after first use"
user_invocable: true
---

# /setup-phase

> **EPHEMERAL SKILL**: Delete this skill after first successful use.

Install remaining dependencies and scaffold the folder structure per ARCHITECTURE.md.

## Steps

1. **Install dependencies**
   ```bash
   pnpm add drizzle-orm @neondatabase/serverless better-auth nuqs recharts @vercel/blob ai @ai-sdk/anthropic
   pnpm add -D drizzle-kit
   ```

2. **Initialize shadcn/ui**
   ```bash
   pnpm dlx shadcn@latest init
   ```
   Select: Maia style, Base UI, default settings.

3. **Scaffold folder structure**
   Create the directory tree from ARCHITECTURE.md:
   ```
   src/
     app/
       (marketing)/
       (research)/projects/[slug]/transactions/
       (research)/new-launches/
       (research)/developers/[slug]/
       (research)/districts/[number]/
       (research)/compare/
       (research)/analytics/
       (user)/dashboard/
       (user)/settings/
       (admin)/admin/agents/[runId]/
       (admin)/admin/projects/[id]/edit/
       (auth)/login/
       (auth)/signup/
       api/auth/[...all]/
       api/agents/ingest/
       api/agents/research/
       api/agents/analyze/
       api/agents/backfill/
       api/agents/youtube/
       api/cron/daily-ingest/
       api/cron/weekly-index/
       api/og/
       api/search/
     components/
     db/schema/
     lib/agents/tools/
     lib/utils/
   ```

4. **Create placeholder schema files**
   Create empty schema files in `src/db/schema/`:
   - `projects.ts`, `transactions.ts`, `developers.ts`, `market-data.ts`
   - `users.ts`, `videos.ts`, `research.ts`, `auth.ts`
   - `index.ts` (barrel export)

5. **Create database config**
   Set up `src/db/index.ts` with Drizzle + Neon connection.

6. **Verify**
   Run `pnpm build` to confirm no errors from the scaffolding.

## After Running
Delete this skill file — it's a one-time setup.
