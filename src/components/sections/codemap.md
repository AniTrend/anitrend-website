# src/components/sections/

## Responsibility

Landing page section components for the marketing home page. The folder owns the vertical composition blocks rendered by `src/app/page.tsx`: hero, integrations, feature highlights, app screenshots, app handoff CTAs, download CTAs, and community CTA.

These components focus on presentation and landing page orchestration. They do not fetch most data directly. The page consumer assembles data and link props, then passes them into the relevant sections.

## Design

- `SectionIntro` is the shared heading primitive for most sections. It renders optional badge text, a headline, and descriptive copy with left or center alignment.
- Section components use semantic `<section>` wrappers with stable fragment IDs such as `hero`, `integrations`, `features`, `app-showcase`, `open-in-app`, `get-the-app`, and `community`. These IDs support in-page CTA navigation.
- Server sections use `getTranslations('marketing')` from `next-intl/server` and accept data through props. `AppHandoffSection` is a client section because it handles native app launch attempts and analytics events.
- Presentation follows the site card language: rounded panels, dark gradient backgrounds, subtle borders, primary color accents, responsive Tailwind grids, shadcn `Button` and `Card` primitives, and icon components from `lucide-react` or `simple-icons`.
- The hero embeds the client `AnimePreview` component inside a framed preview panel. Most other sections are static server-rendered markup fed by page-level props.
- `IntegrationsSection` defines a local `RepoForDisplay` interface for the simplified repository shape it renders. `FeaturesSection` defines `FeatureItem` for page-provided icon, title, and description entries.

## Flow

1. `src/app/page.tsx` builds the home page feature list from marketing copy and lucide icons.
2. The page loads repository cards with `getRepositoriesForDisplay({ pinned: true, limit: 6 })`. On failure, it falls back to `fallbackRepos` from `src/config/links.ts`.
3. The page gets curated app screenshots from `getShowcaseScreenshots()` and passes them to `AppShowcaseSection`.
4. The page renders sections in this order: `HeroSection`, `IntegrationsSection`, `FeaturesSection`, `AppShowcaseSection`, `AppHandoffSection`, `GetTheAppSection`, and `CommunitySection`.
5. `HeroSection` receives the GitHub organization URL and links its primary CTA to `#get-the-app`. Its secondary CTA opens the GitHub organization externally.
6. `IntegrationsSection` maps repository props into external GitHub cards with language color, stars, forks, recent update date, and topic badges.
7. `FeaturesSection` treats the first two features as large lead cards and renders remaining features as supporting cards.
8. `AppShowcaseSection` treats the first screenshot as featured and renders up to four supporting screenshots beside it.
9. `AppHandoffSection` maps discover, suggestions, and social intents into `OpenInAppButton` controls. Each click logs `open_in_app` with source `home`, attempts a native app handoff, and falls back through the handoff dialog if the app does not open.
10. `GetTheAppSection` renders Play Store and GitHub release CTAs using links supplied by the page.
11. `CommunitySection` optionally paints a Supabase-hosted banner image behind the card and links to Discord through the configured invite URL.

## Integration

- Page consumer: `src/app/page.tsx` is the only in-repo consumer of these section exports. It provides links, repositories, features, and screenshots.
- Config: `src/config/links.ts` supplies Play Store, GitHub releases, GitHub organization, Discord invite, Supabase banner, fallback repository data, app intent types, app intent status, and native deep-link URL builders.
- Deep-link handoff: `AppHandoffSection` uses `OpenInAppButton`, `appIntentStatus`, and app intents for discover, suggestions, and social. `OpenInAppButton` delegates to `openAppIntent`, then shows `AppHandoffFallbackDialog` with Play Store and GitHub release fallbacks when opening the native app fails.
- Analytics: `AppHandoffSection` calls `logEvent('open_in_app', { source: 'home', target })` when a user attempts a native handoff.
- Data sources: repository cards originate from the AniTrend GitHub organization API through `getRepositoriesForDisplay`, with static fallback data from config. App screenshots are local curated assets returned by `getShowcaseScreenshots`. The hero anime preview loads top airing anime through `AnimePreview` and its anime service.
- UI primitives: sections compose shadcn `Button`, `Card`, `Dialog` through related components, `next/link`, `next/image`, and utility styling via Tailwind classes.
