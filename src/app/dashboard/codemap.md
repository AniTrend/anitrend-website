# src/app/dashboard/

## Responsibility

`page.tsx` owns the dashboard route. It presents a hub for returning AniTrend users with three primary responsibilities:

- Promote opening the native AniTrend app from the hero and shortcut grid.
- Provide curated web shortcuts into `/discover` using fixed query strings for airing, upcoming, highly rated, and movie views.
- Show a small teaser grid of upcoming anime that links each item to `/anime/[id]` when recommendation data is available.

## Design

The route is an async server component that composes mostly presentational sections and delegates interactive native app handoff behavior to client components.

- `DashboardPage` builds the static discover shortcut list during render and fetches upcoming anime teasers with `fetchRecommendationTeasers`.
- `fetchRecommendationTeasers` narrows `getTopAnime({ filter: 'upcoming', limit: 9, sfw: true })` to six lightweight `Recommendation` objects containing id, title, optional image URL, and optional synopsis.
- The hero section renders a single `DashboardOpenListsButton` for the profile list handoff.
- The app shortcuts section renders `DashboardAppShortcuts`, which maps a fixed set of app targets to icon, label, description, intent, status, and analytics metadata.
- The discover shortcuts section renders cards with web links, not native app intents.
- The upcoming section renders image cards when teaser data exists and falls back to an empty state card when the API path returns no results.

## Flow

Page render flow:

1. `DashboardPage` prepares copy access for the dashboard namespace.
2. It constructs the four web discover shortcut entries with their query string destinations.
3. It calls `fetchRecommendationTeasers` on the server.
4. `fetchRecommendationTeasers` calls `getTopAnime`, trims the response, and returns an empty list on failure.
5. The returned JSX composes hero, native app shortcuts, web discover shortcuts, and upcoming teaser sections inside the dashboard main container.

Native app shortcut handoff flow:

1. `DashboardOpenListsButton` creates an `OpenInAppButton` with `intent={{ type: 'profile' }}` and `appIntentStatus.profile`.
2. `DashboardAppShortcuts` creates one `OpenInAppButton` per dashboard target: profile, discover, suggestions, social, and settings.
3. Each shortcut logs an `open_in_app` event with `source: 'dashboard'` and the selected target before attempting the handoff.
4. `OpenInAppButton` renders a button backed by an anchor whose href comes from `getAppIntentHref(intent)`.
5. On click, the component prevents normal navigation, calls `openAppIntent(intent)`, and waits for the browser visibility check.
6. `openAppIntent` assigns `window.location` to the app scheme URL and resolves true if the page becomes hidden within the timeout.
7. If the app does not appear to open, `OpenInAppButton` opens `AppHandoffFallbackDialog` so the user can choose Play Store, GitHub releases, or dismiss.

## Integration

- `src/components/dashboard-open-lists-button.tsx` provides the hero call to action for opening the user's native app profile lists.
- `src/components/dashboard-app-shortcuts.tsx` provides the dashboard native app shortcut grid and centralizes the dashboard target list.
- `src/components/app-handoff/open-in-app-button.tsx` provides the reusable client handoff button, fallback dialog state, and click interception.
- `src/lib/app-handoff.ts` performs the browser level app scheme navigation and visibility based success detection.
- `src/components/app-handoff/app-handoff-fallback-dialog.tsx` provides recovery links when app handoff fails.
- `src/config/links.ts` defines `AppIntent`, `AppIntentStatus`, `appIntentStatus`, `getAppIntentHref`, Play Store URL, and GitHub releases URL used by the handoff components.
- `src/lib/firebase.ts` supplies the safe client side `logEvent` helper used to record dashboard app open attempts.
- `src/lib/anime-service.ts` supplies `getTopAnime`, including retry, response normalization, and empty list fallback behavior for the upcoming teaser section.
- Shared UI primitives from `src/components/ui` provide cards, buttons, badges, and dialog structure while this route owns the section composition.
