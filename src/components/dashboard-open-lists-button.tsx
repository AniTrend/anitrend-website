'use client';

import { Smartphone } from 'lucide-react';

import { deepLinks } from '@/config/links';
import { logEvent } from '@/lib/firebase';

import { Button } from '@/components/ui/button';

export function DashboardOpenListsButton() {
  return (
    <Button asChild size="lg">
      <a
        href={deepLinks.profile}
        onClick={() => {
          void logEvent('open_in_app', {
            source: 'dashboard',
            target: 'profile',
          });
        }}
      >
        <Smartphone className="mr-2 h-5 w-5" /> Open My Lists in App
      </a>
    </Button>
  );
}
