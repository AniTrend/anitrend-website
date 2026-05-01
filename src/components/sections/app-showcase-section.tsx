import Image from 'next/image';
import { Palette } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { AppScreenshot } from '@/lib/screenshots-service';
import { SectionIntro } from '@/components/sections/section-intro';

export async function AppShowcaseSection({
  screenshots,
}: {
  screenshots: AppScreenshot[];
}) {
  const t = await getTranslations('marketing');
  const [featured, ...supporting] = screenshots;

  return (
    <section id="app-showcase" className="scroll-mt-24 py-20 md:py-24">
      <div className="container">
        <SectionIntro
          badge={t('appShowcase.badge')}
          title={t('appShowcase.title')}
          description={t('appShowcase.description')}
          align="center"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,24,52,0.95),rgba(10,12,26,0.98))] p-6 shadow-[0_24px_80px_rgba(4,6,20,0.35)]">
            <div className="mb-5 flex items-center gap-3 text-primary">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <Palette className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">
                  {t('appShowcase.badge')}
                </p>
                <p className="text-sm text-slate-300">{t('appShowcase.featuredLabel')}</p>
              </div>
            </div>
            {featured ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                <Image
                  src={featured.src}
                  alt={featured.alt}
                  width={720}
                  height={1080}
                  className="mx-auto rounded-[1.25rem] object-cover shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                  data-ai-hint={featured.hint}
                />
              </div>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {supporting.slice(0, 4).map((image) => (
              <div
                key={image.src}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-card/80 p-4 shadow-[0_18px_50px_rgba(4,6,20,0.2)]"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={320}
                  height={640}
                  className="mx-auto rounded-[1rem] object-cover"
                  data-ai-hint={image.hint}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
