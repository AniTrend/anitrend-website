'use client';

import { useState, useCallback, useTransition, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AnimeCard } from '@/components/anime-card';
import Balancer from 'react-wrap-balancer';
import { Search, Filter, ChevronDown, Loader2, RotateCcw } from 'lucide-react';
import type { Anime } from '@/lib/types';
import type { TopAnimeFilters } from '@/lib/anime-service';
import { getTopAnime, searchAnime } from '@/lib/anime-service';
import { logEvent } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface DiscoverClientProps {
  initialAnime: Anime[];
  initialFilters: TopAnimeFilters;
  initialSearchTerm?: string;
}

const DEFAULT_FILTERS: TopAnimeFilters = {
  limit: 25,
  page: 1,
  sfw: true,
};

// Rate limiting utility
class RateLimiter {
  private lastCall = 0;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(private minInterval: number) {}

  debounce<Args extends unknown[], R>(
    fn: (...args: Args) => R,
    delay: number = this.minInterval
  ): (...args: Args) => void {
    return (...args: Args) => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(() => {
        const now = Date.now();
        if (now - this.lastCall >= this.minInterval) {
          this.lastCall = now;
          // Call fn with the correctly typed args
          (fn as (...a: Args) => R)(...args);
        }
      }, delay);
    };
  }

  throttle<Args extends unknown[], R>(
    fn: (...args: Args) => R
  ): (...args: Args) => void {
    return (...args: Args) => {
      const now = Date.now();
      if (now - this.lastCall >= this.minInterval) {
        this.lastCall = now;
        (fn as (...a: Args) => R)(...args);
      }
    };
  }
}

function serializeStateToQuery(
  filters: TopAnimeFilters,
  searchTerm: string,
  page: number
): string {
  const params = new URLSearchParams();

  const trimmedQuery = searchTerm.trim();
  if (trimmedQuery) {
    params.set('q', trimmedQuery);
  }

  if (filters.type) params.set('type', filters.type);
  if (filters.filter) params.set('filter', filters.filter);
  if (filters.rating) params.set('rating', filters.rating);
  if (filters.min_score !== undefined)
    params.set('min_score', filters.min_score.toString());
  if (filters.max_score !== undefined)
    params.set('max_score', filters.max_score.toString());
  if (filters.start_date) params.set('start_date', filters.start_date);
  if (filters.end_date) params.set('end_date', filters.end_date);
  if (filters.sfw === false) params.set('sfw', 'false');
  if (filters.limit && filters.limit !== DEFAULT_FILTERS.limit)
    params.set('limit', filters.limit.toString());
  if (page > 1) params.set('page', page.toString());

  return params.toString();
}

export function DiscoverClient({
  initialAnime,
  initialFilters,
  initialSearchTerm,
}: DiscoverClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm ?? '');
  const [filters, setFilters] = useState<TopAnimeFilters>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  }));

  const [animeList, setAnimeList] = useState<Anime[]>(initialAnime);
  const [currentPage, setCurrentPage] = useState(initialFilters.page ?? 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(
    initialAnime.length >= (initialFilters.limit ?? DEFAULT_FILTERS.limit)
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Rate limiter instances
  const rateLimiter = useRef(new RateLimiter(1000)); // 1 second minimum between API calls
  const searchLimiter = useRef(new RateLimiter(800)); // 800ms for search debouncing

  const initialPageRef = useRef(
    initialFilters.page ?? DEFAULT_FILTERS.page ?? 1
  );
  const hydratedFromQueryRef = useRef(false);

  // Filter states
  const baseLimit = filters.limit ?? DEFAULT_FILTERS.limit;

  const pushStateToUrl = useCallback(
    (nextFilters: TopAnimeFilters, nextSearchTerm: string, page: number) => {
      const queryString = serializeStateToQuery(
        nextFilters,
        nextSearchTerm,
        page
      );
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    const targetPage = initialPageRef.current;
    if (hydratedFromQueryRef.current || targetPage <= 1) return;

    hydratedFromQueryRef.current = true;
    let cancelled = false;

    const hydrateFromQuery = async () => {
      setIsLoading(true);
      let combinedList = [...initialAnime];
      let lastPageSize = combinedList.length;

      for (let page = 2; page <= targetPage; page++) {
        const pageData = searchTerm.trim()
          ? await searchAnime(searchTerm, { ...filters, page })
          : await getTopAnime({ ...filters, page });

        if (cancelled) return;

        combinedList = [...combinedList, ...pageData];
        lastPageSize = pageData.length;
      }

      if (cancelled) return;

      setAnimeList(combinedList);
      setCurrentPage(targetPage);
      setHasMorePages(lastPageSize === baseLimit);
      setIsLoading(false);
    };

    void hydrateFromQuery();

    return () => {
      cancelled = true;
    };
  }, [baseLimit, filters, initialAnime, searchTerm]);

  const handleFilterChange = useCallback(
    (
      key: keyof TopAnimeFilters,
      value: string | number | boolean | undefined
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === 'all' ? undefined : value,
        page: 1, // Reset to page 1 when filters change
      }));
      setCurrentPage(1);
      setHasMorePages(true); // Reset pagination state when filters change
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setCurrentPage(1);
    setSearchTerm('');
    setHasMorePages(true); // Reset pagination state
  }, []);

  const resetAndApplyFilters = useCallback(async () => {
    resetFilters();
    setIsLoading(true);
    startTransition(async () => {
      try {
        const newAnime = await getTopAnime({ ...DEFAULT_FILTERS });
        setAnimeList(newAnime);
        // Track that filters were applied and include a small summary
        void logEvent('discover_filters_applied', {
          type: 'all',
          rating: 'all',
          sfw: true,
        });
        setCurrentPage(1);
        setHasMorePages(newAnime.length === DEFAULT_FILTERS.limit);
        pushStateToUrl(DEFAULT_FILTERS, '', 1);
      } catch (error) {
        console.error('Failed to reset and apply filters:', error);
      } finally {
        setIsLoading(false);
      }
    });
  }, [pushStateToUrl, resetFilters]);

  const applyFilters = useCallback(async () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const newAnime = await getTopAnime({ ...filters, page: 1 });
        setAnimeList(newAnime);
        // Track that filters were applied and include a small summary
        void logEvent('discover_filters_applied', {
          type: filters.type ?? 'all',
          rating: filters.rating ?? 'all',
          sfw: filters.sfw ?? true,
        });
        setCurrentPage(1);
        const limitToUse = filters.limit ?? DEFAULT_FILTERS.limit;
        setHasMorePages(newAnime.length === limitToUse); // Check if we got a full page
        pushStateToUrl({ ...filters, page: 1 }, searchTerm, 1);
      } catch (error) {
        console.error('Failed to apply filters:', error);
      } finally {
        setIsLoading(false);
      }
    });
  }, [filters, pushStateToUrl, searchTerm]);

  // Search functionality with API calls and rate limiting
  const performSearch = useCallback(
    async (query: string) => {
      const normalizedQuery = query.trim();

      if (!query.trim()) {
        // If search is cleared, reload with current filters
        await applyFilters();
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await searchAnime(normalizedQuery, {
          ...filters,
          page: 1, // Always start from page 1 for search
        });
        setAnimeList(searchResults);
        // Track search usage for business analytics
        void logEvent('discover_search', {
          query: normalizedQuery,
          results_count: searchResults.length,
        });
        setCurrentPage(1);
        setHasMorePages(
          searchResults.length === (filters.limit ?? DEFAULT_FILTERS.limit)
        );
        pushStateToUrl(filters, normalizedQuery, 1);
      } catch (error) {
        console.error('Failed to search anime:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [filters, applyFilters, pushStateToUrl]
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      searchLimiter.current.debounce(performSearch, 800)(query);
    },
    [performSearch]
  );

  // Handle search input changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const loadMore = useCallback(async () => {
    if (!hasMorePages) return; // Don't load if no more pages

    setIsLoading(true);
    startTransition(async () => {
      try {
        const nextPage = currentPage + 1;
        let moreAnime: Anime[] = [];

        if (searchTerm.trim()) {
          // If searching, get more search results
          moreAnime = await searchAnime(searchTerm, {
            ...filters,
            page: nextPage,
          });
        } else {
          // Regular pagination
          moreAnime = await getTopAnime({ ...filters, page: nextPage });
        }

        if (moreAnime.length > 0) {
          setAnimeList((prev) => [...prev, ...moreAnime]);
          setCurrentPage(nextPage);

          pushStateToUrl(filters, searchTerm, nextPage);

          // Check if we got fewer results than expected (last page)
          if (moreAnime.length < (filters.limit ?? DEFAULT_FILTERS.limit)) {
            setHasMorePages(false);
          }
        } else {
          // No more results available
          setHasMorePages(false);
        }
      } catch (error) {
        console.error('Failed to load more anime:', error);
        setHasMorePages(false); // Assume no more pages on error
      } finally {
        setIsLoading(false);
      }
    });
  }, [filters, currentPage, hasMorePages, pushStateToUrl, searchTerm]);

  // Rate-limited filter application
  const throttledApplyFilters = useCallback(() => {
    rateLimiter.current.throttle(applyFilters)();
  }, [applyFilters]);

  // Rate-limited load more
  const throttledLoadMore = useCallback(() => {
    rateLimiter.current.throttle(loadMore)();
  }, [loadMore]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'page') return false;
    if (key === 'limit')
      return value !== undefined && value !== DEFAULT_FILTERS.limit;
    if (key === 'sfw') return value === false;
    return value !== undefined && value !== 'all';
  });

  return (
    <>
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-headline">
              Discover Anime
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              <Balancer>
                Explore our vast collection of anime. Use filters and search to
                find your next favorite series.
              </Balancer>
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for an anime..."
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Filters Section */}
          <div className="mt-8 max-w-4xl mx-auto">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                <Card className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Type Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={filters.type || 'all'}
                        onValueChange={(value) =>
                          handleFilterChange('type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="tv">TV Series</SelectItem>
                          <SelectItem value="movie">Movie</SelectItem>
                          <SelectItem value="ova">OVA</SelectItem>
                          <SelectItem value="special">Special</SelectItem>
                          <SelectItem value="ona">ONA</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="filter">Status</Label>
                      <Select
                        value={filters.filter || 'all'}
                        onValueChange={(value) =>
                          handleFilterChange('filter', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All status</SelectItem>
                          <SelectItem value="airing">
                            Currently Airing
                          </SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="bypopularity">
                            By Popularity
                          </SelectItem>
                          <SelectItem value="favorite">Favorites</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rating Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Select
                        value={filters.rating || 'all'}
                        onValueChange={(value) =>
                          handleFilterChange('rating', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All ratings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All ratings</SelectItem>
                          <SelectItem value="g">G - All Ages</SelectItem>
                          <SelectItem value="pg">PG - Children</SelectItem>
                          <SelectItem value="pg13">
                            PG-13 - Teens 13+
                          </SelectItem>
                          <SelectItem value="r17">
                            R - 17+ (violence & profanity)
                          </SelectItem>
                          <SelectItem value="r">R+ - Mild Nudity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Score Range */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Score Range</Label>
                      <div className="px-3">
                        <Slider
                          value={[
                            filters.min_score || 0,
                            filters.max_score || 10,
                          ]}
                          onValueChange={([min, max]) => {
                            handleFilterChange(
                              'min_score',
                              min > 0 ? min : undefined
                            );
                            handleFilterChange(
                              'max_score',
                              max < 10 ? max : undefined
                            );
                          }}
                          max={10}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>{filters.min_score || 0}</span>
                          <span>{filters.max_score || 10}</span>
                        </div>
                      </div>
                    </div>

                    {/* SFW Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sfw"
                        checked={filters.sfw !== false}
                        onCheckedChange={(checked) =>
                          handleFilterChange('sfw', checked)
                        }
                      />
                      <Label htmlFor="sfw">Safe for Work only</Label>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Filters
                    </Button>

                    <Button
                      onClick={throttledApplyFilters}
                      disabled={isPending || isLoading}
                      className="flex items-center gap-2"
                    >
                      {(isPending || isLoading) && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Apply Filters
                    </Button>
                  </div>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="pb-20 md:pb-32">
        <div className="container">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {animeList.length} anime
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {animeList.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {animeList.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMorePages ? (
                <div className="mt-12 text-center">
                  <Button
                    onClick={throttledLoadMore}
                    disabled={isLoading || isSearching}
                    size="lg"
                    variant="outline"
                    className="min-w-[140px]"
                  >
                    {isLoading || isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="mt-12 text-center">
                  <p className="text-muted-foreground text-sm">
                    No more anime to load
                  </p>
                  <Button
                    variant="ghost"
                    onClick={resetAndApplyFilters}
                    className="mt-2"
                    disabled={isLoading}
                  >
                    Browse all anime
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {searchTerm
                  ? `No anime found matching "${searchTerm}".`
                  : 'No anime found with the current filters.'}
              </p>
              {(hasActiveFilters || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={resetAndApplyFilters}
                  className="mt-4"
                  disabled={isLoading}
                >
                  Clear all filters and search
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
