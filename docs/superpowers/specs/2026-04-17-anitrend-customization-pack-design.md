# AniTrend Customization Pack Design

Date: 2026-04-17
Scope: Project-scoped agent customizations for AniTrend website work, with cross-project awareness of AniTrend Android app handoff and deeplink contracts.

## Goal

Create a small, coherent customization pack that helps agents work on the AniTrend website as both:

- a marketing and discovery surface for the app ecosystem
- a frictionless handoff surface into the Android app where equivalent in-app destinations exist

The design must keep day-to-day UI and metadata tasks lightweight, while still making cross-project deeplink and app-parity decisions discoverable when relevant.

## Problem Statement

The website already contains app handoff behavior through URIs such as `app.anitrend://action/profile` and `app.anitrend://action/anime/:id`, but the reasoning and contract behind those links is not encoded as agent guidance. At the same time, the project also needs focused guidance for:

- Next.js App Router boundaries and metadata placement
- shadcn and Tailwind extension patterns
- route-level guardrails in `src/app/**`
- centralized deeplink generation and maintenance

If all of this is bundled into one broad customization, context usage gets noisy. If it is split too aggressively, the website-to-app model becomes fragmented and agents miss the bigger product intent.

## Recommended Architecture

Use a hybrid customization pack with five coordinated deliverables.

### 1. Skill: `anitrend-ecosystem-awareness`

Purpose:

- teach that the website is part of the AniTrend product surface, not a detached landing page
- encode website-to-app handoff rules
- document the known deeplink contract the website currently depends on
- establish when website work should trigger cross-checking against `anitrend-v2`

This skill is the entry point for work involving:

- “Open in App” behavior
- deeplinks and app URIs
- dashboard shortcuts and CTA routing
- frictionless journeys between web and app
- app-parity decisions for existing or new destinations

Its `SKILL.md` should stay concise and operational, ideally around 150-250 lines. Curated route-contract details should live in two explicit reference files:

- `./references/website-surfaces.md` for website touchpoints and app-handoff surfaces in this repo
- `./references/app-route-contract.md` for the curated, verified app destinations the website depends on

### 2. Skill: `anitrend-metadata-and-social-preview`

Purpose:

- route metadata discipline in App Router
- `metadata` vs `generateMetadata`
- Open Graph and Twitter alignment
- social preview consistency across user-facing pages

This skill should remain narrowly scoped so metadata work does not load the broader ecosystem or UI-composition guidance unless needed.

### 3. Skill: `anitrend-shadcn-extension-patterns`

Purpose:

- extending `src/components/ui/**` without duplicating primitives
- using `cva`, `cn`, and `asChild` correctly
- deciding when to add a variant, wrapper, or token instead of copying class strings
- keeping Tailwind usage aligned with existing design tokens and composition patterns

This is the focused UI counterpart to the existing coherence guidance.

### 4. Instruction: `src/app/**`

Purpose:

- enforce server-first route boundaries
- keep metadata on the server boundary
- encourage typed search-parameter parsing and typed route orchestration
- minimize unnecessary promotion of routes to client components
- reinforce route-structure consistency with existing App Router patterns

This instruction should be short and always-on for route work.

### 5. Instruction: Deeplink-bearing website files

Target surfaces should use an explicit `applyTo` that covers:

- `src/config/**`
- `src/components/anime-analytics.tsx`
- `src/app/dashboard/**`
- any future component that emits `app.anitrend://` URIs directly

Purpose:

- prevent raw app URI strings from spreading
- prefer centralized deeplink generation
- remind the agent that app handoff changes may require loading `anitrend-ecosystem-awareness`

This instruction should stay even shorter than the `src/app/**` instruction, ideally under 10 operational bullets and with no embedded route table.

## Design Boundaries

### Skills vs Instructions

Skills carry reusable workflow, decision logic, and references.

Instructions carry lightweight, always-on guardrails for hot paths where mistakes are expensive.

The ecosystem skill carries the “why” and the cross-project decision logic. The focused skills and instructions carry the “how” for narrow surfaces.

### Narrow Responsibilities

- `anitrend-ecosystem-awareness`: should this website behavior acknowledge the app, and what verified app destination should it use?
- `anitrend-metadata-and-social-preview`: how should metadata and social previews be structured for this route?
- `anitrend-shadcn-extension-patterns`: how should this UI extension be built without drifting from repo patterns?
- `src/app/**` instruction: keep route architecture disciplined by default
- deeplink instruction: keep app handoff generation centralized and contract-aware by default

No focused skill should duplicate the full deeplink or ecosystem model. They can reference it, but should not restate it.

## Cross-Project Contract Model

The ecosystem skill should model website actions in three buckets:

1. Web-native only
2. App-equivalent destination exists
3. App-first handoff is preferred or should at least be considered

The website currently demonstrates app handoff through files including:

- `src/config/links.ts`
- `src/components/anime-analytics.tsx`
- `src/app/dashboard/page.tsx`

The Android app evidence base for the first version of this pack should be anchored to the `develop` branch of `AniTrend/anitrend-v2`, primarily:

- `android/core/src/main/res/values/deep_link.xml`
- `android/deeplink/src/main/AndroidManifest.xml`
- `android/deeplink/src/main/kotlin/co/anitrend/android/deeplink/component/route/AppRoutes.kt`
- `android/deeplink/src/main/kotlin/co/anitrend/android/deeplink/component/route/WebRoutes.kt`
- `android/deeplink/src/main/kotlin/co/anitrend/android/deeplink/koin/Modules.kt`

The curated known contract should include only destinations the website actively uses or is likely to use next, based on current evidence from `anitrend-v2`. Initial entries should cover at least:

- profile
- discover
- social
- suggestions
- settings
- anime detail routes corresponding to website surfaces such as `/anime/[id]`

The rule is intentionally narrow:

- if the website already depends on an app destination, document it in the contract reference
- if a new website feature wants to introduce app handoff and the destination is not in the known contract list, treat that as a verification point rather than an invention point

Verification behavior should be explicit:

- do not invent a new deeplink format in website code
- flag the destination as unverified in the task output or spec
- check the app evidence base before adding the website-side generator or CTA

This keeps the customization pack useful without turning it into a stale mirror of the Android app.

## Discovery and Loading Model

The ecosystem skill should have the strongest discovery language for terms like:

- open in app
- deeplink
- app handoff
- app parity
- frictionless experience
- dashboard shortcut
- CTA into app

The focused skills should have strong narrow triggers:

- metadata, social card, open graph, twitter card
- shadcn, cva, asChild, variant, primitive extension

Description guidance:

- keep skill descriptions under roughly 400 characters
- focus descriptions on trigger conditions, not workflow summaries

The instructions should be terse enough to remain cheap in context.

Expected loading behavior:

- cross-project CTA or deeplink task: ecosystem skill + deeplink instruction
- route metadata task: metadata skill + `src/app/**` instruction
- component extension task: shadcn skill, optionally coherence skill, but not the full ecosystem skill unless the component adds, changes, or removes app handoff behavior

Resolution rule:

- if a component task introduces, changes, or removes an app-facing CTA or app URI, load the ecosystem skill
- otherwise keep component-only work on the focused UI skills

## Validation Criteria

Validation happens at two levels.

### Structural validation

Each customization must satisfy:

- valid frontmatter
- correct project-scoped placement
- short, discovery-friendly descriptions
- correct relative links to references
- no duplicated cross-project contract text across focused files

Project-scoped placement should be committed to `.agents/skills/...` for skills and `.github/instructions/...` for instructions, to stay aligned with the repo's existing customization layout.

### Behavioral validation

The pack succeeds when an agent can distinguish among:

- a metadata task
- a UI extension task
- a deeplink-contract task

without loading every customization in the pack.

If a narrow task requires broad context from several files just to begin, the pack is too heavy.

## Example Scenarios

The spec should be considered correct if the right customization would clearly load for prompts like:

1. Add a new “Open in App” CTA for a route that already exists in the Android app.
2. Refactor a page to improve metadata without widening the client boundary.
3. Add a new visual variant to an existing shadcn primitive instead of duplicating the component.
4. Add a dashboard shortcut that should behave differently on web and in app.

## File Layout

Keep the customization pack project-scoped and team-visible.

Recommended locations:

- skills under `.agents/skills/...`
- instructions under `.github/instructions/...`

Given the repo already has meaningful project-scoped agent material under `.agents/skills`, extend that same structure rather than introducing a second project skill location.

## Concrete Deliverables

This design should produce:

1. one skill folder for `anitrend-ecosystem-awareness`
2. one skill folder for `anitrend-metadata-and-social-preview`
3. one skill folder for `anitrend-shadcn-extension-patterns`
4. one instruction file targeting `src/app/**`
5. one instruction file targeting deeplink-related website files

Each skill should use progressive loading, with a short operational `SKILL.md` and deeper material in `./references/*.md`.

Reference file expectations for the first implementation plan:

- `anitrend-ecosystem-awareness/references/website-surfaces.md`
  - website touchpoints for app handoff
  - current repo files that generate deeplinks or app CTAs
- `anitrend-ecosystem-awareness/references/app-route-contract.md`
  - curated verified routes from `anitrend-v2`
  - source file anchors for verification
- `anitrend-metadata-and-social-preview/references/app-router-metadata.md`
  - metadata placement rules, OG and Twitter checklist, repo anchors
- `anitrend-shadcn-extension-patterns/references/primitive-extension.md`
  - `cva`, `cn`, `asChild`, token reuse, and when to add a variant vs wrapper

## Non-Goals

- mirroring the entire `anitrend-v2` route system inside the website repo
- creating one monolithic skill that covers all website work
- embedding implementation plans for specific code changes into the customization pack
- replacing repo context documents with cross-project reference dumps

## Maintenance Rule

Only document cross-project links that the website actively depends on or is likely to rely on immediately. When a website feature starts depending on a new app destination, update the curated contract reference with that same change.

This keeps the pack intentionally partial, current, and operational.

## Final Recommendation

Adopt the hybrid model.

It gives agents one place to learn the product-level truth that the website and app form a linked user journey, while still keeping metadata, UI extension, and route architecture tasks small and specific in practice.
