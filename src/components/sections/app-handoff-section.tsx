'use client';

import { Compass, MessageSquareMore, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { OpenInAppButton } from '@/components/app-handoff/open-in-app-button';
import { appIntentStatus, type AppIntent } from '@/config/links';
import { logEvent } from '@/lib/firebase';

const items = [
  {
    intent: { type: 'discover' } as const,
    icon: Compass,
    actionLabel: 'actions.openDiscoverInApp',
    descriptionKey: 'appBridge.items.discover.description',
  },
  {
    intent: { type: 'suggestions' } as const,
    icon: Sparkles,
    actionLabel: 'actions.openSuggestionsInApp',
    descriptionKey: 'appBridge.items.suggestions.description',
  },
  {
    intent: { type: 'social' } as const,
    icon: MessageSquareMore,
    actionLabel: 'actions.openSocialInApp',
    descriptionKey: 'appBridge.items.social.description',
  },
] satisfies Array<{
  intent: Extract<AppIntent, { type: 'discover' | 'suggestions' | 'social' }>;
  icon: React.ComponentType<{ className?: string }>;
  actionLabel:
    | 'actions.openDiscoverInApp'
    | 'actions.openSuggestionsInApp'
    | 'actions.openSocialInApp';
  descriptionKey:
    | 'appBridge.items.discover.description'
    | 'appBridge.items.suggestions.description'
    | 'appBridge.items.social.description';
}>;

export function AppHandoffSection() {
  const common = useTranslations('common');
  const marketing = useTranslations('marketing');

  return (
    <section id="open-in-app" className="scroll-mt-24 py-20 md:py-24">
      <div className="container">
        <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-[linear-gradient(180deg,rgba(24,27,54,0.92),rgba(10,12,27,0.96))] p-8 shadow-[0_30px_120px_rgba(4,6,20,0.45)] md:p-10">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-primary/90">
                {marketing('appBridge.badge')}
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl font-headline">
                {marketing('appBridge.title')}
              </h2>
              <p className="max-w-2xl text-base text-slate-300 md:text-lg">
                {marketing('appBridge.description')}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.intent.type}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(4,6,20,0.28)]"
                >
                  <OpenInAppButton
                    intent={item.intent}
                    intentStatus={appIntentStatus[item.intent.type]}
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-[1.25rem] px-4 py-4 text-left text-white hover:bg-white/10 hover:text-white"
                    onAttempt={() => {
                      void logEvent('open_in_app', {
                        source: 'home',
                        target: item.intent.type,
                      });
                    }}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-sm font-semibold text-white">
                        {common(item.actionLabel)}
                      </span>
                      <span className="text-sm text-slate-300">
                        {marketing(item.descriptionKey)}
                      </span>
                    </span>
                  </OpenInAppButton>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
