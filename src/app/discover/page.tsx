import { AppHeader } from '@/components/header';
import { AppFooter } from '@/components/footer';
import { DiscoverClient } from '@/components/discover-client';
import { getTopAnime } from '@/lib/anime-service';

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
