import { Compass, LayoutDashboard, Menu } from 'lucide-react';
import AnalyticsSettings from '@/components/settings/analytics-settings';
import { siGithub } from 'simple-icons';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button, buttonVariants } from './ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

export async function AppHeader() {
  const t = await getTranslations('common');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-18 max-w-screen-2xl items-center gap-4">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt={t('brand.logoAlt')}
              width={24}
              height={24}
              className="h-8 w-8 rounded-full ring-2 ring-primary/30"
            />
            <span className="font-headline text-lg tracking-tight">
              <span className="font-medium">{t('brand.wordmarkPrefix')}</span>
              <span className="font-bold text-primary">
                {t('brand.wordmarkHighlight')}
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm md:flex">
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: 'ghost',
                className:
                  'rounded-full text-foreground/70 hover:bg-white/10 hover:text-foreground',
              })}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {t('nav.dashboard')}
            </Link>
            <Link
              href="/discover"
              className={buttonVariants({
                variant: 'ghost',
                className:
                  'rounded-full text-foreground/70 hover:bg-white/10 hover:text-foreground',
              })}
            >
              <Compass className="mr-2 h-4 w-4" />
              {t('nav.discover')}
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/#features"
              className={buttonVariants({
                variant: 'link',
                className: 'text-foreground/65 hover:text-foreground',
              })}
            >
              {t('nav.features')}
            </Link>
            <Link
              href="/#integrations"
              className={buttonVariants({
                variant: 'link',
                className: 'text-foreground/65 hover:text-foreground',
              })}
            >
              {t('nav.integrations')}
            </Link>
            <Button asChild variant="outline" className="border-white/15 bg-white/5">
              <Link href="/#open-in-app">{t('actions.openInApp')}</Link>
            </Button>
            <Button asChild className="shadow-[0_16px_40px_rgba(141,92,255,0.28)]">
              <Link href="/#get-the-app">{t('nav.getStarted')}</Link>
            </Button>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('nav.menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs border-white/10 bg-background/95">
              <nav className="flex flex-col space-y-4 mt-4">
                <Link href="/dashboard" className="flex items-center text-lg">
                  <LayoutDashboard className="mr-2 h-5 w-5" />{' '}
                  {t('nav.dashboard')}
                </Link>
                <Link href="/discover" className="flex items-center text-lg">
                  <Compass className="mr-2 h-5 w-5" /> {t('nav.discover')}
                </Link>
                <AnalyticsSettings />
                <Link href="/#features" className="text-lg">
                  {t('nav.features')}
                </Link>
                <Link href="/#integrations" className="text-lg">
                  {t('nav.integrations')}
                </Link>
                <Button asChild variant="outline" className="w-full border-white/15 bg-white/5">
                  <Link href="/#open-in-app">{t('actions.openInApp')}</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/#get-the-app">{t('nav.getStarted')}</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <AnalyticsSettings />
          <Button asChild variant="ghost" size="icon" className="border border-white/10 bg-white/5">
            <Link
              href="https://github.com/AniTrend"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d={siGithub.path} />
              </svg>
              <span className="sr-only">{t('external.github')}</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
