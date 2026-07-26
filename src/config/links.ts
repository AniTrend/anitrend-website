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

export type AppIntent =
  | { type: 'profile' }
  | { type: 'discover' }
  | { type: 'suggestions' }
  | { type: 'social' }
  | { type: 'settings' }
  | { type: 'anime-detail'; animeId: string };

export type AppIntentStatus = 'verified' | 'pendingVerification';

export const appIntentStatus: Record<AppIntent['type'], AppIntentStatus> = {
  profile: 'verified',
  discover: 'verified',
  suggestions: 'verified',
  social: 'verified',
  settings: 'verified',
  'anime-detail': 'pendingVerification',
};

export function getAppIntentHref(intent: AppIntent): string {
  switch (intent.type) {
    case 'profile':
      return 'app.anitrend://action/profile';
    case 'discover':
      return 'app.anitrend://action/discover';
    case 'suggestions':
      return 'app.anitrend://action/suggestions';
    case 'social':
      return 'app.anitrend://action/social';
    case 'settings':
      return 'app.anitrend://action/settings';
    case 'anime-detail':
      return `app.anitrend://action/anime/${intent.animeId}`;
  }
}

// Deep links to the native app
export const deepLinks = {
  profile: getAppIntentHref({ type: 'profile' }),
  discover: getAppIntentHref({ type: 'discover' }),
  suggestions: getAppIntentHref({ type: 'suggestions' }),
  social: getAppIntentHref({ type: 'social' }),
  settings: getAppIntentHref({ type: 'settings' }),
  anime: (id: string) =>
    getAppIntentHref({ type: 'anime-detail', animeId: id }),
};

// Supabase banner image URL built from base URL in env
const SUPABASE_STORAGE_PUBLIC_PATH = '/storage/v1/object/public';
const SUPABASE_BANNER_OBJECT_PATH =
  '/media/banner/156cc9127eb16c7fd645a9ba0fb3a4e21678353995_main.jpg';
const SUPABASE_PROJECT_HOSTNAME_PATTERN = /^[a-z0-9-]+\.supabase\.co$/;

function getSupabaseProjectOrigin(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_BASE_URL?.trim();

  if (!baseUrl) {
    return null;
  }

  try {
    const url = new URL(baseUrl);
    const isSupabaseProjectOrigin =
      url.protocol === 'https:' &&
      SUPABASE_PROJECT_HOSTNAME_PATTERN.test(url.hostname) &&
      !url.port &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash;

    return isSupabaseProjectOrigin ? url.origin : null;
  } catch {
    return null;
  }
}

const supabaseProjectOrigin = getSupabaseProjectOrigin();
export const supabaseBannerUrl = supabaseProjectOrigin
  ? `${supabaseProjectOrigin}${SUPABASE_STORAGE_PUBLIC_PATH}${SUPABASE_BANNER_OBJECT_PATH}`
  : null;

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
