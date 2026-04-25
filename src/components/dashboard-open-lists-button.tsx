'use client';

import { Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { appIntentStatus } from '@/config/links';
import { OpenInAppButton } from '@/components/app-handoff/open-in-app-button';
import { logEvent } from '@/lib/firebase';

export function DashboardOpenListsButton() {
  const t = useTranslations('common');

  return (
    <OpenInAppButton
      size="lg"
      intent={{ type: 'profile' }}
      intentStatus={appIntentStatus.profile}
      onAttempt={() => {
        void logEvent('open_in_app', {
          source: 'dashboard',
          target: 'profile',
        });
      }}
    >
      <Smartphone className="mr-2 h-5 w-5" /> {t('actions.openMyListsInApp')}
    </OpenInAppButton>
  );
}
