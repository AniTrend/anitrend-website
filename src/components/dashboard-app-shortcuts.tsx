'use client';

import {
  Compass,
  ListChecks,
  MessageSquareMore,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { OpenInAppButton } from '@/components/app-handoff/open-in-app-button';
import { appIntentStatus, type AppIntent } from '@/config/links';
import { logEvent } from '@/lib/firebase';

type DashboardShortcutTarget = Exclude<AppIntent['type'], 'anime-detail'>;

const shortcutIcons = {
  profile: ListChecks,
  discover: Compass,
  suggestions: Sparkles,
  social: MessageSquareMore,
  settings: Settings2,
} satisfies Record<DashboardShortcutTarget, React.ComponentType<{ className?: string }>>;

const dashboardTargets: DashboardShortcutTarget[] = [
  'profile',
  'discover',
  'suggestions',
  'social',
  'settings',
];

const actionLabelKey = {
  profile: 'actions.openProfileInApp',
  discover: 'actions.openDiscoverInApp',
  suggestions: 'actions.openSuggestionsInApp',
  social: 'actions.openSocialInApp',
  settings: 'actions.openSettingsInApp',
} as const;

export function DashboardAppShortcuts() {
  const common = useTranslations('common');
  const dashboard = useTranslations('dashboard');

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {dashboardTargets.map((target) => {
        const Icon = shortcutIcons[target];

        return (
          <div
            key={target}
            className="rounded-3xl border border-border/60 bg-background/70 p-3 shadow-[0_16px_48px_rgba(6,8,24,0.24)] backdrop-blur"
          >
            <OpenInAppButton
              intent={{ type: target }}
              intentStatus={appIntentStatus[target]}
              variant="ghost"
              className="h-auto w-full justify-start rounded-2xl px-3 py-3 text-left hover:bg-accent/60"
              onAttempt={() => {
                void logEvent('open_in_app', {
                  source: 'dashboard',
                  target,
                });
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {common(actionLabelKey[target] as never)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {dashboard(`appShortcuts.items.${target}.description` as never)}
                </span>
              </span>
            </OpenInAppButton>
          </div>
        );
      })}
    </div>
  );
}
