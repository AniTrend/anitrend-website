# Copy I18n and App Handoff Design

Date: 2026-04-22
Scope: Replace the current typed copy registry with a real i18n framework, remove user-facing hard-coded strings, and centralize app handoff with intent-aware fallback behavior.

## Goal

Create a localization-ready copy system for the AniTrend website without changing public routes yet, while also fixing app-opening CTAs so they use a shared, typed handoff layer with in-page fallback prompts when custom-scheme opens do not succeed.

## Problem Statement

The current copy system is a single English object tree exported from `src/copy/index.ts` and consumed directly throughout the app. It is organized well by domain, but it is not an i18n framework and does not provide locale resolution, message loading, or a clean path to browser-locale detection.

At the same time, app handoff is implemented as raw custom-scheme anchors built from `src/config/links.ts` and emitted directly from UI surfaces such as the anime detail CTA and dashboard CTA. This creates three problems:

- app-opening behavior is duplicated at the surface level instead of owned by a shared handoff layer
- the website cannot distinguish between verified and pending app intents in a first-class way
- custom-scheme opens currently have no in-page fallback when mobile browsers stay on the current page

The refactor must also enforce a stricter content rule: no user-facing hard-coded strings should remain in the project after the migration.

## Decisions

### 1. Localization Framework

Use `next-intl` as the copy framework.

Reasoning:

- it fits the existing Next.js App Router stack
- it supports server and client boundaries cleanly
- it allows the project to keep current URLs unchanged for now
- it provides a clear path to browser-locale detection later without redoing message organization

Alternatives considered:

- `react-i18next`: workable, but adds more setup and less App Router-native structure than `next-intl`
- custom copy abstraction: smaller immediate refactor, but still not a real i18n system and does not satisfy the long-term requirement

### 2. Locale Scope

Ship `en` only in this refactor.

Design intent:

- build the framework and message-catalog structure now
- keep URL structure unchanged
- prepare for browser-locale detection later without adding locale-prefixed routes yet

### 3. Copy Migration Rule

All user-facing strings must move into the localization layer.

This includes:

- buttons
- labels
- helper text
- dialogs
- empty states
- loading states
- metadata strings
- fallback prompt copy

Allowed exceptions:

- analytics event names
- route segments and URI schemas
- CSS classes and DOM ids
- API field names and protocol tokens

### 4. App Handoff Behavior

Replace direct custom-scheme link usage with a shared app-handoff layer.

The handoff layer owns:

- typed app intents
- URI construction
- intent verification status
- app-open attempt behavior
- fallback prompt copy selection
- shared analytics hooks for app-opening surfaces

The initial supported intents should cover the currently emitting website surfaces:

- `profile`
- `anime-detail`

Intent metadata should include contract confidence:

- `verified`
- `pendingVerification`

This keeps `profile` and `anime-detail` on the same implementation path while preserving the current contract distinction documented for the anime route.

### 5. Fallback UX

If the custom scheme does not appear to open the app, keep the user on the current page and show an in-page fallback prompt.

Fallback rules:

- use one shared fallback component
- vary title, description, and action copy by intent
- do not auto-redirect to Play Store or GitHub releases
- keep dismiss and alternate actions explicit

Open-attempt behavior:

1. user activates the CTA
2. the handoff layer logs the open attempt
3. the handoff layer attempts the custom-scheme navigation
4. the client checks whether the document lost visibility within a short timeout window
5. if the document stays visible, show the fallback prompt

This is a best-effort browser heuristic rather than a guaranteed app-open confirmation. The design should treat it as a pragmatic detection strategy, not a hard guarantee.

## Recommended Architecture

### Copy Layer

Retain the current domain grouping, but move it into locale message catalogs.

Current source structure already groups copy by domain:

- `src/copy/en/common.ts`
- `src/copy/en/dashboard.ts`
- `src/copy/en/discover.ts`
- `src/copy/en/recommend.ts`
- `src/copy/en/anime.ts`
- `src/copy/en/marketing.ts`
- `src/copy/en/metadata.ts`

Recommended target shape:

- `src/i18n/request.ts` or equivalent `next-intl` request config
- `messages/en/common.json`
- `messages/en/dashboard.json`
- `messages/en/discover.json`
- `messages/en/recommend.json`
- `messages/en/anime.json`
- `messages/en/marketing.json`
- `messages/en/metadata.json`
- a small composition layer that merges those namespaces for `next-intl`

Consumption model:

- server routes use server-safe translation helpers where metadata or server-rendered content needs messages
- client components use `useTranslations()` scoped by namespace
- code stops importing a global `copy` object from `@/copy`

Key rule:

- the project should not replace the current object tree with another giant in-memory singleton; the new system should make locale resolution and message access explicit at the call site

### App Handoff Layer

Introduce a centralized module for app-intent definitions and client-side open orchestration.

Recommended responsibilities:

- define allowed intents and their payload requirements
- map intents to custom-scheme URIs
- record contract confidence per intent
- expose typed helpers for surfaces to request app handoff
- select localized fallback content based on the intent

Recommended split:

- a server-safe contract/config module for intent definitions
- a client handoff helper or hook for app-open orchestration
- a shared UI component for the fallback prompt

Surface migration targets:

- `src/components/anime-analytics.tsx`
- `src/components/dashboard-open-lists-button.tsx`

These surfaces should stop using raw `href={deepLinks.*}` as their main handoff logic and instead delegate to the shared layer.

## No Hard-Coded Strings Enforcement

This refactor should treat removal of user-facing inline strings as part of the acceptance criteria, not a nice-to-have cleanup.

Enforcement strategy:

- migrate all current `src/copy/en/*` content into message catalogs
- sweep `src/app/**` and `src/components/**` for user-facing string literals
- move any remaining user-facing strings into messages during the refactor
- add a lightweight verification step, likely grep- or lint-based, to catch obvious new inline UI strings during review

Because some strings are programmatic rather than user-facing, the verification step should be conservative. It should help flag likely misses, not block valid code tokens such as event names or route definitions.

## Error Handling

### i18n

- unsupported or missing locale resolution falls back to `en`
- development should surface missing-message issues early
- production should avoid rendering raw translation keys to users

### App Handoff

- unknown intents should not generate arbitrary custom-scheme URIs
- pending-verification intents remain usable, but only through the guarded shared handoff path
- fallback prompt presentation is preferred over redirecting users away from their current page

## Testing and Validation

### Copy and i18n

- verify all current copy domains are represented in the new message catalog structure
- verify route metadata still reads from centralized localized messages
- verify no remaining user-facing hard-coded strings are left in affected surfaces

### App Handoff

- verify the dashboard profile CTA uses the shared handoff layer
- verify the anime detail CTA uses the shared handoff layer
- verify app-open attempt still logs `open_in_app`
- verify fallback prompt appears when the page remains visible after the custom-scheme attempt
- verify fallback prompt copy changes by intent

### Repository Validation

- `yarn lint`
- `yarn typecheck`
- `yarn build`
- relevant Playwright coverage for affected routes and mobile-sized handoff behavior where practical

## Migration Plan Shape

Implement in this order:

1. add `next-intl` and request/message wiring for a single `en` locale
2. migrate existing `src/copy/en/*` domains into message catalogs
3. replace `@/copy` consumption with translation helpers/hooks
4. introduce the typed app-intent contract and shared client handoff layer
5. migrate current app-opening surfaces to the shared layer
6. sweep remaining user-facing hard-coded strings
7. run validation and update relevant project references

This order keeps copy migration and app-handoff migration independent enough to reason about, while still allowing the no-inline-strings rule to be enforced before completion.

## Risks

- metadata and server/client translation boundaries may introduce churn if the migration replaces copy access too mechanically
- string sweeping can become noisy if verification rules are too broad
- browser heuristics for app-open detection are inherently imperfect, so fallback timing needs to be conservative and user-friendly
- the `anime-detail` route remains pending verification in the app contract and should not be upgraded to fully verified behavior without re-checking native support

## Acceptance Criteria

- the website uses a real i18n framework rather than the current `copy` singleton
- only `en` ships now, but the structure is locale-ready
- current URLs remain unchanged
- user-facing hard-coded strings are removed from the project surfaces touched by the migration, with a repo sweep to catch remaining misses
- app-opening surfaces use a shared typed handoff layer instead of raw custom-scheme anchors as the primary logic
- failed app-open attempts show an in-page fallback prompt instead of redirecting away
- fallback prompt copy is action-specific through one shared component

## Evidence

- `src/copy/index.ts`
- `src/copy/en/index.ts`
- `src/copy/en/common.ts`
- `src/copy/en/metadata.ts`
- `src/config/links.ts`
- `src/components/anime-analytics.tsx`
- `src/components/dashboard-open-lists-button.tsx`
- `.agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md`
- `.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md`
