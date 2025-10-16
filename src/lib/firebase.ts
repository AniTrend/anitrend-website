// Lightweight Firebase Analytics helpers.
// - Uses dynamic imports so the SDK is only loaded on the client.
// - Safe for Next.js app-router (avoids SSR usage of window).

import type { Analytics } from 'firebase/analytics';
import type { FirebaseApp } from 'firebase/app';

let analyticsInstance: Analytics | null = null;
let firebaseApp: FirebaseApp | null = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

/**
 * Initialize Firebase Analytics (no-op on the server).
 * Returns the Analytics instance or null if not configured / running on the server.
 */
export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (!isBrowser()) return null;
  if (analyticsInstance) return analyticsInstance;

  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  // Minimal sanity check: required values must be present for analytics to work.
  if (!measurementId || !apiKey) {
    // Not configured for analytics (safe to skip in development)
    return null;
  }

  const firebaseAppModule = await import('firebase/app');
  const analyticsModule = await import('firebase/analytics');

  const { initializeApp, getApps, getApp } = firebaseAppModule;

  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: measurementId,
  };

  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    try {
      firebaseApp = getApp();
    } catch {
      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  const { getAnalytics, setAnalyticsCollectionEnabled } = analyticsModule;
  analyticsInstance = getAnalytics(firebaseApp);

  // Respect environment override: analytics are ENABLED by default unless
  // NEXT_PUBLIC_ENABLE_ANALYTICS is explicitly set to "false".
  // This lets the site collect page & event views by default while still
  // offering an opt-out via env var or runtime consent controls.
  const envFlag = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS;
  const defaultEnabled = envFlag === 'false' ? false : true;
  try {
    setAnalyticsCollectionEnabled(analyticsInstance, defaultEnabled);
  } catch (err) {
    // Don't let analytics initialization break the app
    console.warn('[analytics] failed to set collection enabled', err);
  }

  return analyticsInstance;
}

/**
 * Log a custom analytics event (safe no-op on server or when analytics isn't configured)
 */
export async function logEvent(name: string, params?: Record<string, unknown>) {
  const analytics = await initFirebaseAnalytics();

  try {
    if (analytics) {
      const { logEvent: firebaseLogRaw } = await import('firebase/analytics');
      // firebase logEvent has a fairly loose signature; coerce to a loose function type
      const firebaseLog = firebaseLogRaw as unknown as (
        ...args: unknown[]
      ) => void;
      firebaseLog(analytics, name, params);
    }
  } catch (err) {
    console.warn('[analytics] failed to log event', err);
  }
}

/**
 * Toggle analytics collection at runtime (useful for consent toggles)
 */
export async function setAnalyticsEnabled(enabled: boolean) {
  if (!isBrowser()) return;
  const analytics = await initFirebaseAnalytics();
  if (!analytics) return;
  try {
    const { setAnalyticsCollectionEnabled } = await import(
      'firebase/analytics'
    );
    setAnalyticsCollectionEnabled(analytics, enabled);
  } catch (err) {
    console.warn('[analytics] failed to set collection enabled', err);
  }
}
