import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { DiscoverClient } from '@/components/discover-client';
import { getTopAnime } from '@/lib/anime-service';

export const metadata = {
  title: 'Discover Anime - AniTrend',
  description:
    'Explore and discover new anime series with advanced filtering options.',
};

export default async function DiscoverPage() {
  // Fetch initial anime with default settings (SFW, 25 limit)
  const topAnime = await getTopAnime({
    limit: 25,
    sfw: true,
  });

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
