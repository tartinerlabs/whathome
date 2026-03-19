# Features

## Public Site (10)
1. New launch listings with filters (region CCR/RCR/OCR, district D1-D28, price range, tenure, unit types, status)
2. Project detail pages: pricing table, unit mix, developer info, TOP date, tenure, site plan, floor plans
3. Transaction history per project (PSF chart over time, unit sales table)
4. Nearby amenities: MRT, schools, malls with walking distances (via OneMap API)
5. Developer directory with project portfolios
6. District browser (D1-D28) with district-level stats
7. Side-by-side project comparison (2-3 projects)
8. Market analytics dashboard: price trends, volume charts, PSF by region/district (Recharts)
9. Full-text search (Postgres `tsvector`)
10. Dynamic OG images per project

## AI-Powered (5)
11. AI project summaries and investment analysis
12. Automated data ingestion via cron (data.gov.sg, URA APIs)
13. AI research agent enriching projects from web sources
14. Backfill agent for historical projects
15. YouTube transcript extraction from property reviewers

## User Features (3)
16. User accounts (Better Auth: email + social)
17. Saved/bookmarked projects (watchlist)
18. Saved searches (filter combinations)

## Admin Features (2)
19. Admin dashboard with data health, agent run logs
20. Agent control panel (trigger/view agents), project editor
