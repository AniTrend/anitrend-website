import { DiscoverClient } from '@/components/discover-client';
import {
  getTopAnime,
  searchAnime,
  type TopAnimeFilters,
} from '@/lib/anime-service';

type DiscoverPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DEFAULT_LIMIT = 25;

const allowedTypes = new Set(['tv', 'movie', 'ova', 'special', 'ona', 'music']);

const allowedFilters = new Set([
  'airing',
  'upcoming',
  'bypopularity',
  'favorite',
]);

const allowedRatings = new Set(['g', 'pg', 'pg13', 'r17', 'r', 'rx']);

function getParamValue(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function parseNumberParam(
  value: string | undefined,
  { min, max, fallback }: { min?: number; max?: number; fallback?: number }
): number | undefined {
  const parsed = Number.parseFloat(value ?? '');
  if (Number.isNaN(parsed)) return fallback;

  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  return parsed;
}

function parseBooleanParam(
  value: string | undefined,
  fallback: boolean
): boolean {
  if (value === undefined) return fallback;
  if (value === 'false') return false;
  if (value === 'true') return true;
  return fallback;
}

function parseFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): { filters: TopAnimeFilters; searchTerm: string } {
  const searchTerm = (getParamValue(searchParams, 'q') ?? '').trim();

  const rawType = getParamValue(searchParams, 'type');
  const rawFilter = getParamValue(searchParams, 'filter');
  const rawRating = getParamValue(searchParams, 'rating');

  const limit =
    parseNumberParam(getParamValue(searchParams, 'limit'), {
      min: 1,
      max: DEFAULT_LIMIT,
      fallback: DEFAULT_LIMIT,
    }) ?? DEFAULT_LIMIT;

  const page =
    parseNumberParam(getParamValue(searchParams, 'page'), {
      min: 1,
      fallback: 1,
    }) ?? 1;

  const filters: TopAnimeFilters = {
    type: allowedTypes.has(rawType ?? '')
      ? (rawType as TopAnimeFilters['type'])
      : undefined,
    filter: allowedFilters.has(rawFilter ?? '')
      ? (rawFilter as TopAnimeFilters['filter'])
      : undefined,
    rating: allowedRatings.has(rawRating ?? '')
      ? (rawRating as TopAnimeFilters['rating'])
      : undefined,
    min_score: getParamValue(searchParams, 'min_score')
      ? parseNumberParam(getParamValue(searchParams, 'min_score'), {
          min: 0,
          max: 10,
        })
      : undefined,
    max_score: getParamValue(searchParams, 'max_score')
      ? parseNumberParam(getParamValue(searchParams, 'max_score'), {
          min: 0,
          max: 10,
        })
      : undefined,
    sfw: parseBooleanParam(getParamValue(searchParams, 'sfw'), true),
    limit,
    page,
  };

  return { filters, searchTerm };
}

export const metadata = {
  title: 'Discover Anime - AniTrend',
  description:
    'Explore and discover new anime series with advanced filtering options.',
};

export default async function DiscoverPage({
  searchParams = Promise.resolve({}),
}: DiscoverPageProps) {
  const resolvedParams = await (searchParams ?? Promise.resolve({}));
  const { filters, searchTerm } = parseFiltersFromSearchParams(resolvedParams);
  const filtersWithDefaults: TopAnimeFilters = {
    limit: DEFAULT_LIMIT,
    sfw: true,
    page: 1,
    ...filters,
  };

  // The 'filter' property is only supported by getTopAnime (e.g., 'airing', 'upcoming')
  // and must be excluded when calling searchAnime, which uses the search API endpoint
  // that doesn't support this parameter. This is enforced by searchAnime's type signature.
  const { filter: _unusedFilter, ...searchFilters } = filtersWithDefaults;
  void _unusedFilter; // filter param not supported by search endpoint

  const initialAnime = searchTerm
    ? await searchAnime(searchTerm, searchFilters)
    : await getTopAnime(filtersWithDefaults);

  return (
    <DiscoverClient
      initialAnime={initialAnime}
      initialFilters={filtersWithDefaults}
      initialSearchTerm={searchTerm}
    />
  );
}
