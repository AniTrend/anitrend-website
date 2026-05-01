import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardAppShortcuts } from '@/components/dashboard-app-shortcuts';
import { DashboardOpenListsButton } from '@/components/dashboard-open-lists-button';
import { ArrowRight, ListChecks, Rocket, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getTopAnime } from '@/lib/anime-service';

type Recommendation = {
  id: string;
  title: string;
  imageUrl?: string;
  synopsis?: string | null;
};

async function fetchRecommendationTeasers(): Promise<Recommendation[]> {
  try {
    const upcoming = await getTopAnime({
      filter: 'upcoming',
      limit: 9,
      sfw: true,
    });
    return upcoming.slice(0, 6).map((anime) => ({
      id: anime.id,
      title: anime.title,
      imageUrl: anime.imageUrl,
      synopsis: anime.synopsis,
    }));
  } catch (error) {
    console.error('Failed to load recommendation teasers', error);
    return [];
  }
}

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const discoverShortcuts = [
    {
      title: t('shortcuts.items.topAiring.title'),
      description: t('shortcuts.items.topAiring.description'),
      href: '/discover?filter=airing&sfw=true',
    },
    {
      title: t('shortcuts.items.upcoming.title'),
      description: t('shortcuts.items.upcoming.description'),
      href: '/discover?filter=upcoming&sfw=true',
    },
    {
      title: t('shortcuts.items.highlyRated.title'),
      description: t('shortcuts.items.highlyRated.description'),
      href: '/discover?min_score=8&sfw=true',
    },
    {
      title: t('shortcuts.items.moviesOnly.title'),
      description: t('shortcuts.items.moviesOnly.description'),
      href: '/discover?type=movie&sfw=true',
    },
  ];
  const recs = await fetchRecommendationTeasers();

  return (
    <main className="flex-1 py-12 md:py-16">
      <div className="container space-y-12">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(141,92,255,0.22),transparent_30%),linear-gradient(180deg,rgba(20,24,52,0.92),rgba(10,12,26,0.98))] px-6 py-8 text-center shadow-[0_28px_100px_rgba(4,6,20,0.32)] md:px-10 md:py-10">
          <div className="space-y-4">
            <div className="flex justify-center">
              <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-primary/90">
                {t('hero.badge')}
              </span>
            </div>
            <div className="flex justify-center">
              <ListChecks className="h-14 w-14 text-primary" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl font-headline">
              {t('hero.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              {t('hero.description')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <DashboardOpenListsButton />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[1.75rem] border border-white/10 bg-card/70 p-6 shadow-[0_24px_70px_rgba(4,6,20,0.18)]">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t('appShortcuts.title')}</h2>
              <Badge variant="outline">{t('appShortcuts.badge')}</Badge>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {t('appShortcuts.description')}
            </p>
          </div>
          <DashboardAppShortcuts />
        </section>

        <section className="space-y-4 rounded-[1.75rem] border border-white/10 bg-card/70 p-6 shadow-[0_24px_70px_rgba(4,6,20,0.18)]">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('shortcuts.title')}</h2>
            <Badge variant="secondary">{t('shortcuts.badge')}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {discoverShortcuts.map((shortcut) => (
              <Card key={shortcut.title} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {shortcut.title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={shortcut.href}>{t('shortcuts.cta')}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-[1.75rem] border border-white/10 bg-card/70 p-6 shadow-[0_24px_70px_rgba(4,6,20,0.18)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('upcoming.title')}</h2>
            <Badge variant="outline">{t('upcoming.badge')}</Badge>
          </div>
          {recs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {recs.map((rec) => (
                <Card
                  key={rec.id}
                  className="overflow-hidden bg-secondary/30 border-secondary/50"
                >
                  <CardContent className="p-0">
                    <Link href={`/anime/${rec.id}`} className="block">
                      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                        {rec.imageUrl ? (
                          <Image
                            src={rec.imageUrl}
                            alt={rec.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 20vw"
                          />
                        ) : null}
                      </div>
                      <div className="p-3 space-y-2">
                        <CardTitle className="text-sm leading-snug line-clamp-2">
                          {rec.title}
                        </CardTitle>
                        {rec.synopsis ? (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {rec.synopsis}
                          </p>
                        ) : null}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t('upcoming.itemStatus')}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {t('upcoming.emptyState')}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
