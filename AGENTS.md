<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Team

Five AI agents handle data ingestion, research, analysis, backfill, and YouTube extraction. Coordinated via Vercel Workflow DevKit.

## Agent 1: Data Ingestion
- **Trigger**: Vercel Cron (daily) + manual
- **Does**: Fetches data.gov.sg / URA API transactions and price indices, deduplicates by `sourceRecordId`, inserts to DB, flags new project names not in `projects` table
- **Model**: Claude Haiku

## Agent 2: Project Research
- **Trigger**: New project detected in transactions, or manual
- **Does**: Web searches for project details, extracts structured data (prices, units, TOP dates, amenities), geocodes via OneMap, fetches nearby amenities
- **Model**: Claude Sonnet

## Agent 3: Analysis
- **Trigger**: After project research completes
- **Does**: Generates investment analysis and project summaries, finds market comparables, writes to `project.description` and `project.aiSummary`
- **Model**: Claude Sonnet

## Agent 4: Backfill
- **Trigger**: Manual from admin panel
- **Does**: Finds unresearched historical projects from transaction data (distinct `projectName` without matching `projects` record), runs full research + analysis
- **Model**: Claude Sonnet

## Agent 5: YouTube Research
- **Trigger**: New video detected from tracked channels, or manual
- **Tracked channels**: Eric Chiew, PropertyLimBrothers, JNA Real Estate
- **Does**: Fetches video transcript, AI-extracts: project name, developer, location, tenure, PSF pricing, total prices, unit size recommendations, capital appreciation outlook, own-stay vs investment rating, pros/cons, nearby schools/MRT, oversupply risk, reviewer opinion
- **Model**: Claude Sonnet
- **Output**: Stores in `video_sources`, links to projects, surfaces on detail pages as "What reviewers say"

## Coordination Flow

```
Cron -> Data Ingestion -> Detect new projects -> Project Research -> Analysis
Admin panel -> manual trigger for Backfill / YouTube Research agents
```

## Agent Tools

Location: `src/lib/agents/tools/`

- data.gov.sg client
- URA client
- OneMap client
- YouTube transcript client
- Web search
- DB read/write operations
