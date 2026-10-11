'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { setAnalyticsEnabled, logEvent } from '@/lib/firebase';

const STORAGE_KEY = 'anitrend_analytics_consent';

function subscribeToConsent(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

function needsConsent() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== 'granted' && stored !== 'denied';
  } catch {
    return true;
  }
}

const serverNeedsConsent = () => false;

/**
 * Simple bottom-fixed consent banner for analytics collection.
 * - Persists the user's choice in localStorage
 * - Calls setAnalyticsEnabled(...) so Firebase respects the preference
 */
export default function AnalyticsConsentBanner() {
  const t = useTranslations('common');
  // Match the server render until hydration finishes, then read browser storage.
  const pendingConsent = useSyncExternalStore(
    subscribeToConsent,
    needsConsent,
    serverNeedsConsent
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'granted') {
        void setAnalyticsEnabled(true);
      } else if (stored === 'denied') {
        void setAnalyticsEnabled(false);
      }
    } catch (err) {
      console.warn('[analytics] failed to read consent from storage', err);
    }
  }, []);

  if (!pendingConsent || dismissed) return null;

  const accept = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'granted');
      await setAnalyticsEnabled(true);
      // Record consent as an analytics event after enabling collection
      await logEvent('analytics_consent', {
        consent: 'granted',
        source: 'banner',
      });
    } catch (err) {
      console.warn('[analytics] accept failed', err);
    } finally {
      setDismissed(true);
    }
  };

  const decline = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'denied');
      await setAnalyticsEnabled(false);
    } catch (err) {
      console.warn('[analytics] decline failed', err);
    } finally {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(96%,900px)] -translate-x-1/2 rounded-lg bg-popover p-4 shadow-lg border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {t('analytics.consentBanner.message')}
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={decline}>
            {t('analytics.consentBanner.decline')}
          </Button>
          <Button size="sm" onClick={accept}>
            {t('analytics.consentBanner.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
