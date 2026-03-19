---
paths:
  - "src/**/*.tsx"
---

# Frontend Rules

## Server Components by Default
- Only add `"use client"` when interactivity or browser APIs are needed
- Push `"use client"` boundaries as far down the component tree as possible
- Use Server Actions (`"use server"`) for mutations, not Route Handlers

## Next.js 16 Patterns
- All request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`
- Use `proxy.ts` instead of `middleware.ts` (Next.js 16 rename)
- Use `generateMetadata` for SEO on every public page
- Use `next/image` for images, `next/font` for fonts

## Styling
- Tailwind CSS v4 + shadcn/ui (Maia style, Base UI)
- Neobrutalist design direction — monochrome/neutral palette
- Support light + dark mode
- Use `cn()` utility from `@/lib/utils` for conditional classes

## Recharts
- Wrap charts in `ResponsiveContainer`
- Use project's color tokens for chart colors
- Charts are client components — isolate in dedicated `*-chart.tsx` files

## Component Patterns
- Colocate components with their routes when single-use
- Shared components go in `src/components/`
- Use TypeScript interfaces for all props (not `type` aliases for component props)
