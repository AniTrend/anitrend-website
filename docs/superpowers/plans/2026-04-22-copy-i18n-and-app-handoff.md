# Copy I18n and App Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `src/copy` with a real `next-intl`-based message system, remove remaining user-facing hard-coded strings, and move app-opening CTAs onto a shared typed handoff layer with in-page fallback prompts.

**Architecture:** Keep the current App Router URL structure unchanged and introduce `next-intl` as an internal localization layer with an `en`-only catalog. Centralize app handoff into a typed contract plus client-side open orchestrator so profile and anime-detail CTAs share one fallback-aware flow instead of embedding raw custom-scheme behavior in surface components.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, `next-intl`, Playwright, Tailwind, shadcn/ui

---

### Task 1: Add `next-intl` Infrastructure and English Message Catalogs

**Files:**

- Modify: `package.json`
- Modify: `next.config.ts`
- Create: `src/i18n/config.ts`
- Create: `src/i18n/request.ts`
- Create: `messages/en/common.json`
- Create: `messages/en/dashboard.json`
- Create: `messages/en/discover.json`
- Create: `messages/en/recommend.json`
- Create: `messages/en/anime.json`
- Create: `messages/en/marketing.json`
- Create: `messages/en/metadata.json`

- [ ] **Step 1: Add the dependency and script surface**

Update `package.json` to add `next-intl` without changing the existing dev/build/test commands.

```json
{
  "dependencies": {
    "next-intl": "^4.0.0"
  }
}
```

- [ ] **Step 2: Wire `next-intl` into Next config**

Modify `next.config.ts` to wrap the exported config.

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // keep existing entries unchanged
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Create explicit locale config**

Create `src/i18n/config.ts` so locale handling is centralized even though only `en` ships now.

```ts
export const defaultLocale = 'en' as const;

export const locales = [defaultLocale] as const;

export type AppLocale = (typeof locales)[number];

export function isSupportedLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
```

- [ ] **Step 4: Create `next-intl` request config**

Create `src/i18n/request.ts` with a single-locale loader and future-safe locale fallback.

```ts
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from '@/i18n/config';

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: {
    common: (await import('../../messages/en/common.json')).default,
    dashboard: (await import('../../messages/en/dashboard.json')).default,
    discover: (await import('../../messages/en/discover.json')).default,
    recommend: (await import('../../messages/en/recommend.json')).default,
    anime: (await import('../../messages/en/anime.json')).default,
    marketing: (await import('../../messages/en/marketing.json')).default,
    metadata: (await import('../../messages/en/metadata.json')).default,
  },
}));
```

- [ ] **Step 5: Convert the current copy domains into message catalogs**

Create the `messages/en/*.json` files from the current `src/copy/en/*` modules. Convert function-based strings into ICU messages.

Example `messages/en/common.json`:

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "discover": "Discover",
    "recommend": "Recommend",
    "features": "Features",
    "integrations": "Integrations",
    "getStarted": "Get Started",
    "menu": "Menu"
  },
  "footer": {
    "copyright": "© {year} AniTrend",
    "faq": "FAQ",
    "termsOfService": "Terms of Service",
    "privacyPolicy": "Privacy Policy"
  },
  "actions": {
    "openInApp": "Open in App",
    "openMyListsInApp": "Open My Lists in App",
    "share": "Share",
    "linkCopied": "Link copied"
  }
}
```

Example `messages/en/metadata.json`:

```json
{
  "brandName": "AniTrend",
  "root": {
    "description": "The ultimate companion for tracking anime and manga."
  },
  "home": {
    "title": "AniTrend - The Ultimate Anime Companion",
    "description": "Track anime and manga trends effortlessly, and manage your lists from one unified space."
  }
}
```

- [ ] **Step 6: Install dependencies and verify the project still boots**

Run: `yarn install --immutable`

Expected: install succeeds and updates `yarn.lock` for `next-intl`.

- [ ] **Step 7: Commit the infrastructure checkpoint**

```bash
git add package.json yarn.lock next.config.ts src/i18n/config.ts src/i18n/request.ts messages/en
git commit -m "feat(i18n): add next-intl message infrastructure"
```

### Task 2: Replace `@/copy` Access with Translation Helpers in Layout, Metadata, and Shared UI

**Files:**

- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `src/components/settings/analytics-settings.tsx`
- Modify: `src/components/sections/hero-section.tsx`
- Modify: `src/components/sections/integrations-section.tsx`
- Modify: `src/components/sections/community-section.tsx`
- Modify: `src/components/sections/get-the-app-section.tsx`
- Modify: `src/components/sections/ai-recommender-section.tsx`
- Modify: `src/components/sections/features-section.tsx`
- Modify: `src/components/discover-client.tsx`
- Modify: `src/components/anime-card.tsx`
- Modify: `src/components/anime-preview.tsx`
- Modify: `src/app/discover/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/recommend/page.tsx`
- Modify: `src/app/anime/[id]/page.tsx`

- [ ] **Step 1: Migrate root layout metadata to server translations**

Replace the `copy` import in `src/app/layout.tsx` with `getTranslations` from `next-intl/server` and move static metadata into `generateMetadata`.

```ts
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  const brandName = t('brandName');
  const description = t('root.description');

  return {
    metadataBase: new URL('https://anitrend.com'),
    title: {
      default: brandName,
      template: `%s | ${brandName}`,
    },
    description,
    openGraph: {
      title: brandName,
      description,
      url: '/',
      siteName: brandName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: brandName,
      description,
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}
```

- [ ] **Step 2: Provide locale/messages at the app root**

Wrap the layout body with `NextIntlClientProvider` using the locale and messages provided by `next-intl/server`.

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased min-h-screen bg-background text-foreground`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <Analytics />
            <main className="flex-1">{children}</main>
            <AppFooter />
            <AnalyticsConsentBanner />
            <Toaster />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Migrate page metadata and feature assembly**

Update `src/app/page.tsx` to use server translations and pass already-translated strings into the `features` array.

```ts
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return {
    title: t('home.title'),
    description: t('home.description'),
    openGraph: {
      title: t('home.title'),
      description: t('home.description'),
    },
  };
}

export default async function Home() {
  const marketing = await getTranslations('marketing');

  const features: FeatureItem[] = [
    {
      icon: TrendingUp,
      title: marketing('features.0.title'),
      description: marketing('features.0.description'),
    },
    // keep remaining entries parallel
  ];

  // keep current repository and screenshot loading
}
```

- [ ] **Step 4: Convert client and shared components to namespace-scoped `useTranslations()`**

Example `src/components/header.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function AppHeader() {
  const t = useTranslations('common');

  return <Link href="/dashboard">{t('nav.dashboard')}</Link>;
}
```

Example `src/components/footer.tsx`:

```tsx
import { useTranslations } from 'next-intl';

export function AppFooter() {
  const t = useTranslations('common');

  return <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>;
}
```

Apply the same pattern across pages and sections, using their domain namespace instead of a global `copy` object.

- [ ] **Step 5: Remove the old `@/copy` dependency edge**

After all imports are migrated, delete `src/copy/index.ts` and `src/copy/en/*`.

Run: `rg "@/copy|from '@/copy'|from \"@/copy\"" src`

Expected: no matches.

- [ ] **Step 6: Run typecheck to catch translation API mistakes**

Run: `yarn typecheck`

Expected: PASS with no remaining references to `copy` symbols.

- [ ] **Step 7: Commit the copy-consumer migration**

```bash
git add src/app src/components src/i18n messages src/copy
git commit -m "refactor(i18n): migrate copy consumers to next-intl"
```

### Task 3: Add Inline-String Verification and Sweep Remaining User-Facing Strings

**Files:**

- Modify: `package.json`
- Create: `scripts/check-no-inline-copy.mjs`
- Modify: `src/app/**/*.tsx` (only files with user-facing inline strings)
- Modify: `src/components/**/*.tsx` (only files with user-facing inline strings)

- [ ] **Step 1: Create a conservative inline-copy checker**

Create `scripts/check-no-inline-copy.mjs` that scans `src/app` and `src/components` for likely user-facing JSX string literals while allowing known exclusions.

```js
import { execSync } from 'node:child_process';

const command = [
  'rg',
  '--glob',
  'src/app/**/*.{ts,tsx}',
  '--glob',
  'src/components/**/*.{ts,tsx}',
  '--glob',
  '!src/components/ui/**/*',
  String.raw`">[^<{][^<]*<|"[A-Z][^"\n]{2,}"`,
].join(' ');

const output = execSync(command, {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
}).trim();

if (output) {
  process.stderr.write(`${output}\n`);
  process.exit(1);
}
```

- [ ] **Step 2: Add a package script for the checker**

Update `package.json`.

```json
{
  "scripts": {
    "check:copy": "node scripts/check-no-inline-copy.mjs"
  }
}
```

- [ ] **Step 3: Run the checker and fix the first failing surfaces**

Run: `yarn check:copy`

Expected: FAIL with remaining inline user-facing strings in `src/app/**` or `src/components/**`.

For each flagged surface, move the string into the appropriate `messages/en/*.json` file and replace it with `useTranslations()` or `getTranslations()`.

Example replacement:

```tsx
const t = useTranslations('anime');

<p>{t('actions.linkCopied')}</p>;
```

- [ ] **Step 4: Re-run the copy checker until it passes**

Run: `yarn check:copy`

Expected: PASS with no flagged user-facing inline strings in the covered directories.

- [ ] **Step 5: Commit the enforcement layer**

```bash
git add package.json scripts/check-no-inline-copy.mjs messages/en src/app src/components
git commit -m "chore(i18n): enforce centralized user-facing copy"
```

### Task 4: Build the Typed App Handoff Layer and Migrate Existing CTAs

**Files:**

- Modify: `src/config/links.ts`
- Create: `src/lib/app-handoff.ts`
- Create: `src/components/app-handoff/app-handoff-fallback-dialog.tsx`
- Create: `src/components/app-handoff/open-in-app-button.tsx`
- Modify: `src/components/anime-analytics.tsx`
- Modify: `src/components/dashboard-open-lists-button.tsx`
- Modify: `messages/en/common.json`
- Modify: `messages/en/anime.json`
- Modify: `.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md`

- [ ] **Step 1: Expand the centralized link contract to typed app intents**

Refactor `src/config/links.ts` so the app-route shapes remain centralized but intent metadata becomes explicit.

```ts
export type AppIntent =
  | { type: 'profile' }
  | { type: 'anime-detail'; animeId: string };

export type AppIntentStatus = 'verified' | 'pendingVerification';

export const appIntentStatus: Record<AppIntent['type'], AppIntentStatus> = {
  profile: 'verified',
  'anime-detail': 'pendingVerification',
};

export function getAppIntentHref(intent: AppIntent): string {
  switch (intent.type) {
    case 'profile':
      return 'app.anitrend://action/profile';
    case 'anime-detail':
      return `app.anitrend://action/anime/${intent.animeId}`;
  }
}
```

- [ ] **Step 2: Create the handoff orchestrator**

Create `src/lib/app-handoff.ts` for browser-only handoff logic.

```ts
import { getAppIntentHref, type AppIntent } from '@/config/links';

type OpenAppOptions = {
  timeoutMs?: number;
  onFallback: () => void;
};

export async function openAppIntent(
  intent: AppIntent,
  options: OpenAppOptions
) {
  const timeoutMs = options.timeoutMs ?? 1200;
  const startVisibility = document.visibilityState;

  window.location.assign(getAppIntentHref(intent));

  await new Promise((resolve) => window.setTimeout(resolve, timeoutMs));

  if (startVisibility === 'visible' && document.visibilityState === 'visible') {
    options.onFallback();
  }
}
```

- [ ] **Step 3: Build one shared fallback dialog with action-specific copy**

Create `src/components/app-handoff/app-handoff-fallback-dialog.tsx` using the existing dialog primitives and localized copy.

```tsx
'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { AppIntent } from '@/config/links';

export function AppHandoffFallbackDialog({
  intent,
  open,
  onOpenChange,
}: {
  intent: AppIntent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const common = useTranslations('common');
  const anime = useTranslations('anime');

  const title =
    intent.type === 'profile'
      ? common('handoff.profileFallback.title')
      : anime('handoff.openFallback.title');

  const description =
    intent.type === 'profile'
      ? common('handoff.profileFallback.description')
      : anime('handoff.openFallback.description');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Create one reusable CTA wrapper for app-opening surfaces**

Create `src/components/app-handoff/open-in-app-button.tsx` so current and future surfaces share the same flow.

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AppHandoffFallbackDialog } from '@/components/app-handoff/app-handoff-fallback-dialog';
import { getAppIntentHref, type AppIntent } from '@/config/links';
import { openAppIntent } from '@/lib/app-handoff';

export function OpenInAppButton({
  intent,
  label,
  onAttempt,
}: {
  intent: AppIntent;
  label: React.ReactNode;
  onAttempt?: () => void;
}) {
  const [fallbackOpen, setFallbackOpen] = useState(false);

  return (
    <>
      <Button asChild>
        <a
          href={getAppIntentHref(intent)}
          onClick={(event) => {
            event.preventDefault();
            onAttempt?.();
            void openAppIntent(intent, {
              onFallback: () => setFallbackOpen(true),
            });
          }}
        >
          {label}
        </a>
      </Button>
      <AppHandoffFallbackDialog
        intent={intent}
        open={fallbackOpen}
        onOpenChange={setFallbackOpen}
      />
    </>
  );
}
```

- [ ] **Step 5: Migrate the current CTA surfaces**

Update `src/components/anime-analytics.tsx` and `src/components/dashboard-open-lists-button.tsx` to use the shared wrapper.

Example anime CTA:

```tsx
<OpenInAppButton
  intent={{ type: 'anime-detail', animeId: anime.id }}
  label={
    <>
      <Smartphone className="mr-2 h-5 w-5" /> {t('actions.openInApp')}
    </>
  }
  onAttempt={() => {
    void logEvent('open_in_app', { id: anime.id, title: anime.title });
  }}
/>
```

Example dashboard CTA:

```tsx
<OpenInAppButton
  intent={{ type: 'profile' }}
  label={
    <>
      <Smartphone className="mr-2 h-5 w-5" /> {t('actions.openMyListsInApp')}
    </>
  }
  onAttempt={() => {
    void logEvent('open_in_app', {
      source: 'dashboard',
      target: 'profile',
    });
  }}
/>
```

- [ ] **Step 6: Add fallback dialog copy to the catalogs**

Add intent-specific messages to `messages/en/common.json` and `messages/en/anime.json`.

Example common messages:

```json
{
  "handoff": {
    "dismiss": "Not now",
    "profileFallback": {
      "title": "Couldn\"t open AniTrend",
      "description": "If the AniTrend app is installed, try opening your lists again. Otherwise you can stay here and continue on the web."
    }
  }
}
```

Example anime messages:

```json
{
  "handoff": {
    "openFallback": {
      "title": "Couldn\"t open this anime in AniTrend",
      "description": "Your browser stayed on this page, so the app may not be installed or may not support this handoff yet."
    }
  }
}
```

- [ ] **Step 7: Update the ecosystem surface inventory**

Update `.agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md` so it reflects the new shared handoff component and where the current surfaces now delegate their behavior.

- [ ] **Step 8: Run typecheck and lint after the handoff migration**

Run: `yarn typecheck && yarn lint`

Expected: PASS, with no `copy` imports and no app-handoff type errors.

- [ ] **Step 9: Commit the handoff layer**

```bash
git add src/config/links.ts src/lib/app-handoff.ts src/components/app-handoff src/components/anime-analytics.tsx src/components/dashboard-open-lists-button.tsx messages/en .agents/skills/anitrend-ecosystem-awareness/references/website-surfaces.md
git commit -m "feat(handoff): add shared app intent fallback flow"
```

### Task 5: Add End-to-End Coverage and Final Verification

**Files:**

- Modify: `tests/details.spec.ts`
- Create: `tests/dashboard.spec.ts`
- Modify: `playwright.config.ts` (only if the dev command must be corrected)
- Modify: `.github/instructions/context.instructions.md` (if architecture wording needs updating)

- [ ] **Step 1: Add a dashboard fallback test**

Create `tests/dashboard.spec.ts`.

```ts
import { test, expect } from '@playwright/test';

test('shows a fallback prompt when profile app handoff does not open the app', async ({
  page,
}) => {
  await page.goto('/dashboard');

  await page.getByRole('link', { name: /open my lists in app/i }).click();

  await expect(
    page.getByRole('heading', { name: /couldn't open anitrend/i })
  ).toBeVisible();
});
```

- [ ] **Step 2: Extend the anime details test with fallback coverage**

Append to `tests/details.spec.ts`.

```ts
test('shows anime-specific fallback copy when app handoff does not open', async ({
  page,
}) => {
  await page.goto('/anime/1');

  await page.getByRole('link', { name: /open in app/i }).click();

  await expect(
    page.getByRole('heading', { name: /couldn't open this anime in anitrend/i })
  ).toBeVisible();
});
```

- [ ] **Step 3: Run the targeted tests before the full suite**

Run: `yarn test:e2e tests/dashboard.spec.ts tests/details.spec.ts`

Expected: PASS for the new fallback coverage.

- [ ] **Step 4: Run the full verification suite**

Run: `yarn check:copy && yarn typecheck && yarn lint && yarn build && yarn test:e2e`

Expected: all commands pass.

- [ ] **Step 5: Update architecture docs if the new handoff/i18n structure changes project guidance**

If the implementation adds a stable `src/i18n/` layer and reusable `src/components/app-handoff/` surface, update `.github/instructions/context.instructions.md` to document:

```md
- Localized copy is served through `next-intl` catalogs under `messages/en/*` and request config in `src/i18n/`
- App-opening CTAs should delegate to the shared app handoff components instead of owning custom-scheme logic inline
```

- [ ] **Step 6: Commit the tests and documentation**

```bash
git add tests playwright.config.ts .github/instructions/context.instructions.md
git commit -m "test(handoff): cover app fallback prompts"
```

## Self-Review

- Spec coverage: the plan covers `next-intl` adoption, `en`-only rollout, unchanged URLs, no hard-coded strings enforcement, shared typed app handoff, action-specific fallback prompts, and verification/documentation updates.
- Placeholder scan: no `TODO`/`TBD` markers remain in the plan; each task names concrete files, commands, and representative code.
- Type consistency: the plan consistently uses `AppIntent`, `profile`, `anime-detail`, `getAppIntentHref()`, and `openAppIntent()` across the handoff tasks.

Plan complete and saved to `docs/superpowers/plans/2026-04-22-copy-i18n-and-app-handoff.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
