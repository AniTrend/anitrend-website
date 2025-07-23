import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import type { Anime } from '@/lib/types';
import { DiscoverClient } from '@/components/discover-client';

async function getTopAnime(): Promise<Anime[]> {
  try {
    const response = await fetch('https://api.jikan.moe/v4/top/anime');
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

export default async function DiscoverPage() {
  const topAnime = await getTopAnime();

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <DiscoverClient initialAnime={topAnime} />
      </main>
      <AppFooter />
    </div>
  );
}
