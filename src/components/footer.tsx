import { Tv2 } from 'lucide-react';
import Link from 'next/link';

export function AppFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Tv2 className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">
              <span className="font-medium">Ani</span>
              <span className="font-bold text-primary">Trend</span>
            </span>
          </Link>
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AniTrend
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="https://docs.anitrend.co/project/faq"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
          <Link
            href="https://github.com/AniTrend/anitrend-v2/blob/develop/TERMS_OF_SERVICE.md"
            className="transition-colors hover:text-foreground"
          >
            Terms of Service
          </Link>
          <Link
            href="https://github.com/AniTrend/anitrend-v2/blob/develop/TERMS_OF_SERVICE.md#privacy-policy"
            className="transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
