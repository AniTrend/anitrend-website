import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Balancer from 'react-wrap-balancer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Sparkles } from 'lucide-react';
import { AnimePreview } from '@/components/anime-preview';

export async function HeroSection({ githubOrgUrl }: { githubOrgUrl: string }) {
  const t = await getTranslations('marketing');

  return (
    <section id="hero" className="py-12 md:py-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(141,92,255,0.28),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.16),transparent_24%),linear-gradient(180deg,rgba(18,21,44,0.94),rgba(8,10,24,0.98))] px-6 py-8 shadow-[0_32px_120px_rgba(4,6,20,0.45)] md:px-10 md:py-12">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="flex flex-col gap-6 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-primary/90">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('hero.kicker')}
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl font-headline">
                <Balancer>{t('hero.title')}</Balancer>
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                <Balancer>{t('hero.description')}</Balancer>
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button asChild size="lg" className="w-full shadow-[0_18px_48px_rgba(141,92,255,0.3)] sm:w-auto">
                  <Link href="#get-the-app">
                    {t('hero.cta.getStarted')}{' '}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                >
                  <Link href={githubOrgUrl} target="_blank" rel="noreferrer">
                    <Github className="mr-2 h-5 w-5" />
                    {t('hero.cta.viewOnGitHub')}
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left">
                  <p className="text-sm font-semibold text-white">
                    {t('hero.panels.discovery.title')}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {t('hero.panels.discovery.description')}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left">
                  <p className="text-sm font-semibold text-white">
                    {t('hero.panels.handoff.title')}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {t('hero.panels.handoff.description')}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center md:justify-end">
              <div className="pointer-events-none absolute inset-x-8 inset-y-6 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative w-full rounded-[1.75rem] border border-white/10 bg-black/20 p-4 backdrop-blur">
                <AnimePreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
