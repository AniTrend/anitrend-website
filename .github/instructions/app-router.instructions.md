---
applyTo: 'src/app/**'
description: 'Next.js App Router conventions for AniTrend — server-first routes, metadata placement, searchParams handling, and API normalization.'
---

# App Router Conventions

## Server-First by Default

- All route segments (`page.tsx`, `layout.tsx`, `loading.tsx`) are **Server Components** unless explicitly opted in with `'use client'`.
- Move state, event handlers, and browser-only logic to dedicated Client Components placed in `src/components/`.
- Prefer extracting interactive logic into a dedicated Client Component in `src/components/` and keeping the route file as a Server Component that passes data down to it.
- Only add `'use client'` directly to a `page.tsx` when the **entire** interaction model of the route requires client state from the top level and there is no meaningful server-renderable shell to preserve (e.g., `src/app/recommend/page.tsx` where the full page is driven by real-time user input and transitions). This is the escape hatch, not the default.

## Metadata

- Export `metadata` or `generateMetadata` **only from Server Component files** (`page.tsx`, `layout.tsx`).
- Client Components cannot export metadata — move meta definitions up to the nearest server file.
- When `generateMetadata` fetches data, keep it async and reuse the route's existing server-side data source or cache strategy to avoid unnecessary duplicate waterfalls.
- When route-level social copy changes, keep Open Graph and Twitter fields intentionally aligned or document why the route should inherit root Twitter defaults instead.

## URL Param Sanitization

- Treat `searchParams` (and URL search params generally) as untrusted input — always validate and sanitize before use.
- Treat dynamic route params such as `params.id` as untrusted input too — validate shape before calling services or building metadata from them.
- Prefer explicit allow-lists over passthrough; strip unknown keys.
- Do not forward raw `searchParams` into server actions, external API calls, or rendered output without validation.

## API Normalization

- Transform external API responses (Jikan, GitHub, etc.) to internal types defined in `src/lib/types.ts` **before** returning data from a Server Component or API route.
- Keep fetch logic and response transformation in `src/lib/` (e.g., `anime-service.ts`, `github-service.ts`), not inline in route files.
- Use `next: { revalidate: N }` caching on external fetches where appropriate; prefer deliberate minutes-scale TTLs for public API reads instead of arbitrary small values.

## Route Composition Patterns

- Reuse the shared header and footer via the root layout; do not re-import root chrome in individual pages.
- Use nested layouts for shared chrome within route groups (e.g., `recommend/layout.tsx`).
- Dynamic routes (`[id]`) must validate params before service calls; use `notFound()` for missing resources and `redirect()` only when the route intentionally moves elsewhere.
- API routes live under `src/app/api/` and delegate data logic to `src/lib/` services — keep route handlers thin.

## Architecture Changes

- When adding or removing a route, changing a layout boundary, or adding a new API endpoint, update `context.instructions.md` under the **Routing Structure** and/or **API Routes** sections.
- Do not rename or restructure existing route segments without assessing all internal `Link` and `redirect` references.
