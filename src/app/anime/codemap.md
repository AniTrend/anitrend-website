# src/app/anime/

## Responsibility

The anime route area owns public anime detail pages under `/anime`. Its active route is the dynamic detail page at `/anime/[id]`, where `id` is the MyAnimeList identifier used by the Jikan backed anime service.

This area is responsible for resolving an anime id from the route, loading the matching anime record and character list, rendering the detail experience, and returning the Next.js not found state when the service cannot resolve the anime.

## Design

The detail page is implemented as an async server component in `src/app/anime/[id]/page.tsx`. It awaits the route `params`, extracts `id`, then calls service functions before rendering. Data shaping is not performed in the route. The page consumes the internal `Anime` and `Character` models returned by `src/lib/anime-service.ts`.

The UI is composed from shared primitives and feature components. `Badge` displays genres, `Image` renders poster and character artwork, `TrackAnimeView`, `OpenInAppButton`, and `ShareButton` handle anime specific interactions and analytics, and `next-intl` translations provide display labels for the detail copy.

Conditional rendering keeps optional Jikan fields safe. Background, trailer, producers, studios, and character sections only render when the transformed service data contains usable values.

## Flow

1. A request to `/anime/[id]` is matched by the dynamic route segment in `src/app/anime/[id]/page.tsx`.
2. The page awaits translations for the `anime` namespace and awaits `params` to read the `id` segment.
3. `getAnimeById(id)` fetches `https://api.jikan.moe/v4/anime/${id}` through the shared retry helper and transforms the Jikan payload into the internal `Anime` shape.
4. `getAnimeCharacters(id)` fetches `https://api.jikan.moe/v4/anime/${id}/characters`, transforms each result into `Character`, and sorts main characters first.
5. If `getAnimeById` returns `null`, the route calls `notFound()` so Next.js renders the not found boundary.
6. When data exists, the page renders the poster, app actions, metadata, ratings, genres, synopsis, optional background, optional trailer, and up to twelve characters.

## Integration

The route integrates with `src/lib/anime-service.ts` for all external anime data access. That service centralizes Jikan fetches, retry behavior, response caching through Next.js `revalidate`, and transformation from Jikan API objects into app level types.

The dynamic detail route depends on the service contract rather than raw API fields. If `transformJikanAnime` or `transformJikanCharacter` changes, this route observes the updated normalized values through `anime` and `characters`.

The page also integrates with shared UI, analytics, image optimization, routing, and internationalization layers. Detail actions use `src/components/anime-analytics`, labels come from the `anime` translation namespace, and missing anime records are delegated to Next.js via `notFound()`.
