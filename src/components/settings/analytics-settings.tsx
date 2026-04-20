'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { setAnalyticsEnabled, logEvent } from '@/lib/firebase';
import { copy } from '@/copy';

const STORAGE_KEY = 'anitrend_analytics_consent';

export default function AnalyticsSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const stored =
        typeof window !== 'undefined'
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (stored === 'granted') setEnabled(true);
      else if (stored === 'denied') setEnabled(false);
      else setEnabled(null);
    } catch {
      // fail silently
      setEnabled(null);
    }
  }, []);

  const toggle = async (next: boolean) => {
    try {
      await setAnalyticsEnabled(next);
      localStorage.setItem(STORAGE_KEY, next ? 'granted' : 'denied');
      setEnabled(next);
      await logEvent('analytics_consent_changed', {
        consent: next ? 'granted' : 'denied',
      });
    } catch (err) {
      console.warn('Failed to toggle analytics', err);
    }
  };

  const clear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setEnabled(null);
    } catch (err) {
      console.warn('Failed to clear analytics consent', err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">
            {copy.common.analytics.settingsTriggerSr}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.common.analytics.dialog.title}</DialogTitle>
          <DialogDescription>
            {copy.common.analytics.dialog.description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <Label>{copy.common.analytics.dialog.label}</Label>
            <p className="text-sm text-muted-foreground">
              {copy.common.analytics.dialog.sublabel}
            </p>
          </div>
          <Switch checked={Boolean(enabled)} onCheckedChange={toggle} />
        </div>

        <DialogFooter>
          <div className="flex-1">
            <Button variant="ghost" onClick={clear}>
              {copy.common.analytics.dialog.clearConsent}
            </Button>
          </div>
          <div>
            <DialogClose asChild>
              <Button
                onClick={() => void logEvent('analytics_settings_closed')}
              >
                {copy.common.analytics.dialog.done}
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
