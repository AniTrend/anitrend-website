import { AnimeCard } from '@/components/anime-card';
import { getTopAnime } from '@/lib/anime-service';

export async function AnimePreview() {
  const topAnime = await getTopAnime({
    limit: 8,
    page: 1,
    sfw: true,
    filter: 'airing',
  });

  if (!topAnime.length) {
    return null;
  }

  // Duplicate the array for a seamless marquee loop
  const allAnime = [...topAnime, ...topAnime, ...topAnime, ...topAnime];

  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_10%,#000_90%,transparent_100%)]">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {allAnime.map((anime, index) => (
          <div
            key={`${anime.id}-${index}`}
            className="px-3 py-3 flex-shrink-0 w-60"
          >
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
    </div>
  );
}
