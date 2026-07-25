# src/components/settings/

## Responsibility

Provides client-side settings controls for analytics consent. The settings UI lets a visitor inspect and change their local analytics preference without navigating away from the current page.

Current scope is `AnalyticsSettings`, a dialog launched from a ghost icon button. It manages the analytics consent switch, stores the preference under `anitrend_analytics_consent`, clears that stored preference on request, and records settings-related analytics events through the Firebase helper layer.

## Design

The settings component is a client component because it reads `window`, `document` indirectly through analytics helpers, and `localStorage`. It composes shadcn UI primitives for the dialog, button, switch, and label, then uses `next-intl` keys from the common namespace for all visible and screen reader copy.

Consent state is local to the component. The initial state is `true` for stored `granted`, `false` for stored `denied`, and `null` when no stored preference exists or storage access fails. The switch receives `Boolean(enabled)`, so the unset state renders as off while still remaining distinct in component state.

Analytics mutations are delegated to `src/lib/firebase.ts` rather than importing Firebase SDK APIs directly. This keeps SDK loading, browser checks, missing configuration handling, and runtime collection toggles outside the UI component.

## Flow

On render, `AnalyticsSettings` reads `anitrend_analytics_consent` from `localStorage` inside the `useState` initializer. If storage contains `granted`, the switch is enabled. If storage contains `denied`, the switch is disabled. If storage is missing or unavailable, the state remains unset.

When the visitor toggles the switch, `toggle(next)` runs the consent preference flow:

1. Calls `setAnalyticsEnabled(next)` so Firebase Analytics collection is updated at runtime.
2. Persists `granted` or `denied` to `localStorage`.
3. Updates the component state so the switch reflects the selected preference.
4. Attempts to log `analytics_consent_changed` with the selected consent value.

When the visitor clears consent, `clear()` removes the local storage key and resets component state to `null`. It does not call `setAnalyticsEnabled`, so it only clears the saved preference in this component flow.

When the dialog is closed through the Done button, the component attempts to log `analytics_settings_closed`.

## Integration

`AnalyticsSettings` integrates with `src/lib/firebase.ts` through `setAnalyticsEnabled` and `logEvent`. `setAnalyticsEnabled` initializes analytics if needed, then calls Firebase `setAnalyticsCollectionEnabled` when an analytics instance is available. `logEvent` initializes analytics if needed, then forwards events to Firebase `logEvent` when configured.

The broader analytics state is initialized by `src/components/analytics.tsx`, which calls `initFirebaseAnalytics` on route changes and logs `page_view` events. `initFirebaseAnalytics` creates or reuses the Firebase app, skips analytics when required public Firebase configuration is absent or placeholder-like, and applies the `NEXT_PUBLIC_ENABLE_ANALYTICS` default collection flag. The settings dialog then changes that active collection state at runtime through the same Firebase helper module.

If Firebase Analytics is unavailable, running on the server, or not configured, the Firebase helpers no-op or warn without throwing. The settings UI catches storage and toggle failures and logs warnings, preserving the page experience.
