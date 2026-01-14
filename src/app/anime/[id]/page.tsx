import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star, Tv, Calendar, Users, Award } from 'lucide-react';
import Balancer from 'react-wrap-balancer';
import { getAnimeById, getAnimeCharacters } from '@/lib/anime-service';
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
  const characters = await getAnimeCharacters(id);

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

              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-lg font-headline border-b pb-2">
                  Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold block text-foreground/80">
                      Aired
                    </span>
                    <span className="text-muted-foreground">{anime.aired}</span>
                  </div>
                  {anime.studios.length > 0 && (
                    <div>
                      <span className="font-semibold block text-foreground/80">
                        Studios
                      </span>
                      <span className="text-muted-foreground">
                        {anime.studios.join(', ')}
                      </span>
                    </div>
                  )}
                  {anime.producers.length > 0 && (
                    <div>
                      <span className="font-semibold block text-foreground/80">
                        Producers
                      </span>
                      <span className="text-muted-foreground">
                        {anime.producers.join(', ')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold block text-foreground/80">
                      Duration
                    </span>
                    <span className="text-muted-foreground">
                      {anime.duration}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold block text-foreground/80">
                      Rating
                    </span>
                    <span className="text-muted-foreground">
                      {anime.rating}
                    </span>
                  </div>
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

            <div className="mt-8 space-y-8">
              <section>
                <h2 className="text-xl font-semibold font-headline mb-3">
                  Synopsis
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {anime.synopsis || 'No synopsis available.'}
                </p>
              </section>

              {anime.background && (
                <section>
                  <h2 className="text-xl font-semibold font-headline mb-3">
                    Background
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {anime.background}
                  </p>
                </section>
              )}

              {anime.trailer?.embedUrl && (
                <section>
                  <h2 className="text-xl font-semibold font-headline mb-3">
                    Trailer
                  </h2>
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <iframe
                      src={anime.trailer.embedUrl}
                      title={`${anime.title} Trailer`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}

              {characters.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold font-headline mb-4">
                    Characters
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {characters.slice(0, 12).map((char) => (
                      <div
                        key={char.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={char.imageUrl}
                            alt={char.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-medium text-sm truncate"
                            title={char.name}
                          >
                            {char.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {char.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
