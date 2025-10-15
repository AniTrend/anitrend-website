import { DiscoverClient } from '@/components/discover-client';
import { getTopAnime } from '@/lib/anime-service';

export const metadata = {
  title: 'Discover Anime - AniTrend',
  description:
    'Explore and discover new anime series with advanced filtering options.',
};

export default async function DiscoverPage() {
  // Fetch initial anime with default settings (SFW, 25 limit)
  // This call now uses intelligent caching that respects Jikan API cache control headers
  // The cache duration is automatically calculated based on the API's Expires header
  // with smart fallbacks for different data types (top anime: 5min, details: 1hr, etc.)
  const topAnime = await getTopAnime({
    limit: 25,
    sfw: true,
  });

  return <DiscoverClient initialAnime={topAnime} />;
}
