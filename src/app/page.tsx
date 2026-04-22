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
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return {
    title: t('home.title'),
    description: t('home.description'),
    openGraph: {
      title: t('home.title'),
      description: t('home.description'),
    },
  };
}

export default async function Home() {
  const marketing = await getTranslations('marketing');
  const features: FeatureItem[] = [
    {
      icon: TrendingUp,
      title: marketing('features.stayInLoop.title'),
      description: marketing('features.stayInLoop.description'),
    },
    {
      icon: Search,
      title: marketing('features.findExactlyWhatYouLove.title'),
      description: marketing('features.findExactlyWhatYouLove.description'),
    },
    {
      icon: Star,
      title: marketing('features.rateYourWay.title'),
      description: marketing('features.rateYourWay.description'),
    },
    {
      icon: Feather,
      title: marketing('features.smartAndEfficient.title'),
      description: marketing('features.smartAndEfficient.description'),
    },
  ];

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
