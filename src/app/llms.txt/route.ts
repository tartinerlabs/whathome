const content = `# WhatHome

> Singapore new condo launch research directory. AI-powered analysis on pricing, amenities, and investment potential.

## About

- Research directory for Singapore private residential property — not a marketplace
- Covers new launches, resale transactions, developer portfolios, and district-level data
- AI agents auto-populate data from government APIs (data.gov.sg, URA, OneMap) and YouTube property reviewers

## Key Pages

- /projects — Filterable listing of all condo projects
- /projects/{slug} — Project detail: pricing, unit mix, transactions, amenities, AI analysis
- /new-launches — Recently launched condos
- /developers — Developer directory with project portfolios
- /developers/{slug} — Individual developer profile
- /districts — Browse Singapore's 28 districts
- /districts/{number} — District detail with stats
- /compare — Side-by-side project comparison
- /analytics — Market analytics dashboard (price trends, volume, PSF by region)

## Data Coverage

- Private residential transactions (condos, apartments, ECs, strata landed)
- Price indices by region (CCR, RCR, OCR) and quarter
- Unit mix: 1BR through Penthouse with PSF and price ranges
- Nearby amenities: MRT stations, schools, malls, parks with walking distances
- Developer profiles and project portfolios
- YouTube reviewer insights from Singapore property channels
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
