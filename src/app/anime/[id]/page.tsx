import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Tv, Calendar, Smartphone, Users, Award } from 'lucide-react';
import Balancer from 'react-wrap-balancer';
import { getAnimeById } from '@/lib/anime-service';

export default async function AnimeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const anime = await getAnimeById(id);

  if (!anime) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12">
            <aside className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-24">
                <Image
                  src={anime.imageUrl}
                  alt={anime.title}
                  width={300}
                  height={450}
                  className="w-full h-auto rounded-lg shadow-lg"
                  data-ai-hint={`${anime.title} anime poster`}
                />
                <div className="mt-4 space-y-2">
                  <Button asChild className="w-full" size="lg">
                    <a href={`anitrend://anime/${anime.id}`}>
                      <Smartphone className="mr-2 h-5 w-5" /> Open in App
                    </a>
                  </Button>
                </div>
              </div>
            </aside>
            <div className="md:col-span-8 lg:col-span-9">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                <Balancer>{anime.title}</Balancer>
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-lg">
                    {anime.score ? anime.score.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="w-5 h-5" />
                  <span>Rank #{anime.rank}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{anime.popularity.toLocaleString()} users</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Tv className="w-5 h-5" />
                  <span>{anime.episodes || '?'} episodes</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {anime.season
                      ? `${anime.season} ${anime.year}`
                      : anime.year || ''}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold font-headline">
                  Synopsis
                </h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {anime.synopsis || 'No synopsis available.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
