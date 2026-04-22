import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Balancer from 'react-wrap-balancer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github } from 'lucide-react';
import { AnimePreview } from '@/components/anime-preview';

export async function HeroSection({ githubOrgUrl }: { githubOrgUrl: string }) {
  const t = await getTranslations('marketing');

  return (
    <section id="hero" className="py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center text-center md:text-left max-w-xl mx-auto md:mx-0 md:max-w-none">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl font-headline">
              <Balancer>{t('hero.title')}</Balancer>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              <Balancer>{t('hero.description')}</Balancer>
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="#get-the-app">
                  {t('hero.cta.getStarted')}{' '}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href={githubOrgUrl} target="_blank" rel="noreferrer">
                  <Github className="mr-2 h-5 w-5" />
                  {t('hero.cta.viewOnGitHub')}
                </Link>
              </Button>
            </div>
          </div>
          {/* Anime preview: centered on mobile, right-aligned on md+ */}
          <div className="flex justify-center md:justify-end mt-8 md:mt-0">
            <AnimePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
