import Link from 'next/link';
import { copy } from '@/copy';

export function AppFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {copy.common.footer.copyright(new Date().getFullYear())}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="https://docs.anitrend.co/project/faq"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            {copy.common.footer.faq}
          </Link>
          <Link
            href="https://github.com/AniTrend/anitrend-v2/blob/develop/TERMS_OF_SERVICE.md"
            className="transition-colors hover:text-foreground"
          >
            {copy.common.footer.termsOfService}
          </Link>
          <Link
            href="https://github.com/AniTrend/anitrend-v2/blob/develop/TERMS_OF_SERVICE.md#privacy-policy"
            className="transition-colors hover:text-foreground"
          >
            {copy.common.footer.privacyPolicy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
