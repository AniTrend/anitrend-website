# src/components/

## Responsibility

`src/components` is the shared presentation and interaction layer for the app. It contains reusable UI primitives, global chrome, analytics helpers, marketing sections, anime display components, repository cards, app handoff controls, and dashboard action widgets.

Primary responsibilities:

- Provide the shared UI composition layer under `ui/`, with shadcn style primitives wrapping Radix components, Tailwind class composition, and `asChild` composition where links or custom elements need button styling.
- Render persistent site chrome through `AppHeader` and `AppFooter`.
- Attach page analytics and consent controls through `Analytics`, `AnalyticsConsentBanner`, `AnalyticsSettings`, and content specific analytics helpers.
- Present anime content through `AnimeCard`, `AnimePreview`, `DiscoverClient`, and detail page helper buttons from `anime-analytics.tsx`.
- Present repository information through `RepositoryShowcase` and the repository card layout embedded by `sections/IntegrationsSection`.
- Provide dashboard app entry points through `DashboardOpenListsButton` and `DashboardAppShortcuts`.

## Design

- Server components are used for static marketing and chrome where possible. Examples include `AppHeader`, `AppFooter`, and most files under `sections/`.
- Client components are isolated around browser state, events, storage, route mutation, analytics, and app handoff behavior. Examples include `Analytics`, `DiscoverClient`, `AnimeCard`, `AnimePreview`, `RepositoryShowcase`, `OpenInAppButton`, and dashboard shortcut controls.
- The shared UI composition layer lives in `ui/`. It exports low level primitives such as `Button`, `Card`, `Badge`, `Dialog`, `Sheet`, `Input`, `Select`, `Switch`, `Slider`, `Label`, `Collapsible`, and `Toaster`.
- `Button` and `Badge` use class variance definitions for variants and sizes. `Button` supports `asChild`, which lets routes and components render links with button styling without changing semantics.
- `Card` is split into structural subcomponents such as `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, and `CardDescription` so feature, repository, dashboard, and anime layouts can share consistent panel framing.
- Radix powered primitives such as `Dialog`, `Sheet`, `Select`, `Switch`, and `Collapsible` are wrapped with local styling and accessibility affordances.
- Marketing sections compose `SectionIntro`, `Card`, `Button`, images, icons, and data passed from `src/app/page.tsx`. The page owns data gathering and section ordering, while section components own presentation.
- App handoff is centralized in `app-handoff/open-in-app-button.tsx`. Callers pass an intent and status, while the button builds the app URL, attempts to open the app, and opens `AppHandoffFallbackDialog` when handoff fails.
- Analytics UI is split between passive page tracking, user consent, settings, and content events so each component logs only the events tied to its own interaction.

## Flow

- Root layout flow: `src/app/layout.tsx` wraps all pages with `AppHeader`, `Analytics`, `AppFooter`, `AnalyticsConsentBanner`, and `Toaster` inside the app provider tree.
- Header flow: `AppHeader` renders primary navigation, mobile navigation through `Sheet`, analytics settings access, and the GitHub organization link. `AppFooter` renders brand and external policy links.
- Analytics flow: `Analytics` watches pathname changes and logs a `page_view`. `AnalyticsConsentBanner` reads and writes consent in local storage, enables or disables Firebase analytics, and hides after choice. `AnalyticsSettings` lets users update or clear the same consent state.
- Anime discovery flow: `src/app/discover/page.tsx` parses search parameters, fetches initial anime through `getTopAnime` or `searchAnime`, then passes the result and filters into `DiscoverClient`. `DiscoverClient` manages search, filters, pagination, URL state, loading state, and renders `AnimeCard` items.
- Anime card flow: `AnimeCard` receives a normalized `Anime`, renders poster, score, rank, popularity, and status, links to `/anime/[id]`, and logs `anime_select` on click.
- Anime preview flow: `AnimePreview` fetches currently airing anime on the client, changes item count by mobile breakpoint, and reuses `AnimeCard` for a compact mobile row or desktop marquee.
- Anime detail helper flow: `TrackAnimeView` logs `anime_view` when detail data is mounted. `OpenInAppButton` wraps the generic app handoff button for anime detail intents. `ShareButton` uses Web Share when available, falls back to clipboard copy, and logs share method events.
- Repository showcase flow: `RepositoryShowcase` receives initial repositories, optionally toggles between organization and starred repositories by calling `/api/repositories`, and renders cards with language color, stars, forks, and topics. `IntegrationsSection` renders a server component version of repository cards using repositories supplied by the home page.
- Dashboard flow: `src/app/dashboard/page.tsx` renders page level dashboard panels, then delegates app deep link actions to `DashboardOpenListsButton` and `DashboardAppShortcuts`. These components use app handoff intents and log `open_in_app` attempts with dashboard source metadata.
- App handoff flow: `OpenInAppButton` prevents default link navigation, logs an optional caller callback, calls `openAppIntent`, and opens `AppHandoffFallbackDialog` with Play Store and GitHub release links if the native app cannot be opened.

## Integration

- Integrated by `src/app/layout.tsx` for global chrome, analytics, consent, and toasts.
- Integrated by `src/app/page.tsx` for the landing page section stack, repository data handoff, app download links, community links, and screenshot data.
- Integrated by `src/app/discover/page.tsx` for the discover client shell after server side parameter parsing and initial anime fetch.
- Integrated by `src/app/anime/[id]/page.tsx` for detail page analytics, open in app behavior, and sharing controls.
- Integrated by `src/app/dashboard/page.tsx` for dashboard profile handoff and app shortcut actions.
- Depends on `src/lib/anime-service.ts` for anime list and search data used by `DiscoverClient` and `AnimePreview`.
- Depends on `src/lib/github-service.ts` for repository display helpers and language color mapping used by repository cards.
- Depends on `src/lib/firebase.ts` for analytics initialization, event logging, and consent changes.
- Depends on `src/lib/app-handoff.ts` and `src/config/links.ts` for deep link generation, app intent status, store URLs, release URLs, and external marketing links.
- Depends on `src/hooks/use-mobile.tsx` for responsive item count decisions in `AnimePreview`.
- Uses Next.js `Link`, `Image`, routing hooks, and server component boundaries to connect reusable components to app routes without owning route definitions.
