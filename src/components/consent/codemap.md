# src/components/consent/

## Responsibility

- Owns the site-level analytics consent prompt shown to visitors who have not made a stored analytics choice.
- Persists the visitor decision for Firebase Analytics collection using the browser `localStorage` key `anitrend_analytics_consent`.
- Applies stored consent on mount so Firebase Analytics collection follows the previous visitor choice.
- Keeps consent handling client-only and safe for server rendering by checking for `window` before reading browser storage.

## Design

- `analytics-consent-banner.tsx` is a client component with local `visible` state.
- Visibility is derived from storage during state initialization. The banner is hidden when storage contains `granted` or `denied` and shown when no recognized choice exists or storage read fails.
- Runtime analytics control is delegated to `setAnalyticsEnabled` from `src/lib/firebase.ts`; the banner does not import Firebase SDK modules directly.
- Consent event recording is delegated to `logEvent` from `src/lib/firebase.ts` after analytics is enabled for accepted consent.
- Storage and Firebase calls are wrapped in `try` blocks so consent UI failures do not break the page.

## Flow

- Initial render checks `localStorage.getItem('anitrend_analytics_consent')` when running in the browser.
- On mount, the stored value is read again:
  - `granted` calls `setAnalyticsEnabled(true)`.
  - `denied` calls `setAnalyticsEnabled(false)`.
  - Any other value leaves the banner available for a choice.
- Accept flow stores `granted`, enables analytics collection, logs `analytics_consent` with `consent: 'granted'` and `source: 'banner'`, then hides the banner.
- Decline flow stores `denied`, disables analytics collection, then hides the banner.
- If storage or analytics calls fail, errors are logged as warnings and the banner still closes after an accept or decline action.

## Integration

- `src/app/layout.tsx` mounts `AnalyticsConsentBanner` once in the root layout, after the footer and before the toaster, so the banner is globally available across routes.
- `src/components/analytics.tsx` logs route `page_view` events through the same Firebase helper boundary. Consent can disable or enable collection through that shared Firebase Analytics instance.
- `src/components/settings/analytics-settings.tsx` uses the same storage key and Firebase helpers to change or clear the stored analytics preference after the banner decision.
- `src/lib/firebase.ts` is the analytics boundary. It initializes Firebase Analytics only in the browser, skips initialization when required public config is missing or placeholder-like, logs custom events, and toggles collection with `setAnalyticsCollectionEnabled`.
