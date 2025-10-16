'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initFirebaseAnalytics, logEvent } from '@/lib/firebase';

/**
 * Client-only component that logs page_view events on route changes.
 * Import into the root layout so page views are tracked automatically.
 */
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    let cancelled = false;

    void (async () => {
      const analytics = await initFirebaseAnalytics();
      if (!analytics || cancelled) return;

      await logEvent('page_view', {
        page_path: pathname,
        page_location:
          typeof window !== 'undefined' ? window.location.href : undefined,
        page_title:
          typeof document !== 'undefined' ? document.title : undefined,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
