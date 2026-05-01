# Website Surfaces Emitting App Actions

This inventory captures current website surfaces that either centralize or emit app-facing actions.

## Centralized Deep Links

### `src/config/links.ts`

- `deepLinks.profile`: `app.anitrend://action/profile`
- `deepLinks.discover`: `app.anitrend://action/discover`
- `deepLinks.suggestions`: `app.anitrend://action/suggestions`
- `deepLinks.social`: `app.anitrend://action/social`
- `deepLinks.settings`: `app.anitrend://action/settings`
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

### `src/app/dashboard/page.tsx` + `src/components/dashboard-app-shortcuts.tsx`

Surface:

- Dashboard shortcut cluster for `profile`, `discover`, `suggestions`, `social`, and `settings`

Behavior:

- Delegates each handoff through `src/components/app-handoff/open-in-app-button.tsx`
- Emits app intents `{ type: 'profile' }`, `{ type: 'discover' }`, `{ type: 'suggestions' }`, `{ type: 'social' }`, and `{ type: 'settings' }`
- Logs analytics event `open_in_app` with `{ source: 'dashboard', target }`
- Reuses the shared fallback dialog and centralized intent status map

Implication:

- Dashboard now acts as the primary verified native-app launch surface beyond profile-only handoff.

### `src/app/page.tsx` + `src/components/sections/app-handoff-section.tsx`

Surface:

- Landing-page bridge section: "Open AniTrend where it fits best"

Behavior:

- Emits verified app intents for `discover`, `suggestions`, and `social`
- Logs analytics event `open_in_app` with `{ source: 'home', target }`
- Uses shared `OpenInAppButton` behavior and centralized URI generation from `src/config/links.ts`

Implication:

- The homepage now explicitly bridges web exploration to verified native routes without scattering deeplink literals across marketing sections.

## Discovery Quality Notes

- Current inventory is evidence-based from repository code, not assumptions.
- If additional app-facing surfaces are added later, record them here with:
  - file path
  - emitting component/surface
  - exact route/action emitted
  - analytics event linkage (if any)
