# src/lib/

## Responsibility

`src/lib` is the service and shared utility layer for the site. It keeps external API access, data normalization, analytics bootstrapping, app handoff behavior, shared data contracts, and class name composition outside of route and component files.

- Anime and Jikan: `anime-service.ts` fetches top anime, individual anime, characters, search results, and recommendations from Jikan. It converts Jikan response shapes into internal `Anime`, `Character`, and `AnimeRecommendation` models and returns safe empty results or `null` for recoverable failures.
- GitHub repositories: `github-service.ts` fetches AniTrend organization repositories and starred repositories from GitHub, filters private or archived items, transforms API responses into internal `Repository` values, scores pinned repository candidates, and exposes display focused helpers.
- Screenshots: `screenshots-service.ts` owns the static screenshot catalog for app showcase content. It provides all screenshots, category filters, curated showcase selections, randomized subsets, and context based selections.
- Firebase analytics: `firebase.ts` initializes Firebase Analytics only in the browser, validates public configuration values before loading SDK modules, caches the analytics instance, logs custom events, and toggles analytics collection for consent settings.
- App handoff utilities: `app-handoff.ts` converts app intents from `src/config/links.ts` into navigable deep links, attempts to open the native app from the browser, and resolves whether the page became hidden before a timeout.
- Shared types: `types.ts` defines internal domain contracts and external API response contracts for anime, Jikan characters, Jikan recommendations, GitHub repositories, and normalized repository data.
- Utility helpers: `utils.ts` exposes `cn`, the shared Tailwind class merging helper used by UI primitives and section components.

## Design

- Service modules expose small async functions that routes and components can call directly. Network helpers hide fetch details, response checks, transformation, duplicate removal, and caching hints.
- External API contracts are separated from internal contracts. Jikan and GitHub response interfaces live beside normalized application interfaces in `types.ts`, while service modules perform the conversion at the boundary.
- Fetching code is defensive. Jikan calls use retry with incremental backoff for rate limits and network failures. GitHub calls use Next server fetch revalidation hints and explicit fallback behavior for starred repository lookups.
- Display helpers are intentionally derived from normalized data. Repository display data removes fields not required by presentation, screenshot helpers return typed subsets, and language colors centralize repository visual metadata.
- Analytics is client safe by design. Firebase SDK modules are dynamically imported only after browser and configuration checks, so server rendering can call analytics helpers without crashing.
- App handoff is browser guarded. It returns `false` on the server, listens for `visibilitychange`, navigates with `window.location.assign`, and cleans up listeners and timers after success, timeout, or synchronous navigation failure.
- `cn` composes `clsx` and `tailwind-merge` so components can pass conditional classes while resolving Tailwind conflicts in one shared place.

## Flow

Anime data flow:

1. A route or component calls an exported anime helper such as `getTopAnime`, `getAnimeById`, `getAnimeCharacters`, `searchAnime`, or `getAnimeRecommendations`.
2. Filter objects are converted to query strings through `URLSearchParams` where needed.
3. `fetchWithRetry` performs the Jikan request with a default revalidation window, retries transient failures, and backs off on HTTP 429.
4. Raw Jikan response data is transformed into internal models through transformer functions.
5. Duplicate anime are removed by ID where list responses can contain repeats.
6. Callers receive normalized arrays, `null` for missing anime details, or thrown errors only from the AI optimized helpers when upstream data cannot be fetched.

GitHub repository data flow:

1. A caller requests repositories through `getRepositoriesForDisplay`, `getPinnedRepositories`, `getAniTrendRepositories`, `getStarredRepositories`, or a focused helper such as `getPopularRepositories`.
2. Query options become GitHub API query parameters for organization repositories or starred repositories.
3. Responses are checked for errors. Rate limit responses log reset information, and starred repository failures fall back to organization repositories.
4. Raw GitHub repositories are filtered, transformed into `Repository`, and deduplicated by ID.
5. Pinned repository requests calculate an importance score using stars, forks, language, repository name, topics, recent activity, and homepage presence, then return the highest scoring repositories without exposing the score.
6. Display requests map repositories to a compact shape for page and API consumers.

Screenshot data flow:

1. The static screenshot array holds the source path, alt text, image hint, and category for each app screenshot.
2. Selector helpers return the whole catalog, category matches, a curated showcase mix, a randomized subset, or a context specific set.
3. The returned typed array is passed to presentation components for rendering.

Firebase analytics control flow:

1. `logEvent` or `setAnalyticsEnabled` calls `initFirebaseAnalytics`.
2. Initialization exits early outside the browser, when an instance already exists, or when public Firebase values are missing or placeholder values.
3. Firebase app and analytics SDK modules are dynamically imported and initialized once.
4. Collection defaults to enabled unless `NEXT_PUBLIC_ENABLE_ANALYTICS` is set to `false`.
5. Event logging and collection toggles catch SDK errors and warn instead of interrupting UI behavior.

App handoff control flow:

1. A component calls `openAppIntent` with an `AppIntent` and optional timeout.
2. The helper exits with `false` when document or window is unavailable.
3. The intent is converted to a deep link with `getAppIntentHref`.
4. The helper starts a timer, listens for `visibilitychange`, and attempts browser navigation.
5. If the document becomes hidden before timeout, the promise resolves `true`. Otherwise it resolves based on the final visibility state or `false` after synchronous failure.

Shared helper flow:

- `types.ts` supplies compile time contracts to services and UI consumers.
- `cn` receives arbitrary class inputs, applies conditional class resolution with `clsx`, then merges conflicting Tailwind classes with `tailwind-merge`.

## Integration

- Routes integrate with service functions directly:
  - `src/app/page.tsx` consumes `getRepositoriesForDisplay` for repository showcase data and `getShowcaseScreenshots` for app screenshot content.
  - `src/app/dashboard/page.tsx` consumes `getTopAnime` for dashboard anime data.
  - `src/app/discover/page.tsx` consumes anime service helpers for discover page data.
  - `src/app/anime/[id]/page.tsx` consumes `getAnimeById` and `getAnimeCharacters` for detail page rendering.
  - `src/app/api/repositories/route.ts` exposes repository display data through an API route backed by `getRepositoriesForDisplay`.
- Components integrate with service and utility modules:
  - Anime components use `Anime` types, `getTopAnime`, `searchAnime`, and `logEvent` for typed display, client side discovery actions, and analytics tracking.
  - Repository showcase and integrations components use `getLanguageColor` to keep language visual metadata consistent.
  - App showcase sections consume `AppScreenshot` data returned from screenshot selectors.
  - App handoff UI calls `openAppIntent` to attempt native app navigation.
  - Analytics wrappers, consent banner, settings controls, dashboard shortcuts, and app handoff sections call Firebase helpers to initialize analytics, log events, and apply consent state.
  - shadcn style UI primitives and section components use `cn` for class name composition.
- Configuration integration is limited and explicit. App handoff imports `getAppIntentHref` and `AppIntent` from `src/config/links.ts`, while Firebase reads public `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_ENABLE_ANALYTICS` environment variables at runtime.
