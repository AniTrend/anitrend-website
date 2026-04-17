# App Router Metadata And Social Preview Notes

This reference captures the currently implemented metadata ownership and social preview patterns in the AniTrend website.

## Provenance

- Repository: `anitrend-website`
- Evidence source: direct inspection of App Router route files in this repository
- Scope: this is a repository-local reference and should describe the current checked-out implementation, not a fixed historical snapshot

## Canonical Metadata Baseline

Primary baseline is defined in `src/app/layout.tsx`:

- `metadataBase`: `https://anitrend.com`
- `title` object:
  - `default`: `AniTrend`
  - `template`: `%s | AniTrend`
- Root `description`: `The ultimate companion for tracking anime and manga.`
- Root `openGraph`:
  - `title`, `description`, `url`, `siteName`, `type`
- Root `twitter`:
  - `card: summary_large_image`
  - `title`, `description`
- Root `icons`:
  - `icon` and `apple`

This baseline is the default metadata contract for routes that do not override fields.

## Route-Level Metadata Anchors

### Landing Route

File: `src/app/page.tsx`

- Exports typed route metadata (`Metadata`) with:
  - `title`
  - `description`
  - `openGraph.title`
  - `openGraph.description`
- Purpose: tailored social/search copy for the landing surface.

### Discover Route

File: `src/app/discover/page.tsx`

- Server page with `searchParams` parsing and data-fetching path (`getTopAnime` / `searchAnime`)
- Exports route metadata object for discover context:
  - `title`
  - `description`
  - `openGraph.title`
  - `openGraph.description`
- Passes resolved data and filters into `DiscoverClient`.

### Recommend Route

File: `src/app/recommend/layout.tsx`

- Server layout exporting typed route metadata (`Metadata`)
- Provides recommender-specific:
  - `title`
  - `description`
  - `openGraph.title`
  - `openGraph.description`

## Route-Level Open Graph And Twitter Alignment Rules

- Prefer pairwise alignment when route-level social copy is explicitly customized: `openGraph.title` with `twitter.title`, and `openGraph.description` with `twitter.description`.
- Route-level Open Graph overrides without route-level Twitter overrides are acceptable only when inherited root Twitter fields still describe the route accurately and no route-specific Twitter copy is needed.
- Keep global fields (`metadataBase`, site-wide icons, `twitter.card`) at root unless a route has an explicit, documented exception.

## Interactive Route Server-Wrapper Rule

- For interactive routes, keep metadata in a server `page.tsx` or `layout.tsx` wrapper.
- Delegate interactive UI/state to a client component imported by that server wrapper.
- Treat the server wrapper as the stable metadata owner even when client behavior changes.

## Practical Review Checklist

- Confirm each route's title/description matches user intent for that surface.
- Keep Open Graph title/description aligned with route copy unless intentional divergence is required.
- Prefer matching Twitter title/description when route-level social copy is customized; if Twitter is inherited from root, verify inherited values remain accurate.
- Avoid duplicating global concerns (site-wide icons/base URL) at route level unless necessary.
- Preserve root title templating expectations when changing route titles.
- Keep metadata authored in App Router server page/layout files, including interactive routes that delegate UI/state to client components.

## Maintenance Rules

- Update this file when metadata ownership changes between root layout, route layout, or route pages.
- Update when new routes introduce metadata patterns that differ from these anchors.
- Keep this document factual: note what is implemented now, not speculative future behavior.
