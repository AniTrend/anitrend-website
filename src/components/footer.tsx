import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function AppFooter() {
  const t = await getTranslations('common');

  return (
    <footer className="border-t border-white/10 bg-black/20 py-8">
      <div className="container flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <div className="font-headline text-lg tracking-tight">
            <span className="font-medium">{t('brand.wordmarkPrefix')}</span>
            <span className="font-bold text-primary">
              {t('brand.wordmarkHighlight')}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="https://docs.anitrend.co/project/faq"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            {t('footer.faq')}
          </Link>
          <Link
            href="https://github.com/AniTrend/anitrend-v2/blob/develop/TERMS_OF_SERVICE.md"
            className="transition-colors hover:text-foreground"
          >
            {t('footer.termsOfService')}
          </Link>
          <Link
            href="https://github.com/AniTrend/anitrend-v2/blob/develop/TERMS_OF_SERVICE.md#privacy-policy"
            className="transition-colors hover:text-foreground"
          >
            {t('footer.privacyPolicy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
