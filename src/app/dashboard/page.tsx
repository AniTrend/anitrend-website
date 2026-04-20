import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardOpenListsButton } from '@/components/dashboard-open-lists-button';
import { ArrowRight, ListChecks, Rocket, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getTopAnime } from '@/lib/anime-service';
import { copy } from '@/copy';

type Recommendation = {
  id: string;
  title: string;
  imageUrl?: string;
  synopsis?: string | null;
};

const discoverShortcuts = [
  {
    title: copy.dashboard.shortcuts.items[0].title,
    description: copy.dashboard.shortcuts.items[0].description,
    href: '/discover?filter=airing&sfw=true',
  },
  {
    title: copy.dashboard.shortcuts.items[1].title,
    description: copy.dashboard.shortcuts.items[1].description,
    href: '/discover?filter=upcoming&sfw=true',
  },
  {
    title: copy.dashboard.shortcuts.items[2].title,
    description: copy.dashboard.shortcuts.items[2].description,
    href: '/discover?min_score=8&sfw=true',
  },
  {
    title: copy.dashboard.shortcuts.items[3].title,
    description: copy.dashboard.shortcuts.items[3].description,
    href: '/discover?type=movie&sfw=true',
  },
];

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
  const recs = await fetchRecommendationTeasers();

  return (
    <main className="flex-1 py-12 md:py-16">
      <div className="container space-y-12">
        <section className="text-center space-y-4">
          <div className="flex justify-center">
            <ListChecks className="w-14 h-14 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-headline">
            {copy.dashboard.hero.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {copy.dashboard.hero.description}
          </p>
          <div className="flex items-center justify-center gap-3">
            <DashboardOpenListsButton />
            <Button asChild variant="outline" size="lg">
              <Link href="/recommend">
                <Sparkles className="mr-2 h-5 w-5" />
                {copy.dashboard.hero.cta.aiRecommendations}
              </Link>
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {copy.dashboard.shortcuts.title}
            </h2>
            <Badge variant="secondary">{copy.dashboard.shortcuts.badge}</Badge>
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
                    <Link href={shortcut.href}>
                      {copy.dashboard.shortcuts.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {copy.dashboard.upcoming.title}
            </h2>
            <Badge variant="outline">{copy.dashboard.upcoming.badge}</Badge>
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
                          <span>{copy.dashboard.upcoming.itemStatus}</span>
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
                {copy.dashboard.upcoming.emptyState}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
