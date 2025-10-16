import { Compass, LayoutDashboard, Wand2, Menu } from 'lucide-react';
import AnalyticsSettings from '@/components/settings/analytics-settings';
import { siGithub } from 'simple-icons';
import Link from 'next/link';
import Image from 'next/image';
import { Button, buttonVariants } from './ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Left side: Logo + Page Links */}
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="AniTrend Logo"
              width={24}
              height={24}
              className="h-6 w-6 rounded-full"
            />
            <span className="font-headline text-lg">
              <span className="font-medium">Ani</span>
              <span className="font-bold text-primary">Trend</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: 'ghost',
                className: 'text-foreground/60 hover:text-foreground/80',
              })}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/discover"
              className={buttonVariants({
                variant: 'ghost',
                className: 'text-foreground/60 hover:text-foreground/80',
              })}
            >
              <Compass className="mr-2 h-4 w-4" />
              Discover
            </Link>
            <Link
              href="/recommend"
              className={buttonVariants({
                variant: 'ghost',
                className: 'text-foreground/60 hover:text-foreground/80',
              })}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Recommend
            </Link>
          </nav>
        </div>

        {/* Right side: Anchor Links + CTAs + Mobile Menu */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Desktop nav links */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/#features"
              className={buttonVariants({
                variant: 'link',
                className: 'text-foreground/60',
              })}
            >
              Features
            </Link>
            <Link
              href="/#integrations"
              className={buttonVariants({
                variant: 'link',
                className: 'text-foreground/60',
              })}
            >
              Integrations
            </Link>
            <Button asChild>
              <Link href="/#get-the-app">Get Started</Link>
            </Button>
          </nav>
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs">
              <nav className="flex flex-col space-y-4 mt-4">
                <Link href="/dashboard" className="flex items-center text-lg">
                  <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                </Link>
                <Link href="/discover" className="flex items-center text-lg">
                  <Compass className="mr-2 h-5 w-5" /> Discover
                </Link>
                <Link href="/recommend" className="flex items-center text-lg">
                  <Wand2 className="mr-2 h-5 w-5" /> Recommend
                </Link>
                <AnalyticsSettings />
                <Link href="/#features" className="text-lg">
                  Features
                </Link>
                <Link href="/#integrations" className="text-lg">
                  Integrations
                </Link>
                <Button asChild className="w-full">
                  <Link href="/#get-the-app">Get Started</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <AnalyticsSettings />
          <Button asChild variant="ghost" size="icon">
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
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
