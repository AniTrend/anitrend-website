# AniTrend Customization Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three project-scoped skills and two project-scoped instruction files that encode AniTrend ecosystem awareness, metadata discipline, shadcn extension patterns, and deeplink guardrails for the website.

**Architecture:** Keep cross-project product reasoning in one ecosystem skill, then isolate route metadata and UI primitive extension into separate focused skills. Add two short instructions for always-on route and deeplink guardrails, then document the new customization pack in the repo context so future agents can discover it without reading every file.

**Tech Stack:** Markdown skill files, Markdown instruction files, VS Code agent customizations, Next.js App Router repo context, `rg`, `git`, and shell-based structural validation.

---

## File Structure

### Create

- `.agents/skills/anitrend-ecosystem-awareness/SKILL.md`
  - Entry skill for website-to-app handoff, deeplink reasoning, and app parity decisions.
- `.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md`
  - Reference for current website files that emit or centralize app-facing actions.
- `.agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md`
  - Curated route contract table for the subset of `anitrend-v2` destinations the website relies on.
- `.agents/skills/anitrend-metadata-and-social-preview/SKILL.md`
  - Focused skill for App Router metadata and social preview work.
- `.agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md`
  - Reference for metadata placement, route wrappers, and consistency checks.
- `.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md`
  - Focused skill for extending shadcn primitives without duplicating components.
- `.agents/skills/anitrend-shadcn-extension-patterns/references/primitive-extension.md`
  - Reference for `cva`, `cn`, `asChild`, and token-first extension decisions.
- `.github/instructions/app-router.instructions.md`
  - Always-on route guardrails for `src/app/**`.
- `.github/instructions/deeplink-contract.instructions.md`
  - Always-on guardrails for app URI generation and contract-sensitive handoff behavior.

### Modify

- `.github/instructions/context.instructions.md`
  - Add a short “Agent Customizations” section that documents the new project-scoped skills and instructions.

### Existing Anchors To Reference While Implementing

- `src/config/links.ts`
- `src/components/anime-analytics.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/discover/page.tsx`
- `src/app/recommend/layout.tsx`
- `src/components/ui/button.tsx`
- `src/lib/utils.ts`
- `src/app/globals.css`
- `tailwind.config.ts`

---

### Task 1: Create the Ecosystem Awareness Skill

**Files:**

- Create: `.agents/skills/anitrend-ecosystem-awareness/SKILL.md`
- Create: `.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md`
- Create: `.agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md`
- Test: shell checks only

- [ ] **Step 1: Verify the ecosystem-awareness files do not already exist**

Run:

```bash
for f in \
  .agents/skills/anitrend-ecosystem-awareness/SKILL.md \
  .agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md \
  .agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md; do
  test -f "$f"
  echo "$f:$?"
done
```

Expected:

```text
.agents/skills/anitrend-ecosystem-awareness/SKILL.md:1
.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md:1
.agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md:1
```

- [ ] **Step 2: Create `.agents/skills/anitrend-ecosystem-awareness/SKILL.md`**

```md
---
name: anitrend-ecosystem-awareness
description: Use when website work involves deeplinks, Open in App CTAs, dashboard shortcuts, or deciding whether a web flow should hand users into the AniTrend Android app.
argument-hint: What website-to-app journey needs to stay coherent?
---

# AniTrend Ecosystem Awareness

## Overview

Treat the AniTrend website as part of the product journey, not a detached marketing page. Use this skill when a website change affects how users move between the website and the Android app.

## When to Use

- Adding or changing "Open in App" CTAs
- Editing dashboard shortcuts or other app-facing actions
- Centralizing or modifying `app.anitrend://` URIs
- Deciding whether a website flow should stay web-only or acknowledge an in-app destination

Do not use this skill for pure metadata, layout, or styling work that does not affect app handoff.

## Decision Table

| If the task...                        | Treat it as...     |
| ------------------------------------- | ------------------ |
| only changes web copy or layout       | web-only           |
| points to an existing app destination | app-equivalent     |
| introduces or expands app handoff     | contract-sensitive |

## Procedure

1. Locate the website surface that emits or should emit the app-facing action.
2. Check `src/config/links.ts` before adding or changing any app URI.
3. Verify the destination in [website surfaces](./references/website-surfaces.md) and [app route contract](./references/app-route-contract.md).
4. If the destination is not verified, stop short of inventing a new URI shape and mark it as needing verification.
5. Preserve analytics and fallback behavior when changing an existing app CTA.

## Repo Anchors

- `src/config/links.ts`
- `src/components/anime-analytics.tsx`
- `src/app/dashboard/page.tsx`

## References

- [Website surfaces](./references/website-surfaces.md)
- [App route contract](./references/app-route-contract.md)

## Common Mistakes

- Adding raw `app.anitrend://` strings in leaf components
- Expanding an unverified app destination to new surfaces
- Treating the website as marketing-only when the task is clearly a handoff flow
- Removing analytics when refactoring an app CTA
```

- [ ] **Step 3: Create `.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md`**

```md
# Website Surfaces

## Current Website Handoff Surfaces

| Surface                    | Files                                                               | Current behavior                                               | App handoff notes                                              |
| -------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| Anime detail CTA           | `src/app/anime/[id]/page.tsx`, `src/components/anime-analytics.tsx` | Renders "Open in App" and share controls on anime detail pages | Emits `app.anitrend://action/anime/:id` and logs `open_in_app` |
| Dashboard profile shortcut | `src/app/dashboard/page.tsx`                                        | Renders "Open My Lists in App" in the hero action row          | Emits `app.anitrend://action/profile`                          |
| Central URI definitions    | `src/config/links.ts`                                               | Exports `deepLinks.profile` and `deepLinks.anime(id)`          | New app URIs belong here before leaf components use them       |

## Rules

- Add new app URI generators in `src/config/links.ts`.
- Leaf components should import generators instead of hardcoding app URIs.
- If a new surface introduces app handoff, add it to this table in the same change.
- Preserve existing analytics behavior when refactoring an app-facing CTA.
```

- [ ] **Step 4: Create `.agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md`**

```md
# App Route Contract

This reference is intentionally partial. Only add destinations that the website already depends on or is about to depend on.

| Destination  | Website need                                  | Current URI                         | Status                | App evidence                                                                                                                                                                               |
| ------------ | --------------------------------------------- | ----------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Profile      | Dashboard shortcut and future profile handoff | `app.anitrend://action/profile`     | Verified              | `AppRoutes.kt` `ProfileRoute : Route("profile")`                                                                                                                                           |
| Discover     | Future dashboard or CTA handoff               | `app.anitrend://action/discover`    | Verified              | `AppRoutes.kt` `DiscoverRoute : Route("discover")`                                                                                                                                         |
| Social       | Future CTA handoff                            | `app.anitrend://action/social`      | Verified              | `AppRoutes.kt` `SocialRoute : Route("social")`                                                                                                                                             |
| Suggestions  | Future CTA handoff                            | `app.anitrend://action/suggestions` | Verified              | `AppRoutes.kt` `SuggestionsRoute : Route("suggestions")`                                                                                                                                   |
| Settings     | Future CTA handoff                            | `app.anitrend://action/settings`    | Verified              | `AppRoutes.kt` `SettingsRoute : Route("settings")`                                                                                                                                         |
| Anime detail | Anime detail "Open in App" CTA                | `app.anitrend://action/anime/:id`   | Requires verification | Website emits this URI today in `src/components/anime-analytics.tsx`; reviewed app evidence confirms `anime/:id` handling in `WebRoutes.kt` but not an app-scheme `action/anime/:id` route |

## Verification Sources

- `android/core/src/main/res/values/deep_link.xml`
- `android/deeplink/src/main/AndroidManifest.xml`
- `android/deeplink/src/main/kotlin/co/anitrend/android/deeplink/component/route/AppRoutes.kt`
- `android/deeplink/src/main/kotlin/co/anitrend/android/deeplink/component/route/WebRoutes.kt`
- `android/deeplink/src/main/kotlin/co/anitrend/android/deeplink/koin/Modules.kt`

## Rules

- Do not invent new app URI shapes in website code.
- If a destination is marked `Requires verification`, do not expand it to new surfaces until the contract is confirmed.
- When the website starts depending on a new verified app destination, add it here in the same change.
```

- [ ] **Step 5: Run structural validation for the ecosystem skill**

Run:

```bash
rg -n "^name: anitrend-ecosystem-awareness$|^description:|website-surfaces.md|app-route-contract.md" .agents/skills/anitrend-ecosystem-awareness/SKILL.md
rg -n "ProfileRoute|DiscoverRoute|Requires verification|src/components/anime-analytics.tsx" .agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md .agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md
```

Expected:

```text
.agents/skills/anitrend-ecosystem-awareness/SKILL.md:2:name: anitrend-ecosystem-awareness
.agents/skills/anitrend-ecosystem-awareness/SKILL.md:3:description: Use when website work involves deeplinks, Open in App CTAs, dashboard shortcuts, or deciding whether a web flow should hand users into the AniTrend Android app.
.agents/skills/anitrend-ecosystem-awareness/SKILL.md:47:- [Website surfaces](./references/website-surfaces.md)
.agents/skills/anitrend-ecosystem-awareness/SKILL.md:48:- [App route contract](./references/app-route-contract.md)
.agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md:7:| Profile | Dashboard shortcut and future profile handoff | `app.anitrend://action/profile` | Verified | `AppRoutes.kt` `ProfileRoute : Route("profile")` |
.agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md:8:| Discover | Future dashboard or CTA handoff | `app.anitrend://action/discover` | Verified | `AppRoutes.kt` `DiscoverRoute : Route("discover")` |
.agents/skills/anitrend-ecosystem-awareness/references/app-route-contract.md:12:| Anime detail | Anime detail "Open in App" CTA | `app.anitrend://action/anime/:id` | Requires verification | Website emits this URI today in `src/components/anime-analytics.tsx`; reviewed app evidence confirms `anime/:id` handling in `WebRoutes.kt` but not an app-scheme `action/anime/:id` route |
.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md:6:| Anime detail CTA | `src/app/anime/[id]/page.tsx`, `src/components/anime-analytics.tsx` | Renders "Open in App" and share controls on anime detail pages | Emits `app.anitrend://action/anime/:id` and logs `open_in_app` |
```

- [ ] **Step 6: Commit the ecosystem skill**

```bash
git add .agents/skills/anitrend-ecosystem-awareness
git commit -m "docs: add ecosystem awareness skill"
```

---

### Task 2: Create the Metadata and Social Preview Skill

**Files:**

- Create: `.agents/skills/anitrend-metadata-and-social-preview/SKILL.md`
- Create: `.agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md`
- Test: shell checks only

- [ ] **Step 1: Verify the metadata skill files do not already exist**

Run:

```bash
for f in \
  .agents/skills/anitrend-metadata-and-social-preview/SKILL.md \
  .agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md; do
  test -f "$f"
  echo "$f:$?"
done
```

Expected:

```text
.agents/skills/anitrend-metadata-and-social-preview/SKILL.md:1
.agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md:1
```

- [ ] **Step 2: Create `.agents/skills/anitrend-metadata-and-social-preview/SKILL.md`**

```md
---
name: anitrend-metadata-and-social-preview
description: Use when adding or updating route metadata, Open Graph tags, Twitter cards, or App Router wrappers for user-facing AniTrend pages.
argument-hint: What route or metadata surface needs updating?
---

# AniTrend Metadata and Social Preview

## Overview

Use this skill to keep page metadata, Open Graph, and Twitter previews consistent across AniTrend's App Router pages. Prefer server-side route wrappers for metadata even when page bodies are interactive.

## When to Use

- Adding or editing `metadata` or `generateMetadata`
- Updating Open Graph or Twitter text and images
- Wrapping client-heavy pages with a server route or layout for metadata
- Reviewing page titles and descriptions on user-facing routes

Do not use this skill for purely visual component work that does not touch page metadata.

## Procedure

1. Keep the route wrapper server-first.
2. Choose static `metadata` or `generateMetadata` based on whether params or fetched data are required.
3. Align title, description, Open Graph, and Twitter fields.
4. Reuse existing route patterns before introducing a new layout wrapper.
5. Verify the route remains accurate and consistent with repo conventions.

## Repo Anchors

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/discover/page.tsx`
- `src/app/recommend/layout.tsx`

## References

- [App Router metadata guide](./references/app-router-metadata.md)

## Common Mistakes

- Pushing metadata into a client component
- Updating `title` without aligning Open Graph and Twitter fields
- Making the whole route client-side because the body needs state
- Forgetting that page-level metadata should stay readable from the server wrapper
```

- [ ] **Step 3: Create `.agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md`**

```md
# App Router Metadata Guide

## Route Rules

- `layout.tsx` owns shared chrome, global fonts, and global metadata.
- `page.tsx` owns page-level metadata and initial route orchestration.
- Keep client logic in child components when metadata is required.

## Static vs Dynamic

- Use `export const metadata` when titles and descriptions are known ahead of time.
- Use `generateMetadata` when params or fetched data are required.

## Alignment Checklist

- Title matches page intent.
- Description is reused consistently across metadata, Open Graph, and Twitter where appropriate.
- Any image or URL assumptions are compatible with `next.config.ts` and site metadata.

## Repo Examples

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/discover/page.tsx`
- `src/app/recommend/layout.tsx`

## Review Questions

- Is this route still server-first?
- Does the metadata live in the wrapper instead of the interactive child?
- Are Open Graph and Twitter fields aligned with the page title and description?
```

- [ ] **Step 4: Run structural validation for the metadata skill**

Run:

```bash
rg -n "^name: anitrend-metadata-and-social-preview$|^description:|app-router-metadata.md" .agents/skills/anitrend-metadata-and-social-preview/SKILL.md
rg -n "layout.tsx|generateMetadata|Open Graph|Twitter" .agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md
```

Expected:

```text
.agents/skills/anitrend-metadata-and-social-preview/SKILL.md:2:name: anitrend-metadata-and-social-preview
.agents/skills/anitrend-metadata-and-social-preview/SKILL.md:3:description: Use when adding or updating route metadata, Open Graph tags, Twitter cards, or App Router wrappers for user-facing AniTrend pages.
.agents/skills/anitrend-metadata-and-social-preview/SKILL.md:37:- [App Router metadata guide](./references/app-router-metadata.md)
.agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md:5:- `layout.tsx` owns shared chrome, global fonts, and global metadata.
.agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md:10:- Use `generateMetadata` when params or fetched data are required.
.agents/skills/anitrend-metadata-and-social-preview/references/app-router-metadata.md:14:- Description is reused consistently across metadata, Open Graph, and Twitter where appropriate.
```

- [ ] **Step 5: Commit the metadata skill**

```bash
git add .agents/skills/anitrend-metadata-and-social-preview
git commit -m "docs: add metadata and social preview skill"
```

---

### Task 3: Create the Shadcn Extension Skill

**Files:**

- Create: `.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md`
- Create: `.agents/skills/anitrend-shadcn-extension-patterns/references/primitive-extension.md`
- Test: shell checks only

- [ ] **Step 1: Verify the shadcn skill files do not already exist**

Run:

```bash
for f in \
  .agents/skills/anitrend-shadcn-extension-patterns/SKILL.md \
  .agents/skills/anitrend-shadcn-extension-patterns/references/primitive-extension.md; do
  test -f "$f"
  echo "$f:$?"
done
```

Expected:

```text
.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md:1
.agents/skills/anitrend-shadcn-extension-patterns/references/primitive-extension.md:1
```

- [ ] **Step 2: Create `.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md`**

```md
---
name: anitrend-shadcn-extension-patterns
description: Use when extending AniTrend UI primitives with shadcn, cva, asChild, or Tailwind tokens instead of duplicating components or scattering raw classes.
argument-hint: Which primitive or UI pattern needs extending?
---

# AniTrend Shadcn Extension Patterns

## Overview

Use this skill when a UI change belongs in an existing primitive, variant, or wrapper rather than a brand new component tree. Prefer extension over duplication.

## When to Use

- Adding a new variant or size to `src/components/ui/**`
- Deciding between inline composition, wrapper component, and `cva` variant
- Reusing Tailwind tokens across multiple surfaces
- Wrapping `Link` or custom interactive elements with `asChild`

Do not use this skill for route metadata or app-handoff decisions unless the component also emits an app CTA.

## Decision Table

| Need                                           | Prefer                                   |
| ---------------------------------------------- | ---------------------------------------- |
| named visual state or size                     | `cva` variant                            |
| small composition around an existing primitive | wrapper with `asChild` where appropriate |
| one-off local layout detail                    | inline Tailwind classes                  |

## Procedure

1. Start from the nearest existing primitive in `src/components/ui/**`.
2. Reuse `cn()` and existing tokens before introducing new raw values.
3. Add a `cva` variant when consumers need intentional switching.
4. Use a wrapper only when composition improves readability without hiding behavior.
5. Keep the final API smaller than the duplication it replaces.

## Repo Anchors

- `src/components/ui/button.tsx`
- `src/lib/utils.ts`
- `src/app/globals.css`
- `tailwind.config.ts`

## References

- [Primitive extension guide](./references/primitive-extension.md)

## Common Mistakes

- Duplicating a primitive instead of adding a variant
- Hardcoding colors or spacing already represented by tokens
- Using custom CSS for a problem React composition already solves
- Skipping `asChild` and creating unnecessary wrapper markup
```

- [ ] **Step 3: Create `.agents/skills/anitrend-shadcn-extension-patterns/references/primitive-extension.md`**

```md
# Primitive Extension Guide

## Use a Variant When

- The same primitive needs a named visual style.
- Consumers need to switch styles intentionally.

## Use a Wrapper When

- You are combining a primitive with a consistent icon, label, or composition pattern.
- `asChild` keeps semantics correct when wrapping `Link`.

## Keep It Inline When

- The change is isolated to one surface.
- The style does not need a named API.

## Repo Anchors

- `src/components/ui/button.tsx`
- `src/lib/utils.ts`
- `src/app/globals.css`
- `tailwind.config.ts`

## Review Questions

- Would adding a variant remove duplication across more than one surface?
- Is this wrapper hiding too much behavior?
- Did I use semantic tokens before raw values?
```

- [ ] **Step 4: Run structural validation for the shadcn skill**

Run:

```bash
rg -n "^name: anitrend-shadcn-extension-patterns$|^description:|primitive-extension.md" .agents/skills/anitrend-shadcn-extension-patterns/SKILL.md
rg -n "cva|asChild|src/components/ui/button.tsx|src/lib/utils.ts" .agents/skills/anitrend-shadcn-extension-patterns/SKILL.md .agents/skills/anitrend-shadcn-extension-patterns/references/primitive-extension.md
```

Expected:

```text
.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md:2:name: anitrend-shadcn-extension-patterns
.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md:3:description: Use when extending AniTrend UI primitives with shadcn, cva, asChild, or Tailwind tokens instead of duplicating components or scattering raw classes.
.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md:39:- [Primitive extension guide](./references/primitive-extension.md)
.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md:22:| named visual state or size | `cva` variant |
.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md:23:| small composition around an existing primitive | wrapper with `asChild` where appropriate |
.agents/skills/anitrend-shadcn-extension-patterns/references/primitive-extension.md:17:- `src/components/ui/button.tsx`
.agents/skills/anitrend-shadcn-extension-patterns/references/primitive-extension.md:18:- `src/lib/utils.ts`
```

- [ ] **Step 5: Commit the shadcn skill**

```bash
git add .agents/skills/anitrend-shadcn-extension-patterns
git commit -m "docs: add shadcn extension skill"
```

---

### Task 4: Add the App Router and Deeplink Instruction Files

**Files:**

- Create: `.github/instructions/app-router.instructions.md`
- Create: `.github/instructions/deeplink-contract.instructions.md`
- Test: shell checks only

- [ ] **Step 1: Verify the instruction files do not already exist**

Run:

```bash
for f in \
  .github/instructions/app-router.instructions.md \
  .github/instructions/deeplink-contract.instructions.md; do
  test -f "$f"
  echo "$f:$?"
done
```

Expected:

```text
.github/instructions/app-router.instructions.md:1
.github/instructions/deeplink-contract.instructions.md:1
```

- [ ] **Step 2: Create `.github/instructions/app-router.instructions.md`**

```md
---
description: 'Use for files under src/app to keep AniTrend routes server-first, metadata-aware, and consistent with the existing App Router structure.'
applyTo: 'src/app/**'
---

- Keep `page.tsx`, `layout.tsx`, and route wrappers server-first unless browser-only APIs or local state force a child client component.
- Put `metadata` or `generateMetadata` on the server route file, not inside client components.
- Parse and sanitize `searchParams` before passing them to services.
- Keep API normalization in `src/lib/**`, not embedded in route JSX.
- Reuse existing section components and route composition patterns before adding new wrappers.
- If route architecture or metadata conventions materially change, update `.github/instructions/context.instructions.md`.
```

- [ ] **Step 3: Create `.github/instructions/deeplink-contract.instructions.md`**

```md
---
description: 'Use for AniTrend website files that generate or modify app URIs so deeplinks stay centralized, verified, and aligned with the Android app contract.'
applyTo: 'src/{config,components,app}/**/*.{ts,tsx}'
---

- Centralize app URI generation in `src/config/links.ts` instead of scattering raw `app.anitrend://` strings.
- When editing `Open in App`, dashboard shortcut, or other app handoff behavior, load `anitrend-ecosystem-awareness`.
- Prefer imported generators from `src/config/links.ts` over inline app URIs in leaf components.
- Do not invent new app URI shapes without checking the verified contract reference from the ecosystem skill.
- If a destination is not verified, mark it as unverified in task output and stop short of expanding that handoff pattern.
- Preserve analytics and fallback behavior when changing existing app CTAs.
```

- [ ] **Step 4: Run structural validation for the instruction files**

Run:

```bash
rg -n "^description:|^applyTo:" .github/instructions/app-router.instructions.md .github/instructions/deeplink-contract.instructions.md
rg -n "src/app/\*\*|src/config/links.ts|anitrend-ecosystem-awareness|app.anitrend://" .github/instructions/app-router.instructions.md .github/instructions/deeplink-contract.instructions.md
```

Expected:

```text
.github/instructions/app-router.instructions.md:2:description: "Use for files under src/app to keep AniTrend routes server-first, metadata-aware, and consistent with the existing App Router structure."
.github/instructions/app-router.instructions.md:3:applyTo: "src/app/**"
.github/instructions/deeplink-contract.instructions.md:2:description: "Use for AniTrend website files that generate or modify app URIs so deeplinks stay centralized, verified, and aligned with the Android app contract."
.github/instructions/deeplink-contract.instructions.md:3:applyTo: "src/{config,components,app}/**/*.{ts,tsx}"
.github/instructions/app-router.instructions.md:3:applyTo: "src/app/**"
.github/instructions/deeplink-contract.instructions.md:6:- Centralize app URI generation in `src/config/links.ts` instead of scattering raw `app.anitrend://` strings.
.github/instructions/deeplink-contract.instructions.md:7:- When editing `Open in App`, dashboard shortcut, or other app handoff behavior, load `anitrend-ecosystem-awareness`.
```

- [ ] **Step 5: Commit the instruction files**

```bash
git add .github/instructions/app-router.instructions.md .github/instructions/deeplink-contract.instructions.md
git commit -m "docs: add route and deeplink instructions"
```

---

### Task 5: Document the New Customization Pack in Repo Context

**Files:**

- Modify: `.github/instructions/context.instructions.md`
- Test: shell checks only

- [ ] **Step 1: Verify the new customization section is not already present**

Run:

```bash
rg -n "Agent Customizations|anitrend-ecosystem-awareness|anitrend-metadata-and-social-preview|anitrend-shadcn-extension-patterns" .github/instructions/context.instructions.md
```

Expected:

```text

```

- [ ] **Step 2: Append this section near the end of `.github/instructions/context.instructions.md`**

```md
## Agent Customizations

Project-scoped agent customizations live in `.agents/skills/` and `.github/instructions/`.

- `anitrend-agentic-workflow` — repo workflow, CI/CD, and validation guidance
- `keeping-nextjs-react-tailwind-coherent` — Next.js App Router, React state, and Tailwind coherence guidance
- `anitrend-ecosystem-awareness` — website-to-app handoff, deeplink contract awareness, and app parity decisions
- `anitrend-metadata-and-social-preview` — App Router metadata, Open Graph, and Twitter preview discipline
- `anitrend-shadcn-extension-patterns` — shadcn primitive extension, `cva`, `cn`, `asChild`, and token reuse guidance
- `.github/instructions/app-router.instructions.md` — always-on route guardrails for `src/app/**`
- `.github/instructions/deeplink-contract.instructions.md` — always-on guardrails for app URI generation and handoff behavior
```

- [ ] **Step 3: Validate that the context file now advertises the new pack**

Run:

```bash
rg -n "Agent Customizations|anitrend-ecosystem-awareness|anitrend-metadata-and-social-preview|anitrend-shadcn-extension-patterns|app-router.instructions.md|deeplink-contract.instructions.md" .github/instructions/context.instructions.md
```

Expected:

The command should return matches for the section header plus each of the five new customization entries.

- [ ] **Step 4: Commit the context update**

```bash
git add .github/instructions/context.instructions.md
git commit -m "docs: document customization pack in repo context"
```

---

### Task 6: Run Final Structural and Discovery Validation

**Files:**

- Review: `.agents/skills/anitrend-ecosystem-awareness/**`
- Review: `.agents/skills/anitrend-metadata-and-social-preview/**`
- Review: `.agents/skills/anitrend-shadcn-extension-patterns/**`
- Review: `.github/instructions/app-router.instructions.md`
- Review: `.github/instructions/deeplink-contract.instructions.md`
- Review: `.github/instructions/context.instructions.md`

- [ ] **Step 1: Run final structural checks**

Run:

```bash
rg -n "^name: (anitrend-ecosystem-awareness|anitrend-metadata-and-social-preview|anitrend-shadcn-extension-patterns)$" .agents/skills/*/SKILL.md
rg -n "^description:|^applyTo:" .github/instructions/app-router.instructions.md .github/instructions/deeplink-contract.instructions.md
rg -n "\./references/" .agents/skills/anitrend-ecosystem-awareness/SKILL.md .agents/skills/anitrend-metadata-and-social-preview/SKILL.md .agents/skills/anitrend-shadcn-extension-patterns/SKILL.md
git diff --check
```

Expected:

```text
.agents/skills/anitrend-ecosystem-awareness/SKILL.md:2:name: anitrend-ecosystem-awareness
.agents/skills/anitrend-metadata-and-social-preview/SKILL.md:2:name: anitrend-metadata-and-social-preview
.agents/skills/anitrend-shadcn-extension-patterns/SKILL.md:2:name: anitrend-shadcn-extension-patterns
.github/instructions/app-router.instructions.md:2:description: "Use for files under src/app to keep AniTrend routes server-first, metadata-aware, and consistent with the existing App Router structure."
.github/instructions/app-router.instructions.md:3:applyTo: "src/app/**"
.github/instructions/deeplink-contract.instructions.md:2:description: "Use for AniTrend website files that generate or modify app URIs so deeplinks stay centralized, verified, and aligned with the Android app contract."
.github/instructions/deeplink-contract.instructions.md:3:applyTo: "src/{config,components,app}/**/*.{ts,tsx}"
```

The `rg -n "\./references/" ...` command should also return one match for each referenced file link in the three `SKILL.md` files.

`git diff --check` should produce no output.

- [ ] **Step 2: Run a discovery sanity review against explicit prompts**

Check the new descriptions and instructions against these prompts:

1. `Add an Open in App CTA for a verified app destination on the dashboard.`
   - Expected primary load: `anitrend-ecosystem-awareness` + `deeplink-contract.instructions.md`
2. `Improve the discover page title, description, and social preview.`
   - Expected primary load: `anitrend-metadata-and-social-preview` + `app-router.instructions.md`
3. `Add a new variant to the button primitive instead of copying it.`
   - Expected primary load: `anitrend-shadcn-extension-patterns`
4. `Refactor a route wrapper to keep metadata server-side while moving state to a client child.`
   - Expected primary load: `anitrend-metadata-and-social-preview` + `app-router.instructions.md`

Record mismatches immediately and fix the affected description or instruction before proceeding.

- [ ] **Step 3: Verify the customization pack is represented in repo context**

Run:

```bash
rg -n "Agent Customizations|anitrend-ecosystem-awareness|anitrend-metadata-and-social-preview|anitrend-shadcn-extension-patterns" .github/instructions/context.instructions.md
```

Expected:

The command should return matches for the `## Agent Customizations` section and the three new skill names.

---

## Self-Review

### Spec coverage

- Ecosystem awareness skill and two references map to the cross-project contract model and website surfaces.
- Metadata skill and reference map to route metadata, Open Graph, and Twitter preview discipline.
- Shadcn skill and reference map to primitive extension and token-driven UI reuse.
- App Router instruction maps to always-on route guardrails.
- Deeplink instruction maps to always-on URI centralization and contract checks.
- Context file update makes the new customization pack discoverable in repo guidance.

### Placeholder scan

Search after writing the plan:

```bash
rg -n "TODO|TBD|FIXME|implement later|fill in details|similar to Task" docs/superpowers/plans/2026-04-17-anitrend-customization-pack.md
```

Expected: no output.

### Type consistency

- Skill folder names must exactly match `name:` frontmatter.
- Instruction filenames must end with `.instructions.md`.
- The ecosystem skill must link to `website-surfaces.md` and `app-route-contract.md` exactly.
- The metadata skill must link to `app-router-metadata.md` exactly.
- The shadcn skill must link to `primitive-extension.md` exactly.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-17-anitrend-customization-pack.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
