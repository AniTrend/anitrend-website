'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { AnimeCard } from '@/components/anime-card';
import Balancer from 'react-wrap-balancer';
import { Search } from 'lucide-react';
import type { Anime } from '@/lib/types';

export function DiscoverClient({ initialAnime }: { initialAnime: Anime[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnime = initialAnime.filter((anime) =>
    anime.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-headline">
              Discover Anime
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              <Balancer>
                Explore our vast collection of anime. Use the search below to find your next favorite series.
              </Balancer>
            </p>
          </div>
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for an anime..."
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-32">
        <div className="container">
          {filteredAnime.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredAnime.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No anime found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
