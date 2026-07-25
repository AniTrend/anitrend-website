# src/

Application source root for the AniTrend Next.js 15 app. This tree contains the App Router entry points, shared React components, client hooks, runtime configuration helpers, i18n setup, and service layer code used by pages and API routes.

## Responsibility

- Owns all runtime application code for the website under the `@/` import alias.
- Defines App Router pages and route handlers in `src/app`, including the root marketing page, dashboard, discover browser, anime detail route, loading UI, root layout, and repository API route.
- Provides reusable UI and feature components in `src/components`, with shadcn style primitives under `src/components/ui` and product sections under `src/components/sections`.
- Centralizes app links and deep link intent configuration in `src/config/links.ts`.
- Provides browser hooks in `src/hooks` for responsive state and toast state.
- Configures next-intl request behavior in `src/i18n`, with a single supported locale currently declared in source.
- Provides service layer modules in `src/lib` for Jikan anime data, GitHub repository data, Firebase analytics, app handoff behavior, screenshot metadata, shared types, and class name merging.
- Source boundary: this codemap covers source files inside `src`. Static assets, message payload content, tests, documentation, and build output are outside this source map.

## Design

- App Router structure is centered on `src/app/layout.tsx`, which imports global CSS, installs Inter and Space Grotesk font variables, wraps children in `NextIntlClientProvider`, and renders the shared header, footer, analytics tracker, consent banner, and toaster.
- Page files are server components by default. They fetch translations through `next-intl/server`, call service functions directly, and pass serializable data into client components when interaction is needed.
- Client components are explicitly marked with `'use client'` and cover route state, analytics events, browser APIs, local storage, Firebase Analytics, and native app handoff behavior.
- UI primitives in `src/components/ui` are local shadcn style building blocks. Feature components compose these primitives instead of owning low level interaction details.
- Marketing sections are split into small server or client section components. `src/app/page.tsx` assembles them and provides external link values, repository data, feature descriptors, and screenshot data.
- Service modules normalize external API payloads into shared internal types from `src/lib/types.ts`. Pages and components consume internal `Anime`, `Repository`, and related shapes rather than raw remote responses.
- Error handling favors graceful fallback. Anime service calls return empty arrays or null on fetch failure, GitHub display data falls back at the page level to configured fallback repositories, and Firebase helpers no op when analytics cannot run.
- i18n is configured through `src/i18n/config.ts` and `src/i18n/request.ts`. Source currently declares `en` as the default and only supported locale, while components request named namespaces with server or client next-intl APIs.
- App deep links use typed intents. `AppIntent` and `appIntentStatus` in `src/config/links.ts` define valid native app targets, and app handoff components consume those values to build links and fallback dialogs.

## Flow

- Root request flow: Next.js enters `src/app/layout.tsx`, resolves locale and messages through next-intl, renders the shared shell, then streams the selected route inside the layout `main` element.
- Home flow: `src/app/page.tsx` loads marketing copy, builds feature cards, fetches pinned repositories through `getRepositoriesForDisplay`, falls back to `fallbackRepos` on failure, reads curated screenshots from `getShowcaseScreenshots`, then renders hero, integrations, features, showcase, app handoff, install, and community sections.
- Dashboard flow: `src/app/dashboard/page.tsx` fetches upcoming anime teasers with `getTopAnime`, builds translated shortcut metadata, and renders app handoff shortcuts plus discover links and anime teaser cards.
- Discover flow: `src/app/discover/page.tsx` validates URL search parameters into `TopAnimeFilters`, decides between `searchAnime` and `getTopAnime`, then hydrates `DiscoverClient` with initial anime, filters, and search term. The client component manages filters, debounced search, pagination, URL replacement, and analytics events.
- Anime detail flow: `src/app/anime/[id]/page.tsx` resolves the dynamic id, fetches anime and characters from Jikan through service helpers, calls `notFound()` when the anime is missing, then renders details, media, character lists, app open actions, share action, and anime view tracking.
- API flow: `src/app/api/repositories/route.ts` reads query parameters, calls `getRepositoriesForDisplay`, and returns JSON or a 500 JSON error response.
- Analytics flow: `src/components/analytics.tsx` logs page views on pathname changes. Feature components call `logEvent` for anime selection, discover filters, searches, sharing, consent changes, and app handoff attempts. Consent components store the user choice in local storage and call `setAnalyticsEnabled`.
- App handoff flow: feature buttons call `openAppIntent`, which assigns `window.location` to the deep link and observes `visibilitychange` to infer success. If the native app does not open, the fallback dialog presents Play Store and GitHub release links.
- Styling flow: `src/app/globals.css` defines Tailwind layers, color tokens, dark theme variables, radius tokens, body background, and shared border application. Component class names are merged through `cn` from `src/lib/utils.ts` when conditional classes are needed.

## Integration

- `src/app` integrates Next.js App Router conventions with the rest of the source tree through `@/components`, `@/lib`, `@/config`, and next-intl imports.
- `src/components` depends on `src/components/ui` for primitives, `src/lib` for data helpers and analytics helpers, `src/config/links.ts` for external and app link targets, and `src/hooks` for browser state where needed.
- `src/config/links.ts` supplies Play Store, GitHub release, GitHub org, Discord invite, Supabase banner, repository fallback, and typed app intent values to pages, sections, dashboard buttons, anime detail actions, and fallback dialogs.
- `src/hooks/use-mobile.tsx` supports responsive client rendering in `AnimePreview`. `src/hooks/use-toast.ts` backs toast state used by the toaster primitive.
- `src/i18n` integrates with next-intl server and client APIs. The root layout installs the provider, server components use `getTranslations`, and client components use `useTranslations`.
- `src/lib/anime-service.ts` integrates with the public Jikan API and is consumed by dashboard, discover, anime detail, anime preview, and AI oriented helper call sites.
- `src/lib/github-service.ts` integrates with the GitHub REST API and is consumed by the home integrations section and `/api/repositories` route. `getLanguageColor` is shared by repository display components.
- `src/lib/firebase.ts` dynamically imports Firebase client SDK modules and is consumed only from client components and hooks that run in the browser.
- `src/lib/app-handoff.ts` depends on browser document and window APIs and is called by `OpenInAppButton` to bridge web interactions to native app intents.
- `src/lib/screenshots-service.ts` supplies typed screenshot metadata to the home showcase. `src/lib/types.ts` defines external response and internal domain shapes shared across services and UI.
