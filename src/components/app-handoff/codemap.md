# src/components/app-handoff/

## Responsibility

Owns the reusable client-side handoff CTA that attempts to open a native AniTrend app route from the website. It centralizes the button behavior and the install fallback dialog for app intents defined in `src/config/links.ts`.

## Design

- `OpenInAppButton` is a client component wrapper around the shared `Button` primitive. Callers provide an `AppIntent`, its `AppIntentStatus`, CTA content, styling variants, and an optional attempt callback.
- `AppHandoffFallbackDialog` is a client dialog that receives the same intent context plus open state from `OpenInAppButton`. It keeps fallback UI separate from click and deep link logic.
- Deep link construction is delegated to `getAppIntentHref` in `src/config/links.ts`. Supported app intents map to `app.anitrend://action/profile`, `discover`, `suggestions`, `social`, `settings`, and `app.anitrend://action/anime/{animeId}` for anime detail pages.
- Intent verification status is supplied by `appIntentStatus`. The currently verified intents are profile, discover, suggestions, social, and settings. Anime detail is marked `pendingVerification`.

## Flow

1. A consumer renders `OpenInAppButton` with a concrete intent.
2. The rendered anchor receives `href={getAppIntentHref(intent)}` and `data-intent-status={intentStatus}` for semantic deep link metadata.
3. Click handling prevents normal navigation, runs the optional `onAttempt` callback, then calls `openAppIntent(intent)`.
4. `openAppIntent` returns `false` immediately outside the browser, otherwise it builds the deep link href, attaches `visibilitychange` and `pagehide` listeners, starts an 1800 ms timeout, and calls `window.location.assign(href)`.
5. If the page becomes hidden or emits `pagehide` before settlement, or is hidden when the timeout fires, the promise resolves `true` because the native app likely opened.
6. If assignment throws or the timeout completes without hidden visibility, the promise resolves `false`.
7. `OpenInAppButton` opens `AppHandoffFallbackDialog` when `openAppIntent` resolves `false`.
8. The fallback dialog offers Play Store and GitHub releases links, plus a dismiss action. For `pendingVerification` intents it also shows a pending verification note.

## Integration

- `src/config/links.ts` provides `AppIntent`, `AppIntentStatus`, `appIntentStatus`, `getAppIntentHref`, `playStoreUrl`, and `githubReleasesUrl`.
- `src/lib/app-handoff.ts` performs the browser handoff attempt and reports whether the page visibility changed after deep link navigation.
- `/dashboard` renders `DashboardOpenListsButton` for the profile intent and `DashboardAppShortcuts` for profile, discover, suggestions, social, and settings shortcuts. Both paths log an `open_in_app` attempt with dashboard source metadata before handoff.
- `/` renders `AppHandoffSection`, which exposes home page CTAs for discover, suggestions, and social intents and logs attempts with home source metadata.
- `/anime/[id]` renders the anime analytics `OpenInAppButton` wrapper, which passes the anime detail intent with the current anime id and uses the pending verification status.
