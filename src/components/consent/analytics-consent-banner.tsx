'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { setAnalyticsEnabled, logEvent } from '@/lib/firebase';

const STORAGE_KEY = 'anitrend_analytics_consent';

/**
 * Simple bottom-fixed consent banner for analytics collection.
 * - Persists the user's choice in localStorage
 * - Calls setAnalyticsEnabled(...) so Firebase respects the preference
 */
export default function AnalyticsConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'granted') {
        void setAnalyticsEnabled(true);
        setVisible(false);
      } else if (stored === 'denied') {
        void setAnalyticsEnabled(false);
        setVisible(false);
      } else {
        // No stored preference — show the banner
        setVisible(true);
      }
    } catch (err) {
      // If anything goes wrong with localStorage, don't block the app
      console.warn('[analytics] failed to read consent from storage', err);
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

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
      setVisible(false);
    }
  };

  const decline = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'denied');
      await setAnalyticsEnabled(false);
    } catch (err) {
      console.warn('[analytics] decline failed', err);
    } finally {
      setVisible(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(96%,900px)] -translate-x-1/2 rounded-lg bg-popover p-4 shadow-lg border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          AniTrend uses anonymous analytics to improve the product. By accepting
          you allow anonymous usage data to be collected. You can change this
          later in your browser settings.
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
