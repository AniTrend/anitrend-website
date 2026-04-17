# Next.js App Router Guidance

## Default Posture

- In the App Router, pages and layouts are Server Components by default.
- Keep a route server-first when it needs metadata, direct data fetching, SEO, or secure-only logic.
- If a route needs interactivity, split out a child Client Component instead of promoting the full route.
- In AniTrend, `src/app/discover/page.tsx` parses `searchParams`, fetches data, and passes initial props into `DiscoverClient`.

## Route Design

- `layout.tsx`: app shell, fonts, global metadata, and shared chrome.
- `page.tsx`: route metadata, route orchestration, and initial data fetch.
- Route-specific client component: forms, filters, transitions, navigation hooks, and browser APIs.
- `loading.tsx`: use when the route has visible async waiting.
- `api/` routes and server actions: server-only entry points, not a substitute for component state structure.

## Metadata

- Prefer `export const metadata` for static metadata.
- Use `generateMetadata` when metadata depends on params or fetched data.
- Keep titles and descriptions aligned across page metadata, Open Graph, and Twitter where possible.
- If a page is client-heavy, keep a thin server `page.tsx` wrapper so metadata remains server-side.

## Data and Rendering

- Fetch in server components or service modules under `src/lib/`.
- Validate and normalize search params before calling services.
- Pass typed initial data into client components instead of re-fetching immediately on mount.
- Use `next/image` only with configured remote domains or local assets.
- Avoid moving server-only secrets or integrations into client code.

## Checklist

- Does this route still need `'use client'`? If yes, can the client logic move down a level?
- Does the page export `metadata` or `generateMetadata` if it is user-facing?
- Are service calls and search param parsing typed and sanitized?
- Is the initial render useful before client JS hydrates?

## Current Repo Examples

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/discover/page.tsx`
