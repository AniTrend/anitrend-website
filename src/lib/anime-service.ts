import type {
  Anime,
  JikanAnime,
  JikanGenre,
  JikanRecommendation,
  AnimeRecommendation,
} from '@/lib/types';

/**
 * Jikan Top Anime API filter options
 * Based on https://docs.api.jikan.moe/#tag/top
 */
export interface TopAnimeFilters {
  /** Type of anime to filter by */
  type?: 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music';
  /** Filter by anime status */
  filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite';
  /** Rating filter */
  rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx';
  /** Minimum score (1.0 - 10.0) */
  min_score?: number;
  /** Maximum score (1.0 - 10.0) */
  max_score?: number;
  /** Starting date (YYYY-MM-DD) */
  start_date?: string;
  /** Ending date (YYYY-MM-DD) */
  end_date?: string;
  /** SFW filter - Set to false to include NSFW content */
  sfw?: boolean;
  /** Number of results to return (1-25) */
  limit?: number;
  /** Page number for pagination */
  page?: number;
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: TopAnimeFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  return params.toString();
}

/**
 * Transform JikanAnime data to our internal Anime type
 */
function transformJikanAnime(anime: JikanAnime): Anime {
  return {
    id: anime.mal_id.toString(),
    title: anime.title_english || anime.title,
    synopsis: anime.synopsis,
    genres: anime.genres.map((g: JikanGenre) => g.name),
    score: anime.score,
    imageUrl: anime.images.jpg.large_image_url,
    episodes: anime.episodes,
    year: anime.year,
    season: anime.season,
    rank: anime.rank,
    popularity: anime.popularity,
    status: anime.status,
  };
}

/**
 * Transform Jikan recommendation data to our internal type
 */
function transformJikanRecommendation(
  rec: JikanRecommendation
): AnimeRecommendation {
  const [fromAnime, toAnime] = rec.entry;

  return {
    id: rec.mal_id,
    fromAnime: {
      id: fromAnime.mal_id.toString(),
      title: fromAnime.title,
      imageUrl: fromAnime.images.jpg.large_image_url,
    },
    toAnime: {
      id: toAnime.mal_id.toString(),
      title: toAnime.title,
      imageUrl: toAnime.images.jpg.large_image_url,
    },
    content: rec.content,
    date: rec.date,
    username: rec.user.username,
  };
}

/**
 * Remove duplicate anime based on their ID
 */
function removeDuplicateAnime(animeList: Anime[]): Anime[] {
  return animeList.filter(
    (anime, index, self) => index === self.findIndex((a) => a.id === anime.id)
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2,
  backoffMs = 500
): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        ...options,
      });

      if (response.status === 429 && attempt < retries) {
        // Back off on rate limits and retry
        await delay(backoffMs * (attempt + 1));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === retries) {
        console.error('Failed to fetch from Jikan API:', error);
        return null;
      }
      await delay(backoffMs * (attempt + 1));
    }
  }

  return null;
}

/**
 * Fetch top anime from Jikan API with optional filters
 * @param filters - Filter options for the API request
 * @returns Promise<Anime[]>
 */
export async function getTopAnime(
  filters: TopAnimeFilters = {}
): Promise<Anime[]> {
  try {
    const queryString = buildQueryString(filters);
    const url = queryString
      ? `https://api.jikan.moe/v4/top/anime?${queryString}`
      : 'https://api.jikan.moe/v4/top/anime';

    const response = await fetchWithRetry(url);
    if (!response || !response.ok) {
      console.error('Failed to fetch top anime from Jikan API');
      return [];
    }

    const { data }: { data: JikanAnime[] } = await response.json();
    const animeList = data.map(transformJikanAnime);

    return removeDuplicateAnime(animeList);
  } catch (error) {
    console.error('Failed to fetch top anime:', error);
    return [];
  }
}

/**
 * Fetch a single anime by ID from Jikan API
 * @param id - The anime ID
 * @returns Promise<Anime | null>
 */
export async function getAnimeById(id: string): Promise<Anime | null> {
  try {
    const response = await fetchWithRetry(
      `https://api.jikan.moe/v4/anime/${id}`
    );
    if (!response || !response.ok) {
      return null;
    }

    const { data }: { data: JikanAnime } = await response.json();
    if (!data) return null;

    return transformJikanAnime(data);
  } catch (error) {
    console.error('Failed to fetch anime details:', error);
    return null;
  }
}

/**
 * Search anime by query string
 * @param query - Search query string
 * @param filters - Optional additional filters
 * @returns Promise<Anime[]>
 */
export async function searchAnime(
  query: string,
  filters: Omit<TopAnimeFilters, 'filter'> = {}
): Promise<Anime[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    const searchParams = new URLSearchParams({
      q: query.trim(),
      ...Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== null
        )
      ),
    });

    const url = `https://api.jikan.moe/v4/anime?${searchParams.toString()}`;
    const response = await fetchWithRetry(url);

    if (!response || !response.ok) {
      console.error('Failed to search anime from Jikan API');
      return [];
    }

    const { data }: { data: JikanAnime[] } = await response.json();
    const animeList = data.map(transformJikanAnime);

    return removeDuplicateAnime(animeList);
  } catch (error) {
    console.error('Failed to search anime:', error);
    return [];
  }
}

/**
 * Get anime data optimized for AI recommendation (simplified structure)
 * @param filters - Optional filters to apply to the anime search
 * @returns Promise with simplified anime data for AI processing
 */
export async function getAnimeForAI(filters: TopAnimeFilters = {}): Promise<
  Array<{
    id: string;
    title: string;
    synopsis: string;
    genres: string[];
    score: number;
    rank: number;
    popularity: number;
    status: string;
  }>
> {
  try {
    const queryString = buildQueryString(filters);
    const url = queryString
      ? `https://api.jikan.moe/v4/top/anime?${queryString}`
      : 'https://api.jikan.moe/v4/top/anime';

    const response = await fetchWithRetry(url);
    if (!response || !response.ok) {
      throw new Error('Failed to fetch anime data from external API');
    }

    const { data }: { data: JikanAnime[] } = await response.json();
    const animeList = data.map((anime: JikanAnime) => ({
      id: anime.mal_id.toString(),
      title: anime.title_english || anime.title,
      synopsis: anime.synopsis,
      genres: anime.genres.map((g: JikanGenre) => g.name),
      score: anime.score,
      rank: anime.rank,
      popularity: anime.popularity,
      status: anime.status,
    }));

    // Remove duplicates based on ID
    return animeList.filter(
      (anime, index, self) => index === self.findIndex((a) => a.id === anime.id)
    );
  } catch (error) {
    console.error('Failed to fetch anime for AI:', error);
    throw error;
  }
}

// Convenience functions for common filter combinations

/**
 * Get top airing anime
 */
export async function getTopAiringAnime(limit = 25): Promise<Anime[]> {
  return getTopAnime({ filter: 'airing', limit });
}

/**
 * Get upcoming anime
 */
export async function getUpcomingAnime(limit = 25): Promise<Anime[]> {
  return getTopAnime({ filter: 'upcoming', limit });
}

/**
 * Get most popular anime
 */
export async function getMostPopularAnime(limit = 25): Promise<Anime[]> {
  return getTopAnime({ filter: 'bypopularity', limit });
}

/**
 * Get favorite anime
 */
export async function getFavoriteAnime(limit = 25): Promise<Anime[]> {
  return getTopAnime({ filter: 'favorite', limit });
}

/**
 * Get anime by type
 */
export async function getAnimeByType(
  type: TopAnimeFilters['type'],
  limit = 25
): Promise<Anime[]> {
  return getTopAnime({ type, limit });
}

/**
 * Get highly rated anime (score >= 8.0)
 */
export async function getHighlyRatedAnime(limit = 25): Promise<Anime[]> {
  return getTopAnime({ min_score: 8.0, limit });
}

/**
 * Get SFW anime only
 */
export async function getSFWAnime(limit = 25): Promise<Anime[]> {
  return getTopAnime({ sfw: true, limit });
}

/**
 * Fetch recent anime recommendations from Jikan API
 * @param page - Page number for pagination (optional)
 * @returns Promise<AnimeRecommendation[]>
 */
export async function getAnimeRecommendations(
  page = 1
): Promise<AnimeRecommendation[]> {
  try {
    const url = `https://api.jikan.moe/v4/recommendations/anime?page=${page}`;

    const response = await fetchWithRetry(url);
    if (!response || !response.ok) {
      console.error('Failed to fetch anime recommendations from Jikan API');
      return [];
    }

    const { data }: { data: JikanRecommendation[] } = await response.json();
    return data.map(transformJikanRecommendation);
  } catch (error) {
    console.error('Failed to fetch anime recommendations:', error);
    return [];
  }
}

/**
 * Get anime data from recommendations for AI processing
 * This extracts unique anime from recommendation pairs with their recommendation context
 * @param pages - Number of pages to fetch (default: 3)
 * @returns Promise with anime data enhanced with recommendation context for AI
 */
export async function getRecommendationsForAI(pages = 3): Promise<
  Array<{
    id: string;
    title: string;
    imageUrl: string;
    recommendationReasons: string[];
    relatedAnime: Array<{
      id: string;
      title: string;
      relationship: 'recommended_from' | 'recommended_to';
    }>;
  }>
> {
  try {
    const allRecommendations: AnimeRecommendation[] = [];

    // Fetch multiple pages of recommendations
    for (let page = 1; page <= pages; page++) {
      const recommendations = await getAnimeRecommendations(page);
      allRecommendations.push(...recommendations);
    }

    // Build a map of anime with their recommendation contexts
    const animeMap = new Map<
      string,
      {
        id: string;
        title: string;
        imageUrl: string;
        recommendationReasons: string[];
        relatedAnime: Array<{
          id: string;
          title: string;
          relationship: 'recommended_from' | 'recommended_to';
        }>;
      }
    >();

    allRecommendations.forEach((rec) => {
      // Process 'from' anime
      if (!animeMap.has(rec.fromAnime.id)) {
        animeMap.set(rec.fromAnime.id, {
          id: rec.fromAnime.id,
          title: rec.fromAnime.title,
          imageUrl: rec.fromAnime.imageUrl,
          recommendationReasons: [],
          relatedAnime: [],
        });
      }

      const fromAnimeData = animeMap.get(rec.fromAnime.id)!;
      fromAnimeData.recommendationReasons.push(
        `Recommended because: ${rec.content}`
      );
      fromAnimeData.relatedAnime.push({
        id: rec.toAnime.id,
        title: rec.toAnime.title,
        relationship: 'recommended_to',
      });

      // Process 'to' anime
      if (!animeMap.has(rec.toAnime.id)) {
        animeMap.set(rec.toAnime.id, {
          id: rec.toAnime.id,
          title: rec.toAnime.title,
          imageUrl: rec.toAnime.imageUrl,
          recommendationReasons: [],
          relatedAnime: [],
        });
      }

      const toAnimeData = animeMap.get(rec.toAnime.id)!;
      toAnimeData.recommendationReasons.push(`Recommended for: ${rec.content}`);
      toAnimeData.relatedAnime.push({
        id: rec.fromAnime.id,
        title: rec.fromAnime.title,
        relationship: 'recommended_from',
      });
    });

    return Array.from(animeMap.values());
  } catch (error) {
    console.error('Failed to fetch recommendations for AI:', error);
    throw error;
  }
}
