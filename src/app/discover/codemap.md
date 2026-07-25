# src/app/discover/

## Responsibility

The discover route renders the anime browsing experience at `/discover`. It owns the initial server side interpretation of URL query parameters, chooses the first anime dataset to load, and passes that hydrated state into the interactive client component.

The route delegates presentation and browser interactions to `DiscoverClient`, while anime records and filter shapes come from `src/lib/anime-service.ts`.

## Design

The route is split into a server page and client UI:

- `src/app/discover/page.tsx` is the server component. It validates and normalizes incoming `searchParams`, applies defaults, loads the initial list with the anime service, and renders `DiscoverClient` with serializable props.
- `src/components/discover-client.tsx` is the client component. It owns browser state for search text, filters, pagination, loading indicators, filter panel visibility, and URL replacement.
- `src/components/anime-card.tsx` is a client card used by the grid. It links each item to `/anime/[id]` and records a selection analytics event.

Filters use `TopAnimeFilters` from the service layer. The server and client both preserve the rule that the `filter` field is valid for top anime requests but omitted from search requests.

## Flow

1. A request reaches `/discover` with optional query parameters such as `q`, `type`, `filter`, `rating`, `min_score`, `max_score`, `sfw`, `limit`, and `page`.
2. The server page reads the query values, clamps numeric values where needed, rejects unsupported enum values, and applies defaults of `limit: 25`, `page: 1`, and `sfw: true`.
3. If `q` is present, the page calls `searchAnime` with search compatible filters. If `q` is absent, it calls `getTopAnime` with the full filter set.
4. The resulting `Anime[]`, initial filters, and initial search term are passed into `DiscoverClient`.
5. The client stores that data in state and renders the search input, collapsible filters, result count, anime card grid, and pagination action.
6. When the initial URL has `page` greater than 1, the client hydrates earlier pages by fetching pages 2 through the requested page and appending them to the server loaded first page.
7. Search input changes update local state and call `searchAnime` through an 800 ms debounce. Empty search falls back to applying the current top anime filters.
8. Filter changes update local filter state, reset pagination to page 1, and mark that more pages may be available. The Apply action calls `getTopAnime`, updates the list, records an analytics event, and writes the current state into the URL with `router.replace`.
9. Load More requests the next page through `searchAnime` when searching or `getTopAnime` when browsing, appends results, updates `page` in the URL, and disables further loading when fewer results than the active limit are returned.
10. Reset and browse all paths restore the default filters, clear search text, reload top anime, and sync the URL back to the route path.

## Integration

The discover route depends on these local modules and services:

- `src/lib/anime-service.ts` supplies `TopAnimeFilters`, `getTopAnime`, and `searchAnime`.
- `getTopAnime` calls the Jikan top anime endpoint, builds query strings from supported filters, retries rate limited requests, transforms `JikanAnime` into the internal `Anime` type, and removes duplicate IDs.
- `searchAnime` calls the Jikan anime search endpoint with a required query and search compatible filters, then uses the same transformation and duplicate removal path.
- `src/lib/types.ts` provides the `Anime` model consumed by `DiscoverClient` and `AnimeCard`.
- `src/lib/firebase.ts` provides `logEvent` for discover filter application, discover search, and anime card selection events.
- `next/navigation` provides `usePathname` and `useRouter` for client side URL synchronization without scrolling.
- `src/components/anime-card.tsx` renders each result and links cards to the anime detail route at `/anime/[id]`.
