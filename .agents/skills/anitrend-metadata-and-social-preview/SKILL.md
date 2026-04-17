---
name: anitrend-metadata-and-social-preview
description: Use when implementing or reviewing Next.js App Router metadata, Open Graph, Twitter cards, and social preview consistency across AniTrend routes.
argument-hint: Which route or metadata concern needs validation or updates?
---

# AniTrend Metadata And Social Preview

## Overview

Use this skill when work affects route metadata, social preview cards, or discoverability in the AniTrend website.

## When to Use

- Adding a new App Router page, layout, or route segment that needs metadata ownership decisions
- Adding or updating `metadata` exports in App Router pages or layouts
- Auditing Open Graph or Twitter card consistency across routes
- Aligning route-level metadata with root defaults from the app layout
- Reviewing title and description quality for search and social sharing
- Verifying whether a route should define local metadata or inherit root metadata

## Do Not Use For

- Pure UI/styling changes that do not touch metadata output
- Analytics-only updates that do not affect previews or page metadata
- Backend/API behavior unrelated to route metadata generation

## Current Repo Anchors

- Root metadata baseline: `src/app/layout.tsx`
  - Exports `Metadata` with `metadataBase`, title template, `description`, `openGraph`, `twitter`, and `icons`
- Landing page metadata: `src/app/page.tsx`
  - Exports route-level metadata for title, description, and Open Graph title/description
- Discover route metadata + server data path: `src/app/discover/page.tsx`
  - Server page parsing `searchParams`, fetching data, and passing props to `DiscoverClient`
  - Exports route metadata for discoverability/social preview context
- Recommend route metadata: `src/app/recommend/layout.tsx`
  - Server layout exports route metadata for the recommender experience

Implementation details and practical checklists live in:

- `./references/app-router-metadata.md`

## Procedure

1. Identify the metadata owner.
   - Decide whether metadata belongs at root layout, route layout, or page scope.
2. Choose static export vs `generateMetadata` explicitly.
   - Use `export const metadata` when route metadata is deterministic and does not depend on runtime params, fetched entities, headers, or cookies.
   - Use `export async function generateMetadata` when metadata must be derived from route params/search params or server-fetched content at request time.
   - Prefer static metadata by default in this repo unless a route has a concrete runtime dependency.
3. Compare against root defaults.
   - Use `src/app/layout.tsx` as the canonical baseline for title template and shared social metadata fields.
4. Verify route override intent.
   - Ensure per-route title/description/Open Graph content reflects the route purpose and does not regress discoverability.
5. Apply interactive route server-wrapper rule.
   - On interactive routes, keep metadata in a server `page.tsx` or `layout.tsx` wrapper and delegate interactivity to a client component.
   - Keep the metadata owner stable in the server wrapper even when client UI logic evolves.
6. Apply Open Graph and Twitter guidance consistent with current implementation.
   - Prefer aligning Open Graph and Twitter title/description pairs when route-level social copy is explicitly customized.
   - Route-level Open Graph overrides without route-level Twitter overrides are acceptable only when the inherited root Twitter title and description still describe the route accurately and no route-specific Twitter copy is needed.
7. Confirm server boundaries.
   - Keep metadata exports in server files (page/layout) where route metadata is authored in this repo.
8. Update documentation anchors when behavior changes.
   - If metadata ownership or conventions shift, update `./references/app-router-metadata.md`.

## Expected Outputs

- Metadata decisions that are explicit, route-aware, and consistent with root defaults
- Social preview fields that remain coherent across landing, discover, and recommend surfaces
- Updated references when route metadata patterns or ownership change

## References

- [App Router metadata and social preview notes](./references/app-router-metadata.md)
