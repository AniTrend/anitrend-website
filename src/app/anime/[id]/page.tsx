import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star, Tv, Calendar, Users, Award } from 'lucide-react';
import Balancer from 'react-wrap-balancer';
import { getAnimeById } from '@/lib/anime-service';
import {
  TrackAnimeView,
  OpenInAppButton,
  ShareButton,
} from '@/components/anime-analytics';

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anime = await getAnimeById(id);

  if (!anime) {
    notFound();
  }

  return (
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
                <OpenInAppButton anime={anime} />
                <div className="mt-2">
                  <ShareButton anime={anime} />
                </div>
              </div>
            </div>
          </aside>
          <div className="md:col-span-8 lg:col-span-9">
            <TrackAnimeView anime={anime} />
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
              <h2 className="text-xl font-semibold font-headline">Synopsis</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {anime.synopsis || 'No synopsis available.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
