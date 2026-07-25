# src/app/anime/[id]/

## Responsibility

This dynamic route renders an individual anime detail page for the `/anime/[id]` path. It accepts the route segment as the Jikan anime identifier, fetches the matching anime record plus its character list, and composes the detail experience with poster art, metadata, synopsis, optional background, optional trailer, character cards, analytics tracking, sharing, and native app handoff actions.

## Design

`page.tsx` is an async server component. Its `params` prop is typed as `Promise<{ id: string }>` and is awaited before data loading, matching the route parameter handling pattern used by this Next.js app route. The page keeps external data access in `@/lib/anime-service` and only renders the normalized internal `Anime` and `Character` shapes from `@/lib/types`.

The service layer maps Jikan payloads into local UI fields through `transformJikanAnime` and `transformJikanCharacter`. The route then uses those normalized fields directly, such as `imageUrl`, `genres`, `score`, `rank`, `popularity`, `trailer.embedUrl`, `studios`, `producers`, and `aired`.

Client-only behavior is isolated behind imported components from `@/components/anime-analytics`. `TrackAnimeView` logs the detail view, `OpenInAppButton` delegates to the app handoff component, and `ShareButton` uses browser share or clipboard APIs. The server page can include these client components without moving the whole route to the client.

UI composition is split into a sidebar and main content column. The sidebar contains the poster, app handoff button, share button, and structured information. The main content contains the analytics tracker, heading, score and metadata row, genre badges, synopsis, optional background, optional trailer iframe, and an optional character grid.

## Flow

1. The route receives `params` for `/anime/[id]` and awaits it to extract `id` as a string.
2. `getTranslations('anime')` loads localized labels for the page.
3. `getAnimeById(id)` calls `https://api.jikan.moe/v4/anime/${id}` through `fetchWithRetry`.
4. `fetchWithRetry` applies Next.js revalidation with a default of 300 seconds, retries rate limited `429` responses with backoff, and returns `null` after failed network retries.
5. `getAnimeById` returns `null` when the response is missing, not OK, has no `data`, or throws. Otherwise it transforms the Jikan anime object into the local `Anime` shape.
6. `getAnimeCharacters(id)` calls `https://api.jikan.moe/v4/anime/${id}/characters` through the same retry helper, returns an empty array on failure, and sorts transformed characters so main roles appear first.
7. If the anime detail result is `null`, the route calls `notFound()` to render the route not found boundary.
8. If anime data exists, the page renders the detail layout and only renders optional sections when corresponding data is present.

## Integration

The route integrates with Jikan only through `@/lib/anime-service`. Detail fetch failures are converted to `notFound()`, while character fetch failures degrade to no character section because `getAnimeCharacters` returns an empty array.

Fallback rendering is handled at the field and section level. Missing score displays `details.notAvailable`, missing synopsis displays `details.synopsisFallback`, missing episode count displays `?`, missing season falls back to year or an empty string, and absent background, trailer, and characters omit those sections. Empty studios and producers arrays omit their information rows.

The image and metadata UI uses `next/image`, shadcn `Badge`, and lucide icons. App handoff uses `OpenInAppButton` with an `anime-detail` intent and `appIntentStatus['anime-detail']`, which produces an `app.anitrend://action/anime/{id}` deep link and opens a fallback dialog if the native app is not opened. Sharing uses `navigator.share` when available, then clipboard copy when available, and otherwise records an error state. Analytics uses the Firebase helper, which no-ops when analytics is unavailable or not configured.
