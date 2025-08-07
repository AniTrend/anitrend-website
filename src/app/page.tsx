import {
  playStoreUrl,
  githubReleasesUrl,
  discordInviteUrl,
  githubOrgUrl,
  supabaseBannerUrl,
  fallbackRepos,
} from '@/config/links';
import { TrendingUp, Search, Star, Feather } from 'lucide-react';
import { getRepositoriesForDisplay } from '@/lib/github-service';
import { getShowcaseScreenshots } from '@/lib/screenshots-service';
import { HeroSection } from '@/components/sections/hero-section';
import { IntegrationsSection } from '@/components/sections/integrations-section';
import {
  FeaturesSection,
  type FeatureItem,
} from '@/components/sections/features-section';
import { AppShowcaseSection } from '@/components/sections/app-showcase-section';
import { AIRecommenderSection } from '@/components/sections/ai-recommender-section';
import { GetTheAppSection } from '@/components/sections/get-the-app-section';
import { CommunitySection } from '@/components/sections/community-section';

const features: FeatureItem[] = [
  {
    icon: TrendingUp,
    title: 'Stay in the Loop',
    description:
      'Track anime and manga trends effortlessly, and manage your lists from one unified space.',
  },
  {
    icon: Search,
    title: 'Find Exactly What You Love',
    description:
      'Effortlessly search anime, manga, characters, and creators with our powerful search engine.',
  },
  {
    icon: Star,
    title: 'Rate Your Way',
    description:
      'Personalize your experience with flexible rating systems tailored just for you.',
  },
  {
    icon: Feather,
    title: 'Smart and Efficient',
    description:
      "AniTrend intelligently adapts to your device's settings to optimize battery and data usage.",
  },
];

export default async function Home() {
  // Fetch repositories from GitHub API
  let repositories;
  try {
    repositories = await getRepositoriesForDisplay({
      pinned: true, // Explicitly use pinned repositories
      limit: 6,
    });
  } catch (error) {
    console.error('Failed to load repositories:', error);
    // Fallback to static data if API fails
    repositories = fallbackRepos;
  }

  // Get curated screenshots for the showcase
  const showcaseScreenshots = getShowcaseScreenshots();
  return (
    <>
      <HeroSection githubOrgUrl={githubOrgUrl} />
      <IntegrationsSection repositories={repositories} />
      <FeaturesSection features={features} />
      <AppShowcaseSection screenshots={showcaseScreenshots} />
      <AIRecommenderSection />
      <GetTheAppSection
        playStoreUrl={playStoreUrl}
        githubReleasesUrl={githubReleasesUrl}
      />
      <CommunitySection
        supabaseBannerUrl={supabaseBannerUrl}
        discordInviteUrl={discordInviteUrl}
      />
    </>
  );
}
