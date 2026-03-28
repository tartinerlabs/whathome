# Research: Unit-Type & Decade-Based Performance Analytics in Singapore Property Market

## Context

WhatHome wants to explore adding bedroom-type performance comparisons (1BR-5BR+) with metrics like profit %, growth rate, and CAGR — potentially segmented by decade/era. Before building, we need to understand what competitors offer, what data exists, and what gaps WhatHome can fill.

---

## 1. Competitor Landscape — What Exists Today

### Bedroom-Type Performance Comparison

**Finding: No public Singapore property platform offers explicit profit %, CAGR, or returns comparison by bedroom type.** This is a genuine market gap.

| Platform | What they offer | What's missing |
|----------|----------------|----------------|
| **PropertyGuru** | Individual valuations, neighbourhood trends, quarterly market reports | No aggregate bedroom-type performance metrics |
| **99.co** | Map-based comparison (agent-focused), X-Value pricing | No bedroom-level returns analysis |
| **EdgeProp** | Unit mix breakdowns via LandLens, "most profitable" editorial articles | No standardised CAGR/profit by bedroom type |
| **SRX** | X-Value Performance (15+ year history), TOX deviation metric | Bedroom breakdowns not in public tools |
| **Squarefoot Research** | Transaction/rental trends, PSF by district | No bedroom-specific comparisons |

**Closest content** (editorial, not interactive tools):
- EdgeProp articles noting "2BR and 3BR most profitable in recent transactions"
- Investment blogs citing 1BR: ~3.7% annualised, 3BR: ~5.8% annualised
- PropertyLimBrothers analysis recommending "2BR in RCR or 2-3BR in OCR for capital appreciation"

### Decade/Era-Based Analysis

**Finding: No platform offers interactive decade-over-decade comparison tools.**

| Platform | What they offer | What's missing |
|----------|----------------|----------------|
| **SRX** | 10-year rolling price trend via X-Value | No explicit decade segmentation |
| **PropertyLimBrothers** | Editorial pieces on market cycles, era-based narrative analysis | Not interactive, not quantitative tools |
| **EdgeProp** | Historical price data, heatmaps | No pre-compiled decade breakdowns |
| **URA** | Quarterly data from Q1 2004 onwards | Raw data only, no decade aggregation |

---

## 2. Data Sources Available

### For Bedroom-Type Analysis

| Source | Bedroom data? | Fields | Access |
|--------|--------------|--------|--------|
| **URA Transaction API** (`PMI_Resi_Transaction`) | No `bedroom` field | `areaSqft`, `price`, `pricePsf`, `contractDate`, `saleType`, `unitNumber` | Free (API key) |
| **URA Rental API** (`PMI_Resi_Rental`) | Yes — `noOfBedRoom` | `rent`, `areaSqft`, `leaseDate`, `projectName` | Free (API key) |
| **URA REALIS** (full database) | No explicit bedroom | Unit-level detail, unit number, area | Paid subscription |
| **data.gov.sg** | No | Aggregated quarterly by region | Free |

**Key approach: Infer bedroom type from area (sqft)**

| Bedroom Type | Typical Size Range (sqft) |
|-------------|--------------------------|
| 1BR | 420 – 700 |
| 2BR | 700 – 1,100 |
| 3BR | 900 – 1,500 |
| 4BR | 1,345 – 2,150 |
| 5BR+ | 1,500 – 2,150+ |

Note: Overlap exists (e.g., large 2BR vs small 3BR). New launches tend to be 20-30% smaller than resale equivalents. Ranges would need calibration.

### For Decade/Era Analysis

| Source | Range | Granularity |
|--------|-------|-------------|
| **URA Property Price Index** (data.gov.sg) | Q1 2004 – present | Quarterly, by property type & region |
| **FRED / BIS** | Q1 1998 – present | Quarterly, aggregate |
| **Our transactions table** | Depends on ingested data | Per-transaction, has `contractDate` |

### For Computing Profit % and CAGR

**Method: Match buy/sell for same unit**
- Filter transactions by `unitNumber` + `projectName`/`address`
- Identify purchase (new_sale) → resale for same unit
- `Profit % = (resale - purchase) / purchase × 100`
- `CAGR = (resale / purchase)^(1/years) - 1`

**Limitation**: Requires sufficient resale transaction volume. New launches with no resales yet cannot show profit data.

---

## 3. What WhatHome Already Has

### Data we store

| Table | Relevant fields | Bedroom data? |
|-------|----------------|---------------|
| `transactions` | `areaSqft`, `pricePsf`, `transactedPrice`, `contractDate`, `saleType`, `unitNumber`, `projectName` | No — but `areaSqft` can infer |
| `rentalContracts` | `noOfBedRoom`, `rent`, `areaSqft`, `leaseDate` | Yes |
| `projectUnits` | `unitType` (1BR-5BR+), `sizeSqftMin/Max`, `pricePsf`, `priceFrom/To` | Yes (curated, not from transactions) |
| `priceIndices` | `quarter`, `region`, `indexValue`, `percentageChange` | No bedroom breakdown |

### Queries that exist
- `getTransactionsByProject()` — all transactions, no bedroom filter
- `getPsfTrend()` — average PSF per month, aggregated across all unit sizes
- `getRentalsByProject()` — last 20 rental contracts with `noOfBedRoom`
- No profit %, CAGR, or decade-based aggregation queries exist

### Key gaps
1. `transactions` table has no `bedroomType` column (must infer from `areaSqft`)
2. No queries aggregate metrics by bedroom type
3. No queries aggregate by time period/era
4. No UI for bedroom-type or decade-based comparisons

---

## 4. Singapore's Key Property Market Eras

| Era | Period | Key Events | Character |
|-----|--------|-----------|-----------|
| Early 1990s Boom | 1992–1997 | Rapid urbanisation, speculation | Prices tripled by 1996 |
| Asian Financial Crisis | 1997–1998 | Thai Baht collapse | Prices fell ~40% |
| Recovery | 1999–2007 | Post-crisis rebound | 36% price increase 2006-2008 |
| GFC Shock & Rebound | 2008–2009 | Global Financial Crisis | 5-quarter correction, 38% rebound |
| Cooling Measures | 2010–2012 | ABSD, SSD, LTV tightened | Volume dropped from 37K to 22K |
| TDSR Era | 2013+ | Total Debt Servicing Ratio cap | Structural shift from speculation |
| COVID Surge | 2020–2023 | WFH demand, low rates | 52.8% price surge over period |
| High Interest Rates | 2023+ | Rate hikes, further cooling | Growth deceleration to 3-4% |

URA data covers Q1 2004 onwards. FRED/BIS data from Q1 1998. Pre-1998 data is sparse.

---

## 5. Opportunity Assessment

### What would be unique to WhatHome

1. **Bedroom-type performance dashboard** — Interactive comparison of 1BR vs 2BR vs 3BR vs 4BR vs 5BR+ across:
   - Average PSF trend over time
   - Profit % (for units with buy + resale history)
   - CAGR over selectable holding periods (3yr, 5yr, 10yr)
   - Rental yield by bedroom type

2. **Era/decade comparison** — How did each bedroom type perform across market eras:
   - Pre-cooling vs post-cooling measures
   - COVID era vs current high-rate environment
   - Selectable time windows (custom date ranges or preset eras)

3. **Combined view** — "Which bedroom type in which era gave the best returns?" — a matrix no one else offers publicly.

### Feasibility concerns

| Concern | Severity | Mitigation |
|---------|----------|------------|
| Bedroom inference from area has overlap zones | Medium | Use calibrated ranges, flag ambiguous units, cross-reference with `projectUnits` where available |
| Profit/CAGR requires matched buy-sell pairs | High | Only works for units with resale history; new launches excluded. Show sample size alongside metrics. |
| Historical data depth (URA API from 2004) | Medium | 20+ years is enough for 2-decade comparison; can supplement with FRED for pre-2004 |
| Computation cost for large datasets | Low | Pre-compute and cache aggregations; update on ingest |

---

## 6. User Decisions

| Decision | Answer |
|----------|--------|
| **Scope** | Both — market-wide analytics dashboard + per-project detail page breakdown |
| **Bedroom inference** | Infer from area (sqft) — map ranges automatically |
| **Time periods** | Calendar decades: 1970s, 1980s, 1990s, 2000s, 2010s, 2020s |
| **Next step** | Research only for now — capture findings, decide on implementation later |

---

## 7. Data Availability by Calendar Decade

A critical constraint for the decade-based view is **how far back our data sources go**:

| Decade | URA Transaction API | data.gov.sg | FRED/BIS | URA Price Index | Feasibility |
|--------|-------------------|-------------|----------|----------------|-------------|
| **1970s** | No | No | No | No | Not feasible from public APIs. Would require academic/archival sources. |
| **1980s** | No | No | No | No | Same — no public digital records. SLA/URA may have archives but not via API. |
| **1990s** | Partial (REALIS from 1995, paid) | No | From Q1 1998 | No | Very limited. REALIS subscription needed for 1995-1999 transactions. FRED has aggregate index from 1998. |
| **2000s** | Partial (REALIS from 1995) | No | Yes (1998+) | From Q1 2004 | Moderate. URA price index from 2004. REALIS (paid) covers full decade. Free API limited to 2004+. |
| **2010s** | Yes (free API) | Yes | Yes | Yes | Full coverage. All sources have data for this decade. |
| **2020s** | Yes (free API) | Yes | Yes | Yes | Full coverage. This is our strongest decade for data. |

**Implication**: With free public data, WhatHome can realistically cover **2 full decades** (2010s and 2020s) and a **partial decade** (2004-2009 from the 2000s). Pre-2004 data would require:
- URA REALIS subscription (paid, covers from 1995)
- Academic datasets or government archives
- Manual data entry from historical reports

**Recommendation for implementation**: Start with 2004-present (3 decades of data from free APIs), then evaluate if REALIS subscription is worthwhile for extending back to 1995.

---

## 8. GFA Harmonisation Impact

**Effective 1 June 2023** (URA Circular DC22-09). First harmonised project: Lentor Mansion (March 2024).

### What changed
- Pre-harmonisation: Different agencies (URA, SLA, BCA, SCDF) used different area definitions. Void spaces, some non-livable elements counted in strata area.
- Post-harmonisation: Unified measurement to middle-of-wall. Voids excluded. Balconies, AC ledges, planter boxes measured consistently.

### Size impact
| Scenario | Pre-harmonisation | Post-harmonisation | Reduction |
|----------|------------------|-------------------|-----------|
| Typical 3BR | 1,001 sqft | 947 sqft | -5.4% |
| 3BR with voids | 1,023 sqft | 915 sqft | -10.5% |
| 3BR+study (worst case) | 1,173 sqft | 969 sqft | -17.4% |

### Impact on bedroom inference
- A post-harmonisation "700 sqft" unit is **physically larger** than a pre-harmonisation "700 sqft" unit
- Bedroom-type thresholds must account for harmonisation status
- PSF comparisons across the boundary are misleading (smaller denominator = higher PSF for same price)

### Handling in data
- URA API has `typeOfArea` (land vs strata) but **no harmonisation flag**
- Must infer from project launch date (DA submitted after 1 June 2023 = harmonised)
- No standard conversion formula — reduction varies 5-17% depending on design
- Not retroactive — old projects keep original measurements

### Implication for WhatHome
When comparing bedroom performance across decades, transactions post-June 2023 need to be flagged. Either:
1. Apply an approximate normalisation factor (~10% uplift to pre-harmonisation areas for comparison)
2. Display with a clear caveat that post-2023 area measurements differ
3. Maintain separate bedroom-size thresholds for pre/post harmonisation projects

---

## 9. Buyer Pain Points & Target Audiences

### What SG property buyers actually ask

1. **"Should I buy 1BR or 2BR?"** — First-time buyers want historical returns by bedroom type but can't find segmented data
2. **"What CAGR if I bought in 2013 vs 2008?"** — Investors want era-specific returns but must manually compile from raw URA data
3. **"Does property always go up?"** — Misconception. At least 4 major downturns in 30 years (1980s recession, 1997 AFC, 2001 dot-com, 2008 GFC, 2014 cooling-induced dip)
4. **"How did my district compare across decades?"** — CCR had only 21% PSF growth 2012-2022 while OCR had 39%. This surprises most buyers.
5. **"What's the real impact of cooling measures?"** — TDSR (2013) halved new home sales. ABSD changes shifted foreign buyer share from 20% to 7%.

### How buyers naturally frame time periods

| Framing | Example | Who uses it |
|---------|---------|-------------|
| **Calendar decades** | "2000s vs 2010s" | General public, long-term comparisons |
| **Policy regimes** | "Pre-ABSD vs post-ABSD" | Sophisticated investors, agents |
| **Market cycles** | "Post-GFC recovery" | Financial analysts |
| **Holding periods** | "3-year, 5-year, 10-year" | Practical buyers (tied to SSD) |
| **Peak-to-peak** | "Compare to 2013 peak" | Forum users, price-watchers |

**Key insight**: There's no single "right" framing. Different audiences think differently. Calendar decades are the most universally understood, but holding-period analysis may be the most practically useful.

### Persistent misconceptions
1. **"Property always goes up"** — Not true. Annualised returns over 20 years were only ~2%, vs 9.2% for stocks
2. **PSF is comparable across eras** — Not after GFA harmonisation (5-17% area reduction post-2023)
3. **"CCR always outperforms"** — OCR actually outperformed CCR in 2012-2022 (39% vs 21%)
4. **All bedroom types perform equally** — 3BR historically shows ~5.8% annualised vs 1BR at ~3.7%
5. **Leasehold decay doesn't matter** — Price indices don't account for remaining lease erosion

### Target audiences (priority order)

1. **First-time buyers** — Deciding between bedroom types. Need: "Which unit type has historically given better returns in my target region?"
2. **Property investors** — Comparing ROI across unit types and periods. Need: "What was CAGR for 2BR in RCR in the 2010s vs 2020s?"
3. **Property agents** — Need simple narratives to advise clients. Need: "Here's how your district performed across decades"
4. **Financial planners** — Comparing property vs other asset classes. Need: Total returns by period with proper cost accounting
5. **Researchers/policy analysts** — Understanding cooling measure impacts. Need: Volume and price segmented by policy era

---

## 10. Holding Period Analysis

### SSD creates natural holding-period buckets

| Period | SSD Structure | Minimum hold for 0% SSD |
|--------|--------------|------------------------|
| Pre-2010 | No SSD | Immediate |
| 2010–2017 | 4-year graduated (up to 16%) | 4 years |
| 2017–Jul 2025 | 3-year graduated (up to 12%) | 3 years |
| Jul 2025+ | 4-year graduated (up to 16%) | 4 years |

Buyers naturally think in SSD-aligned buckets: "hold past SSD period, then decide."

### Typical holding periods in Singapore
- **Pre-SSD (2003-2005 buys)**: Average 2.4 years
- **Post-SSD (2015-2016 buys)**: Average 5.2 years
- **Current trend (2020s)**: 9-10 years average
- **Fewer than 5% sell within 3 years** of purchase

### Computing returns from matched buy-sell pairs

**CAGR = [(Net Sale Proceeds / Total Investment Cost)^(1/years)] - 1**

Transaction costs to factor:
- **Buy side**: BSD (progressive), ABSD (5-30%), legal ($1.3-3K), agent (~1%)
- **Sell side**: SSD (0-16%), legal ($2.5-5K), agent (~2%)
- **Holding costs**: Maintenance (~$2.4K/yr), property tax, mortgage interest

**Data matching**: Link by `unitNumber` + `projectName`. Post-2015 IRAS stamp duty data is most complete; pre-2015 caveat data covers ~80-90%.

### Historical returns by holding period
- **5-year average**: ~0.9% annualised (recent period)
- **10-year average**: ~5% annualised
- **20-year cumulative**: ~54% (≈2.2% CAGR)
- Individual variance is very high — market averages mask significant project/location differences

### Recommended holding-period buckets for WhatHome
**3, 5, 7, 10 years** — aligned with SSD thresholds and common buyer planning horizons.

---

## 11. Rental Yield by Bedroom Type

### Current yields (2025)

| Bedroom | Gross Yield | Trend |
|---------|------------|-------|
| 1BR | 3.65–4.1% | Highest yield, stable demand from singles/expats |
| 2BR | 3.3% | Mid-range, good liquidity |
| 3BR | 3.0–3.15% | Balanced capital + rental |
| 4BR+ | 2.5–3.0% | Lowest yield, but post-COVID WFH demand helped |

**~1.1 percentage point spread** between 1BR and 3BR.

### By region

| Region | Gross Yield | Notes |
|--------|------------|-------|
| CCR | 2.5–3.5% | Lowest yields; prime appreciation captures value |
| RCR | 3.0–3.5% | Balanced |
| OCR | 3.5–4.0%+ | Highest yields (Hougang/Punggol ~3.6-4.0%) |

### The capital vs yield trade-off by bedroom type

| Goal | Optimal type | Why |
|------|-------------|-----|
| **Income focus** | 1BR, 2BR | 3.6–4.2% yield, quick turnovers |
| **Capital growth** | 3BR, 4BR | 35–50% appreciation over 10 years (vs 18% for 1BR) |
| **Balanced** | Mix 1BR + 3BR | Hedges across market cycles |

### Data availability for WhatHome
- `rentalContracts` already has `noOfBedRoom` + `rent` + `areaSqft` + `leaseDate`
- `transactions` has `transactedPrice` + `pricePsf` for same projects
- **Can compute**: `grossYield = (medianRent × 12) / medianTransactionPrice × 100`
- **Competitors don't show**: rental yield segmented by bedroom type at project level — this is a gap

---

## 12. Competitor Deep Dive: StackedHomes vs PLB Insights

### StackedHomes

| Dimension | Detail |
|-----------|--------|
| **Model** | Editorial-first (2,000+ research articles) |
| **Data depth** | 30+ years (URA data from 1990s) |
| **Bedroom analysis** | Some (analysed 3,383 2BR transactions 2011-2026) but editorial, not interactive |
| **Interactive tools** | Minimal — curates external tools, no proprietary dashboards |
| **Pricing** | Freemium — Stacked Pro subscription (10K+ subscribers) |
| **Target** | Positioned for young buyers, actual audience is 45-54 upgraders/investors |
| **Unique moat** | Editorial authority, candid reviews, SEO dominance on long-tail queries |
| **Content** | Blog-first, no YouTube, social media for distribution |

### PLB Insights (PropertyLimBrothers)

| Dimension | Detail |
|-----------|--------|
| **Model** | Tool-driven + agent-integrated |
| **Tools** | MOAT Analysis (10-factor scoring), Disparity Effect (PSF vs district average), Nucleus App (18 calculators), Alana AI chatbot |
| **Data depth** | ~15 years (2010-2025) |
| **Bedroom analysis** | Weak — segments by property type, not bedroom count |
| **Pricing** | Disparity Effect: $12/mo; some tools agent-only |
| **Target** | Serious investors, property agents, advisors |
| **Unique moat** | Proprietary MOAT scoring, agent network integration |
| **Content** | Multi-channel: articles, podcast, YouTube, quarterly reports |

### Comparison matrix

| Dimension | StackedHomes | PLB | WhatHome opportunity |
|-----------|-------------|-----|---------------------|
| **Bedroom-type analytics** | Some editorial | Weak | **Strong differentiator** |
| **Unit-level transaction chains** | Limited | Minimal | **Key gap to fill** |
| **Interactive tools** | Minimal | Medium (MOAT, calculators) | **High — comparison, scenario, returns** |
| **Decade/era analysis** | Trend-focused | Market cycle lens | **Neither offers interactive decade view** |
| **Rental yield by BR** | Present but not primary | Present | **Neither segments at project level by BR** |
| **Data granularity** | Project-level | Project/district | **Unit-level + bedroom + project** |
| **Pricing** | Freemium (Pro sub) | Freemium ($12/mo) | **Free research tool** |
| **Agent-driven** | No | Yes | **No (research focus)** |

### 5 gaps WhatHome can exploit
1. **Bedroom-type historical performance** — Neither deeply segments 1BR vs 2BR vs 3BR returns
2. **Unit-level transaction chains** — "Unit 15-23: bought $850K (2015) → $1.2M (2020) → $1.45M (2025)"
3. **Interactive returns calculator** — StackedHomes teaches but doesn't automate
4. **Rental yield by bedroom at project level** — Neither offers this
5. **Decade x bedroom x region matrix** — Entirely new analytical dimension

---

## 13. Research Summary

### The opportunity (validated)
- **No competitor offers interactive bedroom-type performance comparisons** — confirmed across PropertyGuru, 99.co, EdgeProp, SRX, StackedHomes, PLB Insights
- **No competitor offers interactive decade-over-decade comparison tools** — PLB has editorial cycle analysis but not interactive
- **No competitor shows rental yield segmented by bedroom type at project level**
- **No competitor provides unit-level transaction chain visualisation**
- Strong buyer demand — forum users regularly ask about returns by bedroom type and period but can't find answers

### The data path
- **Bedroom inference**: Map `areaSqft` -> bedroom type. Account for GFA harmonisation (June 2023, 5-17% area reduction)
- **Profit/CAGR**: Match buy/sell by `unitNumber` + `projectName`. Post-2015 IRAS data most complete
- **Rental yield**: Already have `noOfBedRoom` in rental contracts + transaction prices in same project
- **Decades**: Free data covers 2004-present (3 decades). REALIS subscription extends to 1995
- **Holding periods**: Natural buckets at 3, 5, 7, 10 years (SSD-aligned)

### What WhatHome already has
- `transactions`: `areaSqft`, `pricePsf`, `transactedPrice`, `contractDate`, `saleType`, `unitNumber`
- `rentalContracts`: `noOfBedRoom`, `rent`, `areaSqft`, `leaseDate`
- `projectUnits`: curated bedroom types with size ranges
- `priceIndices`: quarterly by region

### What WhatHome needs to build (when ready)
1. Bedroom type inference on transactions (harmonisation-aware thresholds)
2. Matched buy-sell pair identification (same unit across transactions)
3. Aggregation queries: PSF/CAGR/profit by bedroom x decade x region
4. Rental yield computation by bedroom type per project
5. Holding-period returns calculator (3, 5, 7, 10yr)
6. UI: Market-wide analytics dashboard + per-project detail breakdown

### Key risks & mitigations
| Risk | Severity | Mitigation |
|------|----------|------------|
| Bedroom inference overlap (900-1100 sqft) | Medium | Calibrated ranges + cross-reference `projectUnits` |
| GFA harmonisation (June 2023) | Medium | Flag projects, adjust thresholds, display caveat |
| Limited buy-sell pairs for new launches | High | Show sample size (N), focus on established projects |
| Pre-2004 data gap | Medium | Start with 2004+, evaluate REALIS later |
| Thin samples for 5BR+ or niche combos | Low | Grey out cells with N < threshold |

### Recommended analytical framework
- **Primary grouping**: Calendar decades (2000s, 2010s, 2020s)
- **Primary metric**: Holding-period CAGR (3yr, 5yr, 10yr)
- **Segmentation**: Bedroom type (1BR-5BR+) x Region (CCR/RCR/OCR)
- **Supplementary**: Rental yield by bedroom, total return (capital + rental), unit-level transaction chains

Directly answers the questions buyers ask:
- *"Which bedroom type has the best returns?"*
- *"How did returns differ across decades?"*
- *"Should I optimise for rental yield (1BR) or capital growth (3BR)?"*
- *"What CAGR can I expect for a 5-year hold in RCR?"*

---

## 14. Implementation Status — What Has Been Built

The following sections document the actual codebase state as of 2026-03-28. Since the initial research, significant implementation has been completed across schema, utilities, queries, workflows, and UI.

### 14.1 Database Schema Additions

#### `transactions` table — New columns (`src/db/schema/transactions.ts`)

Two columns added to existing `transactions` table:

| Column | Type | Purpose |
|--------|------|---------|
| `inferredBedroomType` | `unitTypeEnum` (1BR/2BR/3BR/4BR/5BR/Penthouse) | Bedroom type inferred from `areaSqft` via the inference engine |
| `isPostHarmonisation` | `boolean` | Whether this transaction belongs to a post-GFA-harmonisation project (launch date >= 2023-06-01) |

**Indexes added:**
- `idx_txn_project_bedroom` — composite index on `(projectId, inferredBedroomType)` for per-project bedroom queries
- `idx_txn_bedroom_date` — composite index on `(inferredBedroomType, contractDate)` for market-wide bedroom time-series

#### `transaction_pairs` table — New table (`src/db/schema/transaction-pairs.ts`)

Entirely new table for matched buy-sell pairs:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid (PK) | Auto-generated |
| `projectId` | uuid (FK -> projects) | The project this pair belongs to |
| `buyTransactionId` | uuid (FK -> transactions) | The buy-side transaction |
| `sellTransactionId` | uuid (FK -> transactions) | The sell-side (resale) transaction |
| `inferredBedroomType` | `unitTypeEnum` | Inherited from the sell transaction's inferred bedroom |
| `buyPrice` | integer | Purchase price |
| `sellPrice` | integer | Resale price |
| `buyDate` | date | Contract date of purchase |
| `sellDate` | date | Contract date of resale |
| `buyPsf` | numeric | PSF at purchase |
| `sellPsf` | numeric | PSF at resale |
| `areaSqft` | numeric | Unit area |
| `holdingMonths` | integer | Calendar months between buy and sell |
| `profitAmount` | integer | `sellPrice - buyPrice` |
| `profitPercent` | numeric | `(profitAmount / buyPrice) x 100` |
| `annualisedReturn` | numeric | CAGR: `(sellPrice/buyPrice)^(1/years) - 1` x 100 |
| `holdingBucket` | `holdingBucketEnum` (0-3y/3-5y/5-7y/7-10y/10y+) | SSD-aligned holding period classification |
| `region` | text | CCR/RCR/OCR from the project |
| `district` | integer | District number from the project |
| `decade` | text | Decade label of the sell date (e.g. "2010s", "2020s") |
| `createdAt` / `updatedAt` | timestamps | Standard timestamps |

**Indexes:**
- `idx_pairs_project` — on `projectId` for per-project pair lookups
- `idx_pairs_bedroom_decade` — composite on `(inferredBedroomType, decade, region)` for the heatmap analytics

**Relations:**
- `project` -> `projects.id`
- `buyTransaction` -> `transactions.id`
- `sellTransaction` -> `transactions.id`

#### `rental_contracts` table — Pre-existing (`src/db/schema/rentals.ts`)

Already had `noOfBedRoom` (text), `rent` (integer), `areaSqft` (text), `leaseDate` (date). No schema changes needed — URA rental API provides bedroom count natively.

#### `median_rentals` table — Pre-existing (`src/db/schema/rentals.ts`)

Has `projectName`, `refPeriod`, `median`, `psf25`, `psf75`. No bedroom breakdown — median is aggregate across all bedrooms.

---

### 14.2 Utility Functions — Bedroom Inference Engine

#### `src/lib/bedroom/inference.ts`

**Purpose**: Infers bedroom type from area (sqft) with GFA harmonisation awareness.

**Type definition:**
```typescript
type UnitType = "1BR" | "2BR" | "3BR" | "4BR" | "5BR" | "Penthouse";
```

**Default area ranges (pre-harmonisation):**

| Bedroom | Min sqft | Max sqft |
|---------|----------|----------|
| 1BR | 420 | 700 |
| 2BR | 700 | 1,100 |
| 3BR | 900 | 1,500 |
| 4BR | 1,345 | 2,150 |
| 5BR | 1,500 | 2,150 |
| Penthouse | 2,200 | Infinity |

**Overlap zones:**
- 700 sqft: boundary between 1BR and 2BR
- 900-1,100 sqft: overlap between 2BR and 3BR
- 1,345-1,500 sqft: overlap between 3BR, 4BR, and 5BR
- 1,500-2,150 sqft: overlap between 4BR and 5BR

**Overlap resolution**: When area falls in multiple ranges, the function selects the range whose midpoint is closest to the area value.

**GFA harmonisation handling:**
- `HARMONISATION_FACTOR = 0.9`
- For post-harmonisation transactions: `effectiveArea = areaSqft / 0.9` (adjusts upward by ~11% to normalise against pre-harmonisation ranges)
- This means a post-harmonisation 700 sqft is treated as ~778 sqft for classification purposes

**Priority order for range sources:**
1. **Curated ranges** from `projectUnits` table (project-specific, from AI research agent)
2. **Default ranges** (fallback when no curated data exists)

**Function signature:**
```typescript
function inferBedroomType(
  areaSqft: number,
  isPostHarmonisation: boolean | null,
  curatedRanges?: CuratedRange[],
): UnitType | null
```

#### `src/lib/bedroom/returns.ts`

**Purpose**: Pure computation functions for buy-sell pair metrics. No database dependencies.

**Functions:**

1. **`computeReturns(buyPrice, sellPrice, holdingMonths)`** -> `{ profitAmount, profitPercent, cagr }`
   - `profitAmount = sellPrice - buyPrice`
   - `profitPercent = (profitAmount / buyPrice) x 100`
   - `cagr = ((sellPrice / buyPrice) ^ (1 / holdingYears) - 1) x 100`

2. **`holdingBucket(months)`** -> `HoldingBucket`
   - <= 36 months -> "0-3y"
   - <= 60 months -> "3-5y"
   - <= 84 months -> "5-7y"
   - <= 120 months -> "7-10y"
   - > 120 months -> "10y+"

3. **`decade(dateStr)`** -> string (e.g. "2010s", "2020s")
   - Extracts year, floors to nearest decade

4. **`holdingMonths(buyDate, sellDate)`** -> number
   - Calendar month diff (using 30.44 days/month average)

#### `src/lib/bedroom/mapping.ts`

**Purpose**: Maps between URA rental API bedroom values and internal `unitTypeEnum` values.

**Forward map** (URA -> WhatHome):
| URA Value | WhatHome Value |
|-----------|---------------|
| "1" | "1BR" |
| "2" | "2BR" |
| "3" | "3BR" |
| "4" | "4BR" |
| "5 & above" | "5BR" |

**Reverse map** (WhatHome -> URA):
| WhatHome Value | URA Value |
|---------------|-----------|
| "1BR" | "1" |
| "2BR" | "2" |
| "3BR" | "3" |
| "4BR" | "4" |
| "5BR" | "5 & above" |
| "Penthouse" | "5 & above" |

---

### 14.3 Query Functions

#### Per-project queries

| Function | File | Purpose | Status |
|----------|------|---------|--------|
| `getTransactionsByProject(projectId)` | `src/lib/queries/transactions.ts` | All transactions for a project (no bedroom filter) | Pre-existing |
| `getPsfTrend(projectId)` | `src/lib/queries/transactions.ts` | Monthly avg PSF aggregated across all unit sizes | Pre-existing |
| `getPsfTrendByBedroom(projectId)` | `src/lib/queries/transactions.ts` | Monthly avg PSF pivoted by bedroom type (1BR-Penthouse + all) | **New** |
| `getRentalsByProject(projectId)` | `src/lib/queries/rentals.ts` | Last 20 rental contracts with `noOfBedRoom` | Pre-existing |
| `getMedianRentalByProject(projectName)` | `src/lib/queries/rentals.ts` | Latest median rental (aggregate, no bedroom split) | Pre-existing |
| `getRentalYieldByBedroom(projectId)` | `src/lib/queries/rentals.ts` | Gross yield per bedroom type using median rent / median resale price (24-month window) | **New** |
| `getTransactionPairsByProject(projectId)` | `src/lib/queries/transaction-pairs.ts` | All buy-sell pairs for a project, sorted by sell date desc | **New** |

#### Market-wide queries

| Function | File | Purpose | Status |
|----------|------|---------|--------|
| `getMarketPsfByBedroom()` | `src/lib/queries/bedroom-analytics.ts` | Monthly avg PSF by bedroom type, market-wide, last 5 years | **New** |
| `getDecadeBedroomCagr()` | `src/lib/queries/bedroom-analytics.ts` | Decade x bedroom x region median CAGR from transaction_pairs | **New** |
| `getMarketRentalYieldByBedroom(region?)` | `src/lib/queries/rentals.ts` | Market-wide gross yield by bedroom type and region | **New** |

#### Query implementation details

**`getPsfTrendByBedroom`** (per-project):
- Groups by `to_char(contractDate, 'YYYY-MM')` + `inferredBedroomType`
- Runs a separate aggregate query for `all` (across all bedrooms)
- Returns pivoted shape: `{ month, "1BR": psf|null, "2BR": psf|null, ..., all: psf }`
- Cache tags: `bedroom-analytics`

**`getRentalYieldByBedroom`** (per-project):
- Looks at last 24 months of rental contracts and resale transactions
- Computes: `grossYield = (medianMonthlyRent x 12) / medianResalePrice x 100`
- Uses `PERCENTILE_CONT(0.5)` for true median (not average)
- Maps URA rental bedroom values to unitTypeEnum via `mapBedroom()`
- Returns: `{ bedroom, medianRent, medianPrice, grossYield, rentalSample, txnSample }`

**`getDecadeBedroomCagr`** (market-wide):
- Reads from pre-computed `transaction_pairs` table
- Groups by `(decade, inferredBedroomType, region)`
- Uses `PERCENTILE_CONT(0.5)` for median CAGR
- Returns: `{ decade, bedroom, region, medianCagr, sampleSize }`

**`getMarketRentalYieldByBedroom`** (market-wide):
- Joins `rentalContracts` -> `projects` for region
- Joins `transactions` -> `projects` for region
- Same 24-month window, same yield formula
- Returns: `{ bedroom, region, grossYield, sampleSize }`

---

### 14.4 Backfill Workflows

Two Vercel Workflow DevKit workflows handle data backfilling:

#### Bedroom Inference Backfill (`src/workflows/backfill/bedroom.ts`)

**Trigger**: Manual from admin panel
**Runtime**: Vercel Workflow DevKit (`"use workflow"` / `"use step"`)

**Steps:**
1. `loadProjectUnitsMap()` — Loads all `projectUnits` rows into a Map keyed by `projectId`, providing curated size ranges for inference
2. `loadProjectLaunchDates()` — Loads all project launch dates into a Map for GFA harmonisation detection
3. `getTransactionCount()` — Gets total count for progress tracking
4. `processBatch(offset, limit, curatedRangesMap, launchDatesMap)` — Processes transactions in batches of 1,000:
   - Reads batch of transactions
   - For each: determines `isPostHarmonisation` from project launch date (>= 2023-06-01)
   - Calls `inferBedroomType()` with area, harmonisation flag, and curated ranges
   - Batch-updates transactions with `inferredBedroomType` and `isPostHarmonisation` (chunks of 200 in a DB transaction)

**Output**: `{ processed: number, updated: number }`

#### Transaction Pairs Backfill (`src/workflows/backfill/pairs.ts`)

**Trigger**: Manual from admin panel
**Runtime**: Vercel Workflow DevKit

**Steps:**
1. `stepCountPairs()` — Count existing pairs (for logging)
2. `stepLoadProjectMeta()` — Load all projects' region + district for enrichment
3. `stepLoadResales()` — Load all resale transactions (sorted asc by contractDate)
4. `stepLoadBuys()` — Load all non-resale transactions (sorted desc by contractDate)
5. `stepMatchAndInsert(projectMeta, resales, buys)` — The core matching logic:
   - Indexes buys by composite key: `${projectId}:${areaSqft}:${floorRange}`
   - For each resale, finds the most recent buy with the same key that occurred before the resale date
   - Filters out pairs with < 6 months holding period (noise/errors)
   - Computes: `profitAmount`, `profitPercent`, `cagr`, `holdingBucket`, `decade`
   - Enriches with project `region` and `district`
   - Batch inserts in chunks of 500

**Matching key**: `${projectId}:${areaSqft}:${floorRange}` — matches on same project, same unit area, and same floor range (proxy for same unit).

**Output**: `{ inserted: number, durationMs: number }`

---

### 14.5 UI Components — Project Detail Page

The project detail page (`/projects/[slug]`) now includes bedroom-aware components:

#### `BedroomPsfChart` — PSF trend by bedroom (client component)
- **Location**: `src/app/(research)/projects/[slug]/components/bedroom-psf-chart.tsx`
- Recharts line chart with one line per bedroom type (1BR-5BR, Penthouse)
- Colour-coded lines, legend toggle
- Replaces aggregate PSF chart when bedroom data is available

#### `PsfChartSection` — Chart container (client component)
- **Location**: `src/app/(research)/projects/[slug]/components/psf-chart-section.tsx`
- Conditionally renders `BedroomPsfChart` when `bedroomData` is available, otherwise falls back to aggregate `PsfChart`

#### `BedroomSummaryTable` — Bedroom performance stats (server component)
- **Location**: `src/app/(research)/projects/[slug]/components/bedroom-summary-table.tsx`
- Shows: bedroom type, number of data points, latest PSF
- Auto-hides if no bedroom data exists
- Counts data points per bedroom type from PSF trend data

#### `RentalComparison` — Rental data with yield by bedroom (server component)
- **Location**: `src/app/(research)/projects/[slug]/components/rental-comparison.tsx`
- Fetches three data sources in parallel: rental contracts, median rental, rental yield by bedroom
- Displays:
  - Grid of gross yield cards per bedroom type (e.g. "1BR Gross Yield: 3.85%", with sample size)
  - Median rent PSF with 25th/75th percentile
  - Recent rental contracts table (bedroom, rent, area, lease date)

#### `TransactionChains` — Buy-sell pair visualisation (server component)
- **Location**: `src/app/(research)/projects/[slug]/components/transaction-chains.tsx`
- Shows up to 20 most recent buy-sell pairs
- Columns: Area, Buy Date, Buy Price, Sell Date, Sell Price, Holding period, Profit %, CAGR
- Colour-coded: green for profit, red for loss
- Prices formatted as $X.XXM or $XXXK

#### Project Detail Page Assembly (`src/app/(research)/projects/[slug]/page.tsx`)

Current component rendering order:
1. `<ProjectHero>` — Header with project info
2. `<PricingSection>` — Unit mix pricing table
3. `<PsfChartSection>` — PSF trend (bedroom-aware)
4. `<BedroomSummaryTable>` — Bedroom data point counts + latest PSF
5. `<NearbyAmenities>` — MRT, schools, malls
6. `<RentalComparison>` — Rental yield by bedroom + contracts
7. `<TransactionChains>` — Buy-sell pair profit/CAGR table
8. `<ProjectGallery>` — Floor plans, renders
9. `<AiSummary>` — AI-generated analysis
10. Link to full transactions page

---

### 14.6 What Remains to Build

Based on the GitHub issues (#54-#59) and research findings, the following work is not yet implemented:

#### Issue #55: Bedroom inference refinement
- [ ] Validate inference accuracy against `projectUnits` curated data
- [ ] Add admin UI to view/override inferred bedroom types
- [ ] Add confidence score to inference (high when within curated range, medium/low for default ranges in overlap zones)
- [ ] Handle edge cases: dual-key units, loft units, studio vs 1BR distinction

#### Issue #56: Profit/CAGR analytics
- [ ] Holding-period return aggregations (3yr, 5yr, 7yr, 10yr buckets)
- [ ] Transaction cost adjustments (BSD, ABSD, SSD, legal, agent fees) — currently raw profit only
- [ ] Net return calculator (accounting for holding costs: maintenance, property tax, mortgage interest)
- [ ] Median returns by bedroom type aggregated at market level

#### Issue #57: Rental yield per project
- [x] `getRentalYieldByBedroom()` query — done
- [x] `RentalComparison` component displaying yield cards — done
- [ ] Historical yield trend (yield over time, not just current 24-month snapshot)
- [ ] Yield comparison across similar projects in same district/region
- [ ] Total return (capital appreciation + rental yield) computation

#### Issue #58: Market-wide analytics dashboard
- [x] `getMarketPsfByBedroom()` query — done
- [x] `getDecadeBedroomCagr()` query — done
- [x] `getMarketRentalYieldByBedroom()` query — done
- [ ] Analytics dashboard page UI at `/analytics` (currently exists but needs bedroom widgets)
- [ ] Decade x bedroom x region heatmap table
- [ ] PSF trend chart with bedroom toggle (market-wide)
- [ ] Holding-period returns chart
- [ ] Market-wide rental yield comparison chart
- [ ] Filter controls: region (CCR/RCR/OCR), decade, bedroom type

#### Issue #59: Per-project bedroom breakdown
- [x] `BedroomPsfChart` component — done
- [x] `BedroomSummaryTable` component — done
- [x] `TransactionChains` component — done
- [x] `RentalComparison` with yield cards — done
- [ ] Decade-based performance breakdown per project (how did each bedroom type perform in the 2010s vs 2020s for this specific project)
- [ ] Profit distribution histogram (% of units that gained X% in Y years)
- [ ] Comparison to market average (is this project's 2BR CAGR above or below market median)

---

## 15. Singapore Stamp Duty History

Understanding stamp duty is critical for accurate return calculations. Below are the full historical rates.

### 15.1 Buyer's Stamp Duty (BSD) — Progressive rates on purchase price

| Tier | Rate | Effective |
|------|------|-----------|
| First $180,000 | 1% | Ongoing |
| Next $180,000 | 2% | Ongoing |
| Next $640,000 | 3% | From 20 Feb 2018 |
| Next $500,000 | 4% | From 15 Feb 2023 |
| Next $1,500,000 | 5% | From 15 Feb 2023 |
| Remainder | 6% | From 15 Feb 2023 |

**Previous rate (pre-Feb 2018):** flat 3% above $360K (first $180K at 1%, next $180K at 2%, remainder at 3%).

**Example**: A $1.5M property today incurs ~$44,600 BSD (~3.0% effective rate).

### 15.2 Additional Buyer's Stamp Duty (ABSD) — Progressive tightening

| Date | Singapore Citizens (1st) | SC (2nd) | SC (3rd+) | SPR (1st) | SPR (2nd+) | Foreigners |
|------|------------------------|----------|-----------|-----------|------------|------------|
| Pre-Dec 2011 | 0% | 0% | 0% | 0% | 0% | 0% |
| 8 Dec 2011 | 0% | 0% | 0% | 0% | 3% | 10% |
| 12 Jan 2013 | 0% | 7% | 10% | 5% | 10% | 15% |
| 6 Jul 2018 | 0% | 12% | 15% | 5% | 15% | 20% |
| 16 Dec 2021 | 0% | 17% | 25% | 5% | 25% | 30% |
| 27 Apr 2023 | 0% | 20% | 30% | 5% | 30% | 60% |

**Key impact**: Foreigner share of purchases dropped from ~20% (pre-2011) to ~7% (post-2013) to ~3% (post-2023).

### 15.3 Seller's Stamp Duty (SSD) — Penalises short-term flipping

| Period | Within 1 year | 1-2 years | 2-3 years | 3-4 years |
|--------|--------------|-----------|-----------|-----------|
| Pre-2010 | None | None | None | None |
| Feb 2010 | 1% | — | — | — |
| Aug 2010 | 3% | 2% | 1% | — |
| Jan 2011 | 16% | 12% | 8% | 4% |
| Mar 2017 | 12% | 8% | 4% | — |
| Jul 2025 (upcoming) | 16% | 12% | 8% | 4% |

**Holding period impact**: Average holding period increased from 2.4 years (pre-SSD) to 9-10 years (2020s).

### 15.4 Implication for Return Calculations

Current `computeReturns()` in `src/lib/bedroom/returns.ts` computes **raw** profit and CAGR without deducting transaction costs. For accurate net returns:

```
Net Return = (Sell Price - BSD - ABSD - SSD - Legal - Agent)
           - (Buy Price + BSD + ABSD + Legal + Agent)
           - (Holding Costs x Years)
```

Where holding costs include:
- Maintenance: ~$200/month ($2,400/yr)
- Property tax: 0-20% progressive on annual value
- Mortgage interest: variable (~2-4% p.a.)

This cost-adjusted return is listed as remaining work under Issue #56.

---

## 16. Property Market Volume & Transaction Data

### 16.1 Transaction volume by year (private residential)

| Year | New Sales | Sub-sales | Resales | Total | Key Event |
|------|-----------|-----------|---------|-------|-----------|
| 2007 | ~14,000 | ~4,000 | ~19,000 | ~37,000 | Pre-GFC peak |
| 2008 | ~4,300 | ~1,600 | ~8,500 | ~14,400 | GFC crash |
| 2009 | ~14,700 | ~2,900 | ~10,300 | ~27,900 | V-shaped rebound |
| 2010 | ~16,300 | ~3,200 | ~16,300 | ~35,800 | SSD introduced |
| 2011 | ~16,300 | ~2,300 | ~13,000 | ~31,600 | ABSD introduced |
| 2012 | ~22,000 | ~1,800 | ~11,000 | ~34,800 | ABSD tightened |
| 2013 | ~14,900 | ~1,300 | ~9,400 | ~25,600 | TDSR introduced |
| 2014 | ~7,300 | ~800 | ~5,700 | ~13,800 | Market bottom |
| 2015 | ~7,400 | ~800 | ~6,300 | ~14,500 | Recovery begins |
| 2016 | ~7,600 | ~800 | ~7,400 | ~15,800 | Gradual recovery |
| 2017 | ~10,500 | ~900 | ~9,700 | ~21,100 | SSD relaxed |
| 2018 | ~8,500 | ~800 | ~9,200 | ~18,500 | ABSD tightened Jul |
| 2019 | ~9,900 | ~800 | ~9,600 | ~20,300 | Stable |
| 2020 | ~9,900 | ~700 | ~7,700 | ~18,300 | COVID initial dip |
| 2021 | ~13,000 | ~1,100 | ~12,500 | ~26,600 | COVID surge |
| 2022 | ~7,000 | ~700 | ~10,000 | ~17,700 | Rate hikes begin |
| 2023 | ~6,400 | ~600 | ~8,300 | ~15,300 | ABSD at 60% for foreigners |
| 2024 | ~8,100 | ~600 | ~9,200 | ~17,900 | Moderate recovery |
| 2025* | ~3,200 | ~300 | ~4,500 | ~8,000 | Q1 partial data |

**Key observations:**
- New sale volume halved after TDSR (2013): from 22K to 7K
- Resale volume more resilient — now dominant share of total
- Sub-sale volume collapsed post-SSD (from 4K to <1K)
- COVID period saw new-sale spike (13K in 2021) then collapse (6.4K in 2023)

### 16.2 Data we have vs total market

WhatHome's `transactions` table contains data from the URA Transaction API (free, from ~2004) and data.gov.sg. Coverage:
- **2004-2009**: Moderate coverage via URA API
- **2010-present**: Full coverage via URA Transaction API
- **Pre-2004**: No data from free APIs; URA REALIS (paid) covers from 1995

For `transaction_pairs` (matched buy-sell), the volume is inherently lower since it requires the same unit to appear in both a buy and resale transaction. Estimated yield: ~15-25% of resale transactions can be matched to a prior purchase.

---

## 17. PSF Performance by Region and Decade

### 17.1 Historical PSF by region (approximate medians)

| Period | CCR (Median PSF) | RCR (Median PSF) | OCR (Median PSF) | CCR Premium |
|--------|-----------------|-----------------|-----------------|-------------|
| 2004-2007 | $1,200-1,800 | $600-1,000 | $400-700 | ~2.0x OCR |
| 2008-2009 | $1,300-1,600 | $700-900 | $500-700 | ~2.3x OCR |
| 2010-2013 | $1,800-2,200 | $1,000-1,400 | $700-1,000 | ~2.2x OCR |
| 2014-2017 | $1,800-2,000 | $1,100-1,300 | $800-1,000 | ~2.0x OCR |
| 2018-2019 | $2,100-2,400 | $1,400-1,600 | $1,000-1,200 | ~2.0x OCR |
| 2020-2023 | $2,500-3,000 | $1,800-2,200 | $1,200-1,600 | ~1.9x OCR |
| 2024-2025 | $2,800-3,200 | $2,000-2,400 | $1,400-1,800 | ~1.8x OCR |

**Key insight**: CCR premium over OCR has been compressing (from 2.3x to 1.8x), meaning OCR has outperformed on a PSF growth basis.

### 17.2 Growth rates by region (2012-2022 decade)

| Region | PSF Growth | Notable Projects |
|--------|-----------|-----------------|
| CCR | ~21% | Orchard, Marina Bay, Sentosa |
| RCR | ~30% | Queenstown, Toa Payoh, Geylang |
| OCR | ~39% | Punggol, Sengkang, Jurong East |

**Reversal from conventional wisdom**: Many buyers assume CCR outperforms. Data shows OCR significantly outperformed CCR over 2012-2022, driven by mass-market demand, infrastructure developments (Cross Island Line, Jurong Lake District), and lower absolute prices.

---

## 18. Bedroom-Type Performance Data (Research Benchmarks)

### 18.1 Annualised returns by bedroom type (industry estimates)

| Bedroom | Annualised Return | Capital Appreciation (10yr) | Liquidity | Notes |
|---------|-------------------|---------------------------|-----------|-------|
| 1BR | ~3.7% | ~18% | High (quick flips) | Best rental yield, weakest capital growth |
| 2BR | ~4.5% | ~25% | High | Sweet spot for first-time investors |
| 3BR | ~5.8% | ~35-50% | Medium | Best capital growth historically |
| 4BR | ~4.0% | ~30% | Low | Limited buyer pool at higher quantum |
| 5BR+ | ~3.5% | ~25% | Very low | Niche market, thin liquidity |

**Important caveat**: These are industry-wide estimates from editorial sources. WhatHome's `transaction_pairs` table provides project-specific and region-specific actuals.

### 18.2 The quantum effect

| Bedroom | Typical Quantum (RCR) | Buyer Pool | Financing Ease |
|---------|---------------------|------------|---------------|
| 1BR | $700K-$1M | Singles, investors | Easy (LTV 75%) |
| 2BR | $1M-$1.5M | Couples, small families | Moderate |
| 3BR | $1.5M-$2.2M | Families, upgraders | Moderate |
| 4BR | $2.2M-$3M | Affluent families | Harder (TDSR constraint) |
| 5BR+ | $3M+ | Ultra-HNWIs | Cash-heavy |

**TDSR bites harder at higher quantums**: At 4BR+ prices, TDSR (60% income cap for all debt obligations) significantly narrows the buyer pool. This explains lower liquidity and appreciation for larger units.

### 18.3 Rental demand by bedroom type

| Bedroom | Tenant Profile | Typical Rent (RCR) | Vacancy Risk |
|---------|---------------|-------------------|-------------|
| 1BR | Young professionals, expats on packages | $2,500-$3,500 | Low |
| 2BR | Couple expats, young families | $3,500-$5,000 | Low |
| 3BR | Family expats, local families | $5,000-$7,500 | Medium |
| 4BR+ | Senior expats, embassy staff | $8,000-$15,000 | Higher |

---

## 19. GitHub Issues Tracker

All research findings have been translated into actionable GitHub issues:

### Parent Issue
- **[#54](https://github.com/tartinerlabs/whathome/issues/54)** — Bedroom-type performance analytics across decades
  - Type: Feature
  - Labels: enhancement
  - Status: Open
  - Scope: Market-wide + per-project bedroom analytics with decade comparison

### Sub-Issues

| # | Title | Type | Priority | Dependencies |
|---|-------|------|----------|-------------- |
| [#55](https://github.com/tartinerlabs/whathome/issues/55) | Infer bedroom type from transaction area data with GFA harmonisation handling | Task | P1 (foundation) | None — first step |
| [#56](https://github.com/tartinerlabs/whathome/issues/56) | Compute profit %, CAGR, and holding-period returns from matched buy-sell pairs | Task | P1 | #55 (needs bedroom on transactions) |
| [#57](https://github.com/tartinerlabs/whathome/issues/57) | Rental yield comparison by bedroom type per project | Task | P2 | #55 (needs bedroom mapping) |
| [#58](https://github.com/tartinerlabs/whathome/issues/58) | Market-wide bedroom performance analytics dashboard | Task | P2 | #55, #56 (needs data populated) |
| [#59](https://github.com/tartinerlabs/whathome/issues/59) | Per-project bedroom performance breakdown on detail pages | Task | P2 | #55, #56, #57 |

### Implementation order
```
#55 (bedroom inference) -> #56 (buy-sell pairs) -> #57 (rental yield)
                                                   -> #58 (dashboard)
                                                   -> #59 (detail pages)
```

**Current status**: #55, #56, and #57 are largely implemented (schema, queries, backfill workflows, basic UI). #58 and #59 need UI work and remaining analytics features.

---

## 20. Glossary of Terms

| Term | Definition |
|------|-----------|
| **ABSD** | Additional Buyer's Stamp Duty — extra tax on 2nd+ property and foreign purchases |
| **BSD** | Buyer's Stamp Duty — standard purchase tax on all property buys |
| **CAGR** | Compound Annual Growth Rate — annualised return metric |
| **CCR** | Core Central Region — prime districts (1, 2, 6, 9, 10, 11, Sentosa) |
| **DA** | Development Application — submission to URA to develop land |
| **GFA** | Gross Floor Area — total floor area of a building |
| **GFA Harmonisation** | June 2023 policy unifying area measurement across agencies |
| **LTV** | Loan-to-Value ratio — max loan as % of property value |
| **OCR** | Outside Central Region — suburban districts |
| **PSF** | Price per Square Foot — `transactedPrice / areaSqft` |
| **RCR** | Rest of Central Region — fringe central districts |
| **REALIS** | Real Estate Information System — URA's paid comprehensive database |
| **SSD** | Seller's Stamp Duty — tax on selling within holding period |
| **TDSR** | Total Debt Servicing Ratio — max 60% of income for all debt obligations |
| **TOP** | Temporary Occupation Permit — when residents can move in |
| **URA** | Urban Redevelopment Authority — Singapore's land-use planning body |

---

## 21. External References

| Resource | URL/Location | What it provides |
|----------|-------------|-----------------|
| URA Transaction API | `PMI_Resi_Transaction` via developer.tech.gov.sg | Free transaction data from ~2004 |
| URA Rental API | `PMI_Resi_Rental` via developer.tech.gov.sg | Rental contracts with `noOfBedRoom` |
| URA Price Index | data.gov.sg | Quarterly price index by region from Q1 2004 |
| FRED/BIS Property Index | FRED Economic Data | Aggregate Singapore property index from Q1 1998 |
| GFA Harmonisation Circular | URA Circular DC22-09 | Official policy on area measurement changes |
| SSD/ABSD Rates | IRAS | Official stamp duty rates and history |
| GitHub Issues | [#54](https://github.com/tartinerlabs/whathome/issues/54)-[#59](https://github.com/tartinerlabs/whathome/issues/59) | Actionable implementation tasks |
