// Centralized external links and configuration

export const playStoreUrl =
  'https://play.google.com/store/apps/details?id=com.mxt.anitrend';
export const githubReleasesUrl =
  'https://github.com/AniTrend/anitrend-app/releases';
// Discord invite URL built from code in env
const discordCode = process.env.NEXT_PUBLIC_DISCORD_INVITE_CODE ?? '';
export const discordInviteUrl = `https://discord.gg/${discordCode}`;

// Organization and community
export const githubOrgUrl = 'https://github.com/AniTrend';

// Deep links to the native app
export const deepLinks = {
  profile: 'app.anitrend://action/profile',
  anime: (id: string) => `app.anitrend://action/anime/${id}`,
};

// Supabase banner image URL built from base URL in env
const supabaseBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_BASE_URL ?? '';
export const supabaseBannerUrl = `${supabaseBaseUrl}/media/banner/156cc9127eb16c7fd645a9ba0fb3a4e21678353995_main.jpg`;

// Static fallback repository data
export const fallbackRepos = [
  {
    name: 'anitrend-app',
    description:
      'The main AniTrend application for Android, built with Kotlin and clean architecture.',
    url: 'https://github.com/AniTrend/anitrend-app',
    homepage: null,
    language: 'Kotlin',
    stars: 0,
    forks: 0,
    topics: [] as string[],
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'anitrend-api',
    description:
      'A GraphQL API that aggregates data from various sources for the AniTrend ecosystem.',
    url: 'https://github.com/AniTrend/anitrend-api',
    homepage: null,
    language: 'TypeScript',
    stars: 0,
    forks: 0,
    topics: [] as string[],
    updatedAt: new Date().toISOString(),
  },
];
