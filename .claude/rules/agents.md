---
paths:
  - "src/lib/agents/**/*"
---

# AI Agent Rules

## Tool Structure
All agent tools live in `src/lib/agents/tools/`:
- `data-gov.ts` — data.gov.sg API client
- `ura.ts` — URA Data Service client
- `onemap.ts` — OneMap geocoding + amenities
- `youtube.ts` — YouTube transcript extraction
- `web-search.ts` — Web search wrapper
- `db.ts` — Database read/write operations

## Model Selection
- **Claude Haiku** (`claude-haiku-4-5-20251001`): Data ingestion agent (high volume, low complexity)
- **Claude Sonnet** (`claude-sonnet-4-6`): Research, analysis, backfill, YouTube agents (reasoning needed)

## Observability
Agent run tracking is handled by external tools (LangFuse/Sentry), not a custom DB table.

## Agent Patterns
- Use Vercel AI SDK `generateText` / `streamText` with tool calling
- Tools use `inputSchema` (not `parameters`) aligned with MCP spec
- Use `stopWhen: stepCountIs(N)` for multi-step limits
- Wrap in Vercel Workflow DevKit for durability in production

## Data Deduplication
- Transactions: deduplicate by `sourceRecordId` (unique constraint)
- Projects: match by slug or fuzzy name match before creating new records
- Price indices: unique on `(quarter, region)`

## Cache Invalidation
After modifying project data, call `revalidateTag('project:${slug}')` to bust ISR cache for affected pages.
