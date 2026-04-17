# Website Surfaces Emitting App Actions

This inventory captures current website surfaces that either centralize or emit app-facing actions.

## Centralized Deep Links

### `src/config/links.ts`

- `deepLinks.profile`: `app.anitrend://action/profile`
- `deepLinks.anime(id)`: `app.anitrend://action/anime/${id}`

Notes:

- This file is the current source of truth for reusable deeplink constants.
- Not all emitting surfaces currently consume this helper yet.

## Emitting Surfaces

### `src/components/anime-analytics.tsx`

Component:

- `OpenInAppButton`

Behavior:

- Emits app handoff via `href={deepLinks.anime(anime.id)}`
- Logs analytics event `open_in_app` with `{ id, title }`

Implication:

- Surface is app-aware, measurable, and reuses the centralized anime deep link helper.

### `src/app/dashboard/page.tsx` + `src/components/dashboard-open-lists-button.tsx`

Surface:

- Hero CTA: "Open My Lists in App"

Behavior:

- Emits app handoff via `href={deepLinks.profile}`
- Logs analytics event `open_in_app` with `{ source: 'dashboard', target: 'profile' }`

Implication:

- Profile handoff is present in dashboard UX, reuses the centralized profile deep link, and keeps app-handoff analytics attached at the emitting component.

## Discovery Quality Notes

- Current inventory is evidence-based from repository code, not assumptions.
- If additional app-facing surfaces are added later, record them here with:
  - file path
  - emitting component/surface
  - exact route/action emitted
  - analytics event linkage (if any)
