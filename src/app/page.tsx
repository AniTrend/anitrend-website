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
import type { Metadata } from 'next';
import { copy } from '@/copy';

export const metadata: Metadata = {
  title: copy.metadata.home.title,
  description: copy.metadata.home.description,
  openGraph: {
    title: copy.metadata.home.title,
    description: copy.metadata.home.description,
  },
};
const features: FeatureItem[] = [
  {
    icon: TrendingUp,
    title: copy.marketing.features[0].title,
    description: copy.marketing.features[0].description,
  },
  {
    icon: Search,
    title: copy.marketing.features[1].title,
    description: copy.marketing.features[1].description,
  },
  {
    icon: Star,
    title: copy.marketing.features[2].title,
    description: copy.marketing.features[2].description,
  },
  {
    icon: Feather,
    title: copy.marketing.features[3].title,
    description: copy.marketing.features[3].description,
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
