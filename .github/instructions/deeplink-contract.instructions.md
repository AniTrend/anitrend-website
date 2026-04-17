---
applyTo: 'src/{config,components,app}/**/*.{ts,tsx}'
description: 'Deep link URI contract for AniTrend — centralized generation, verified URI shapes, analytics and fallback preservation.'
---

# Deep Link Contract

## Single Source of Truth

- All new `app.anitrend://` URI generation **must go through `src/config/links.ts`**.
- Do not add new inline app URI strings in components or pages; migrate existing ones to `src/config/links.ts` when touching those files.
- For custom URI schemes such as `app.anitrend://...`, render a plain `<a href>` rather than Next.js `Link`.
- Import the appropriate helper or constant from `src/config/links.ts`:

```typescript
import { deepLinks } from '@/config/links';

// Correct
const url = deepLinks.anime(animeId);

// Wrong — new inline URI string
const url = `app.anitrend://action/anime/${animeId}`;
```

## Verified URI Contract

- Treat `deepLinks` in `src/config/links.ts` as the centralized contract surface in this repo.
- Do **not** invent new `app.anitrend://` paths outside `src/config/links.ts`.
- When adding a new deep link target, define it in `src/config/links.ts` first and load the `anitrend-ecosystem-awareness` skill (`.agents/skills/anitrend-ecosystem-awareness/SKILL.md`) before implementation.
- A URI being present in `deepLinks` does not by itself upgrade ecosystem-level verification status; follow the ecosystem skill when deciding whether a route can be expanded to new surfaces.
- If URI assembly moves into `src/lib/`, expand this instruction's `applyTo` scope in the same change.

## Skill Loading Requirement

Load the `anitrend-ecosystem-awareness` skill when editing any of the following:

- Open in App CTAs
- Dashboard shortcuts that hand off to native surfaces
- Components or pages that **produce, modify, or route** a deep link URI (i.e., they assemble the URI string or decide its target)

Do **not** load the skill merely because a component receives a pre-built URI as a prop and renders it unchanged (pure pass-through consumers).

## Analytics and Fallback Behavior

- When creating or touching an app handoff CTA, preserve existing analytics events and add analytics coverage if that CTA does not have any yet.
- If a CTA already has fallback behavior (for example a Play Store redirect when the app is not installed), preserve it — do not replace it with a no-op.
- If you move a CTA to a new component, carry the analytics instrumentation and any existing fallback logic with it.

## Review Checklist

Before merging changes that touch deep link behavior:

- [ ] URI generated via `src/config/links.ts` helper (no inline strings)
- [ ] Custom URI schemes use a plain `<a href>` instead of Next.js `Link`
- [ ] URI shape is defined in `src/config/links.ts`
- [ ] `anitrend-ecosystem-awareness` skill was consulted
- [ ] Analytics events are intact or deliberately updated
- [ ] Existing fallback behavior, if any, is preserved
