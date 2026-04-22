import { getAppIntentHref, type AppIntent } from '@/config/links';

type OpenAppIntentOptions = {
  timeoutMs?: number;
};

export async function openAppIntent(
  intent: AppIntent,
  options: OpenAppIntentOptions = {}
): Promise<boolean> {
  const timeoutMs = options.timeoutMs ?? 1200;

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  const href = getAppIntentHref(intent);

  return await new Promise<boolean>((resolve) => {
    let settled = false;

    const cleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

    const timeoutId = window.setTimeout(() => {
      settle(document.visibilityState === 'hidden');
    }, timeoutMs);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    try {
      window.location.assign(href);
    } catch (error) {
      console.warn('App handoff failed synchronously', error);
      settle(false);
    }
  });
}
