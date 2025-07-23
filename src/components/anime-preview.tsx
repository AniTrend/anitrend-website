import { AnimeCard } from '@/components/anime-card';
import type { Anime } from '@/lib/types';

async function getTopAnime(): Promise<Anime[]> {
  try {
    const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=15');
    if (!response.ok) {
        console.error("Failed to fetch top anime from Jikan API");
        return [];
    }
    const { data } = await response.json();

    return data.map((anime: any): Anime => ({
      id: anime.mal_id.toString(),
      title: anime.title_english || anime.title,
      synopsis: anime.synopsis,
      genres: anime.genres.map((g: any) => g.name),
      score: anime.score,
      imageUrl: anime.images.jpg.large_image_url,
      episodes: anime.episodes,
      year: anime.year,
      season: anime.season,
      rank: anime.rank,
      popularity: anime.popularity,
      status: anime.status,
    }));
  } catch (error) {
    console.error('Failed to fetch top anime:', error);
    return [];
  }
}

export async function AnimePreview() {
  const topAnime = await getTopAnime();

  if (!topAnime.length) {
    return null;
  }
  
  // Duplicate the array for a seamless marquee loop
  const allAnime = [...topAnime, ...topAnime, ...topAnime, ...topAnime]; 

  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,#000_10%,#000_90%,transparent_100%)]">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {allAnime.map((anime, index) => (
          <div key={`${anime.id}-${index}`} className="px-3 py-3 flex-shrink-0 w-60">
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
    </div>
  );
}
