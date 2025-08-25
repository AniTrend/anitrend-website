'use client';

import * as React from 'react';
import { AnimeCard } from '@/components/anime-card';
import { getTopAnime } from '@/lib/anime-service';
import type { Anime } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

export function AnimePreview() {
  const isMobile = useIsMobile();
  const [items, setItems] = React.useState<Anime[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const limit = isMobile ? 3 : 8;
      const data = await getTopAnime({
        limit,
        page: 1,
        sfw: true,
        filter: 'airing',
      });
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isMobile]);

  if (loading || !items.length) {
    return null;
  }

  const desktopItems = [...items, ...items, ...items, ...items];

  return (
    <>
      {/* Mobile version: simple 3-card layout */}
      <div className="sm:hidden flex gap-3 justify-center">
        {items.map((anime) => (
          <div key={anime.id} className="w-32 flex-shrink-0">
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>

      {/* Desktop version: full marquee */}
      <div className="hidden sm:block relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_10%,#000_90%,transparent_100%)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {desktopItems.map((anime, index) => (
            <div
              key={`${anime.id}-${index}`}
              className="px-3 py-3 flex-shrink-0 w-60"
            >
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
