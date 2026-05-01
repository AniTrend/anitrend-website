# Website Cleanup and App Handoff Design

Date: 2026-05-01
Scope: staged cleanup across deploy reliability, Genkit retirement, verified native-app deeplink expansion, and an AniTrend-v2-inspired Editorial Neon refresh.

## Goal

Turn the website from a marketing site with an experimental AI route into a cleaner editorial front door for the AniTrend ecosystem, while first unblocking Docker deploys and preserving disciplined app handoff behavior.

## Approved Rollout

### PR 1: Deploy Unblock

- Branch: `fix/copy-messages-into-docker-build`
- Goal: fix the deterministic Docker build failure only.
- Required change: copy `messages/` into the Docker build stage before `yarn build`.
- Must not include: Genkit removal, deeplink expansion, or UI refresh work.

### PR 2: Genkit Retirement

- Branch: `refactor/remove-genkit-recommendation-surface`
- Goal: remove the unsupported experimental AI recommendation feature end-to-end.
- Required change set:
  - remove `src/ai/**`
  - remove `src/app/recommend/**`
  - remove AI recommendation entry points from landing, dashboard, and header
  - remove stale Genkit dependencies, scripts, messages, and docs
- Must not include: broad redesign or speculative replacement recommendation logic.

### PR 3: App Handoff Expansion and Editorial Neon Refresh

- Branch: `feat/expand-app-handoff-and-editorial-refresh`
- Goal: broaden verified native app entry points and refresh high-traffic surfaces with a stronger AniTrend-v2-inspired visual identity.
- Required change set:
  - add centralized verified app intents for `discover`, `social`, `suggestions`, and `settings`
  - preserve existing guarded anime-detail handoff as pending verification
  - refresh header, landing, dashboard, and footer around stronger hierarchy and richer dark surfaces
  - replace removed AI marketing surface with app-value and discovery storytelling

## Product Direction

The approved positioning is:

- the website is an editorial front door into AniTrend
- web stays strong for discovery and browsing
- native handoff is expanded only where the app is clearly the better destination
- the retired AI experiment is removed entirely rather than downgraded into placeholder UX

Primary user paths after the work:

- Landing: understand AniTrend fast, see product identity, install or jump into ecosystem entry points
- Dashboard: become a launch hub for web exploration and verified app actions
- Discover: remain the strongest web-native browsing surface
- Anime detail: retain existing share and open-in-app behavior, with anime handoff still marked pending verification

## UX and IA Decisions

### Header

- Remove `Recommend` from desktop and mobile navigation.
- Keep navigation centered on `Dashboard`, `Discover`, anchored landing sections, and install/open-app actions.
- Increase visual weight and polish so the header feels like product chrome rather than a thin utility strip.

### Landing

- Remove the AI recommender section entirely.
- Keep the hero split layout, but make it feel more editorial and content-first.
- Reframe ecosystem proof and feature storytelling with stronger hierarchy instead of equally weighted promo cards.
- Use the removed AI slot for a bridge section that explains when to use AniTrend on web versus in the app.

### Dashboard

- Remove the `/recommend` CTA.
- Keep the dashboard as a launch point, not a second landing page.
- Promote a selected handoff cluster centered on:
  - `Profile / My Lists`
  - `Discover`
  - `Suggestions`
  - `Social`
  - `Settings`
- Continue showing editorial content such as upcoming anime so the page stays useful on web.

## App Handoff Contract

The website-side app contract remains centralized in `src/config/links.ts`.

Rules:

- all `app.anitrend://` URIs are generated centrally
- emitting controls continue to use plain anchors rather than `next/link`
- browser handoff orchestration remains centralized in `src/lib/app-handoff.ts`
- reusable handoff UI remains in `src/components/app-handoff/*`
- analytics and fallback behavior must be preserved when expanding destinations

Approved intent set after PR 3:

- verified: `profile`, `discover`, `social`, `suggestions`, `settings`
- pending verification: `anime-detail`

Placement rules:

- dashboard is the primary expansion surface for the new verified intents
- landing may use light-touch app entry points, but must not become a wall of deeplink buttons
- anime detail keeps the current guarded handoff path and pending-verification note

## Visual Direction

The selected direction is `A. Editorial Neon`.

This means:

- dark-theme-first presentation
- stronger headline hierarchy
- richer, denser surfaces with clearer contrast
- accent color used as a seam or emphasis, not sprayed everywhere
- poster and device imagery used to anchor sections
- less utility-demo feel, more premium editorial product framing

## Architecture Boundaries

### Shared Rules

- keep the current Next.js App Router structure server-first
- keep locale/message composition centralized in `src/i18n/request.ts`
- remove dead translation namespaces when features are retired
- prefer small, local edits over new abstraction layers unless repeated patterns clearly justify them

### PR 1 Boundaries

- Primary file: `Dockerfile`
- Validation: local `yarn build` plus Docker build using the repository Dockerfile

### PR 2 Boundaries

- Primary files:
  - `src/ai/**`
  - `src/app/recommend/**`
  - `src/components/sections/ai-recommender-section.tsx`
  - `src/app/page.tsx`
  - `src/app/dashboard/page.tsx`
  - `src/components/header.tsx`
  - `src/i18n/request.ts`
  - `messages/en/recommend.json`
  - `package.json`
  - stale Genkit docs
- Validation:
  - `yarn lint`
  - `yarn typecheck`
  - `yarn build`
  - grep for stale `genkit`, `recommendAnime`, and `/recommend` references

### PR 3 Boundaries

- Primary files:
  - `src/config/links.ts`
  - `src/lib/app-handoff.ts`
  - `src/components/app-handoff/*`
  - `src/components/dashboard-open-lists-button.tsx` or successor shortcut surface
  - `src/components/anime-analytics.tsx`
  - `src/components/header.tsx`
  - `src/components/footer.tsx`
  - `src/components/sections/*`
  - `src/app/page.tsx`
  - `src/app/dashboard/page.tsx`
  - `src/app/globals.css`
  - optionally `tailwind.config.ts`
- Validation:
  - `yarn lint`
  - `yarn typecheck`
  - `yarn build`
  - browser/manual verification of landing, dashboard, discover, and anime detail handoff flows

## Risk Controls

- keep PR 1 surgical so deploy confidence is restored quickly
- keep PR 2 focused on retirement, not replacement feature ideation
- keep PR 3 focused on high-traffic surfaces rather than turning into a site-wide rewrite
- do not assert new native-route verification beyond what the documented app contract already supports
- do not commit `.superpowers/`

## Acceptance Criteria

- Docker builds include the locale message catalog and no longer fail on missing `messages/en/*.json`
- Genkit runtime, dependencies, `/recommend` route, and related marketing surfaces are removed
- verified app intents are expanded centrally without scattering raw custom-scheme literals
- landing and dashboard reflect the approved Editorial Neon direction while preserving strong web discovery paths
- analytics and fallback behavior still work for app-opening surfaces
