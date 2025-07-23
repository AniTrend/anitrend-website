import { Compass, Github, Tv2, Wand2 } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Left side: Logo + Page Links */}
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Tv2 className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">
              <span className="font-medium">Ani</span>
              <span className="font-bold text-primary">Trend</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Link
              href="/discover"
              className={buttonVariants({
                variant: "ghost",
                className: "text-foreground/60 hover:text-foreground/80",
              })}
            >
              <Compass className="mr-2 h-4 w-4" />
              Discover
            </Link>
            <Link
              href="/recommend"
              className={buttonVariants({
                variant: "ghost",
                className: "text-foreground/60 hover:text-foreground/80",
              })}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Recommend
            </Link>
          </nav>
        </div>

        {/* Right side: Anchor Links + CTAs */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/#features"
              className={buttonVariants({ variant: "link", className: "text-foreground/60" })}
            >
              Features
            </Link>
            <Link
              href="/#integrations"
              className={buttonVariants({ variant: "link", className: "text-foreground/60" })}
            >
              Integrations
            </Link>
            <Button asChild>
              <Link href="/#get-the-app">Get Started</Link>
            </Button>
          </nav>
          <Button asChild variant="ghost" size="icon">
            <Link
              href="https://github.com/AniTrend"
              target="_blank"
              rel="noreferrer"
            >
              <Github />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
