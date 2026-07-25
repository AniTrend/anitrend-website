# Repository Atlas: anitrend-website

## Project Responsibility

AniTrend website is the public landing and app handoff surface for the AniTrend anime tracking ecosystem. It combines a Next.js App Router site, localized marketing pages, anime discovery and detail routes backed by Jikan, GitHub repository showcase data, Firebase Analytics, and native app deep link CTAs.

The source tree is organized around route entry points in `src/app`, reusable UI and feature components in `src/components`, service modules in `src/lib`, static link configuration in `src/config`, browser hooks in `src/hooks`, and request scoped i18n setup in `src/i18n`.

## System Entry Points

- `src/app/layout.tsx`: Root App Router shell. Loads global styles and fonts, resolves next-intl locale and messages, installs `NextIntlClientProvider`, and renders shared chrome, analytics, consent, and toast surfaces.
- `src/app/page.tsx`: Home marketing page. Assembles hero, integrations, features, app showcase, app handoff, install, and community sections.
- `src/app/dashboard/page.tsx`: Dashboard hub page. Presents native app shortcuts, web discover shortcuts, and upcoming anime teasers.
- `src/app/discover/page.tsx`: Server entry for anime browsing. Parses URL filters, loads initial anime data, and hydrates `DiscoverClient`.
- `src/app/anime/[id]/page.tsx`: Dynamic anime detail page. Loads anime and characters by MyAnimeList id and composes detail, analytics, share, and app handoff controls.
- `src/app/api/repositories/route.ts`: JSON API for repository display data consumed by client repository showcase interactions.
- `package.json`: Yarn project manifest with development, build, lint, typecheck, copy check, Husky, and Playwright e2e scripts. The manifest declares Next.js `16.2.11`, React `19`, TypeScript `6`, Tailwind CSS `3`, next-intl, Firebase, Radix UI, and shadcn related dependencies.
- `next.config.ts`: Next.js configuration wrapped by the next-intl plugin from `src/i18n/request.ts`. Enables standalone output, remote image hosts, and TypeScript build error ignoring.
- `tailwind.config.ts`: Tailwind theme, content globs, dark mode, app font variables, semantic color tokens, radius tokens, and animation extensions.
- `components.json`: shadcn/ui configuration for TypeScript, React Server Components, Tailwind CSS variables, neutral base color, import aliases, and lucide icons.
- `eslint.config.js`: ESLint flat config entry for project linting.
- `commitlint.config.js`: Conventional commit linting configuration.
- `postcss.config.mjs`: PostCSS and Tailwind processing configuration.
- `tsconfig.json`: TypeScript compiler and path alias configuration.

## Root Asset Map

- `.github/`: GitHub Actions, issue templates, pull request template, release drafter configuration, and branch linting support.
- `.husky/`: Git hook entry points for local quality gates.
- `.yarn/` and `.yarnrc.yml`: Yarn Berry project configuration and release artifacts.
- `compose.dev.yaml` and `compose.prod.yaml`: Docker Compose definitions for local and production deployment contexts.
- `messages/`: next-intl message payloads. This atlas references the i18n loading contract but does not map translation content.
- `public/`: Static browser assets such as images, icons, and PWA files.
- `scripts/check-no-inline-copy.mjs`: Repository copy quality script invoked by `yarn check:copy`.
- `tests/`: Playwright e2e tests. Tests are excluded from codemap state by the codemap workflow.

## Repository Directory Map

| Directory                     | Responsibility Summary                                                                                                                                              | Detailed Map                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `src/`                        | Runtime source root for App Router routes, shared components, services, i18n, hooks, and static configuration under the `@/` alias.                                 | [View Map](src/codemap.md)                        |
| `src/app/`                    | Next.js App Router surface for pages, root layout, loading UI, server actions, and API route handlers.                                                              | [View Map](src/app/codemap.md)                    |
| `src/app/anime/`              | Anime route area for public `/anime` pages, currently centered on dynamic anime detail routing.                                                                     | [View Map](src/app/anime/codemap.md)              |
| `src/app/anime/[id]/`         | Dynamic anime detail route that loads Jikan anime and character data by id and renders detail UI, analytics, share, and app handoff actions.                        | [View Map](src/app/anime/[id]/codemap.md)         |
| `src/app/api/`                | API namespace for server side JSON route handlers that expose provider-backed data to frontend consumers.                                                           | [View Map](src/app/api/codemap.md)                |
| `src/app/api/repositories/`   | `GET /api/repositories` route boundary for repository card data backed by GitHub service helpers.                                                                   | [View Map](src/app/api/repositories/codemap.md)   |
| `src/app/dashboard/`          | Dashboard hub route with native app shortcuts, web discover shortcuts, and upcoming anime teasers.                                                                  | [View Map](src/app/dashboard/codemap.md)          |
| `src/app/discover/`           | Anime browsing route that parses query parameters, loads initial anime results, and hydrates the discover client shell.                                             | [View Map](src/app/discover/codemap.md)           |
| `src/components/`             | Shared presentation and interaction layer for UI primitives, chrome, analytics helpers, anime cards, repository cards, dashboard widgets, and app handoff controls. | [View Map](src/components/codemap.md)             |
| `src/components/app-handoff/` | Client app handoff CTA and fallback dialog for typed native app intents from `src/config/links.ts`.                                                                 | [View Map](src/components/app-handoff/codemap.md) |
| `src/components/consent/`     | Site-level analytics consent prompt that persists visitor consent and toggles Firebase Analytics collection.                                                        | [View Map](src/components/consent/codemap.md)     |
| `src/components/sections/`    | Landing page section components for hero, integrations, features, showcase, app handoff, install, and community CTAs.                                               | [View Map](src/components/sections/codemap.md)    |
| `src/components/settings/`    | Client analytics settings dialog for changing or clearing local analytics consent.                                                                                  | [View Map](src/components/settings/codemap.md)    |
| `src/components/ui/`          | shadcn style UI primitive layer built on Radix UI, native elements, Tailwind tokens, variant helpers, and `cn`.                                                     | [View Map](src/components/ui/codemap.md)          |
| `src/config/`                 | Static configuration source for external URLs, native app deep links, intent status, social links, banner media, and fallback repositories.                         | [View Map](src/config/codemap.md)                 |
| `src/hooks/`                  | Client React hook utilities for shared toast state and mobile viewport detection.                                                                                   | [View Map](src/hooks/codemap.md)                  |
| `src/i18n/`                   | Locale contract and next-intl request configuration for request scoped message loading.                                                                             | [View Map](src/i18n/codemap.md)                   |
| `src/lib/`                    | Service and shared utility layer for Jikan anime data, GitHub repository data, screenshots, Firebase Analytics, app handoff, types, and class merging.              | [View Map](src/lib/codemap.md)                    |

## Cross-Cutting Data and Control Flow

1. A browser request enters a route in `src/app` and is wrapped by `src/app/layout.tsx`.
2. The layout resolves locale and messages through `src/i18n/request.ts`, then provides them to server and client translation consumers.
3. Server route components call service helpers from `src/lib` to load repository, anime, or screenshot data and pass normalized values into components.
4. Presentation flows through `src/components`, which composes feature components and `src/components/ui` primitives.
5. Client interactions stay inside client components and hooks. Discover filtering, app handoff, analytics events, local storage consent, share actions, and responsive mobile checks run in browser-only modules.
6. External integrations stay behind local boundaries: Jikan and GitHub calls live in `src/lib`, Firebase SDK loading lives in `src/lib/firebase.ts`, and native app deep links are built from typed intents in `src/config/links.ts`.

## Integration Points

- Jikan API: consumed through `src/lib/anime-service.ts` by dashboard, discover, anime detail, anime preview, and recommendation oriented helpers.
- GitHub REST API: consumed through `src/lib/github-service.ts` by the home page and `/api/repositories` route.
- Firebase Analytics: dynamically initialized in `src/lib/firebase.ts` and controlled by analytics, consent, settings, anime, discover, dashboard, and app handoff client components.
- next-intl: configured in `next.config.ts` and `src/i18n/request.ts`, then consumed by routes, sections, chrome, dialogs, and client controls.
- Native app handoff: typed in `src/config/links.ts`, attempted by `src/lib/app-handoff.ts`, and presented through `src/components/app-handoff` plus dashboard, home, and anime detail consumers.
- shadcn/ui and Radix UI: configured by `components.json` and implemented in `src/components/ui` for accessible primitives reused across the app.
