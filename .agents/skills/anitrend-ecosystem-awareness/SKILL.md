---
name: anitrend-ecosystem-awareness
description: Use when implementing or reviewing deeplinks, Open in App CTAs, dashboard shortcuts, and web-to-app handoff decisions across the AniTrend website.
argument-hint: Which route, CTA, or handoff path needs ecosystem-aware guidance?
---

# AniTrend Ecosystem Awareness

## Overview

Use this skill when work touches the boundary between the AniTrend website and the native AniTrend app. It helps keep app handoff behavior discoverable, consistent, and measurable.

## When to Use

- Adding or changing deeplink URLs (`app.anitrend://...`)
- Building or updating Open in App CTAs
- Modifying dashboard shortcuts that open native app surfaces
- Deciding whether a user action should stay on web or hand off to app
- Reviewing analytics events related to app handoff interactions

## Do Not Use For

- Purely web-only navigation with no app handoff
- Styling-only changes that do not alter app-facing behavior
- Backend-only changes unrelated to CTA destinations or route contracts

## Current Repo Anchors

- Centralized deep links: `src/config/links.ts`
  - Primary reusable app-link helpers are maintained here
- Anime details Open in App CTA: `src/components/anime-analytics.tsx`
  - Emits anime handoff and logs `open_in_app`
- Dashboard shortcut CTA: `src/app/dashboard/page.tsx`
  - Emits profile handoff from the dashboard surface

Implementation-level route literals and per-surface details live in:

- `./references/website-surfaces.md`
- `./references/app-route-contract.md`

## Procedure

1. Identify the handoff surface.
   - Locate where users are sent to app routes (CTA buttons, links, quick actions).
2. Confirm route contract status.
   - Check `./references/app-route-contract.md` for route confidence and caveats.
3. Use centralized links.
   - Reuse shared deep links from `src/config/links.ts` rather than introducing new literals.
   - For custom app URI schemes, follow `.github/instructions/deeplink-contract.instructions.md` so emitting surfaces use the right element and migration rules.
4. Preserve measurement semantics.
   - Keep analytics events stable or update downstream consumers when changing event names.
5. Document discovery updates.
   - If a new surface emits app actions, add it to `./references/website-surfaces.md`.

## Expected Outputs

- App handoff decisions that are explicit and reproducible
- Updated references when surfaces or contracts change
- Clear route confidence notes (verified vs pending verification)

## References

- [Website surfaces inventory](./references/website-surfaces.md)
- [App route contract](./references/app-route-contract.md)
