import { getAppIntentHref, type AppIntent } from '@/config/links';

type OpenAppIntentOptions = {
  timeoutMs?: number;
};

const DEFAULT_APP_HANDOFF_TIMEOUT_MS = 1800;

export async function openAppIntent(
  intent: AppIntent,
  options: OpenAppIntentOptions = {}
): Promise<boolean> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_APP_HANDOFF_TIMEOUT_MS;

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  const href = getAppIntentHref(intent);

  return await new Promise<boolean>((resolve) => {
    let settled = false;

    const cleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.clearTimeout(timeoutId);
    };

    const settle = (opened: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(opened);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        settle(true);
      }
    };

    const handlePageHide = () => {
      // In this handled flow, pagehide is treated as an app-switch heuristic,
      // not proof that the native app opened.
      settle(true);
    };

    const timeoutId = window.setTimeout(() => {
      settle(document.visibilityState === 'hidden');
    }, timeoutMs);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    try {
      window.location.assign(href);
    } catch (error) {
      console.warn('App handoff failed synchronously', error);
      settle(false);
    }
  });
}
