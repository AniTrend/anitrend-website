# Website Surfaces Emitting App Actions

This inventory captures current website surfaces that either centralize or emit app-facing actions.

## Centralized Deep Links

### `src/config/links.ts`

- `deepLinks.profile`: `app.anitrend://action/profile`
- `deepLinks.anime(id)`: `app.anitrend://action/anime/${id}`
- `getAppIntentHref(intent)`: typed app intent to URI resolution
- `appIntentStatus`: current contract confidence for shared app handoff surfaces

Notes:

- This file is the current source of truth for reusable deeplink constants.
- Shared app-intent resolution now lives here even when UI surfaces delegate opening behavior to `src/components/app-handoff/`.

## Emitting Surfaces

### `src/components/anime-analytics.tsx`

Component:

- `OpenInAppButton`

Behavior:

- Delegates app handoff through `src/components/app-handoff/open-in-app-button.tsx`
- Emits anime detail app intent `{ type: 'anime-detail', animeId }`
- Logs analytics event `open_in_app` with `{ id, title }`
- Shows a shared fallback dialog when the browser remains on the current page

Implication:

- Surface is app-aware, measurable, and reuses centralized intent-to-URI resolution.

### `src/app/dashboard/page.tsx` + `src/components/dashboard-open-lists-button.tsx`

Surface:

- Hero CTA: "Open My Lists in App"

Behavior:

- Delegates app handoff through `src/components/app-handoff/open-in-app-button.tsx`
- Emits profile app intent `{ type: 'profile' }`
- Logs analytics event `open_in_app` with `{ source: 'dashboard', target: 'profile' }`
- Shows a shared fallback dialog when the browser remains on the current page

Implication:

- Profile handoff is present in dashboard UX, reuses centralized intent resolution, and keeps app-handoff analytics attached at the emitting component.

## Discovery Quality Notes

- Current inventory is evidence-based from repository code, not assumptions.
- If additional app-facing surfaces are added later, record them here with:
  - file path
  - emitting component/surface
  - exact route/action emitted
  - analytics event linkage (if any)
