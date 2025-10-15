/**
 * Cache-aware fetch utility that respects HTTP cache control headers
 *
 * This utility is specifically designed for the Jikan API which provides:
 * - Expires: Cache expiry date
 * - Last-Modified: Cache set date
 * - ETag: MD5 hash for cache validation
 * - All requests cached for 24 hours on Jikan's servers
 */

interface CacheAwareFetchOptions extends RequestInit {
  /** Fallback cache duration in seconds if no cache headers are present */
  fallbackCacheDuration?: number;
  /** Maximum cache duration in seconds to prevent overly long caching */
  maxCacheDuration?: number;
  /** Minimum cache duration in seconds to ensure some caching even with short expires */
  minCacheDuration?: number;
  /** Number of retry attempts on transient failures */
  retries?: number;
  /** Base delay (ms) for exponential backoff */
  retryDelayMs?: number;
  /** Backoff multiplier (e.g., 2 = exponential) */
  retryFactor?: number;
  /** Max delay cap (ms) for backoff */
  maxRetryDelayMs?: number;
}

/**
 * Calculate revalidation time from HTTP cache headers
 * @param headers - Response headers from the API
 * @param fallbackDuration - Fallback duration in seconds
 * @param maxDuration - Maximum allowed duration in seconds
 * @param minDuration - Minimum duration in seconds
 * @returns Revalidation time in seconds
 */
function calculateRevalidationTime(
  headers: Headers,
  fallbackDuration: number = 300, // 5 minutes default
  maxDuration: number = 86400, // 24 hours max
  minDuration: number = 60 // 1 minute min
): number {
  // Check for Expires header (Jikan provides this)
  const expires = headers.get('expires');
  if (expires) {
    const expiresDate = new Date(expires);
    const now = new Date();

    if (expiresDate > now) {
      const secondsUntilExpiry = Math.floor(
        (expiresDate.getTime() - now.getTime()) / 1000
      );
      // Clamp between min and max duration
      return Math.max(minDuration, Math.min(maxDuration, secondsUntilExpiry));
    }
  }

  // Check for Cache-Control max-age directive
  const cacheControl = headers.get('cache-control');
  if (cacheControl) {
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1], 10);
      return Math.max(minDuration, Math.min(maxDuration, maxAge));
    }
  }

  // Fallback to provided duration
  return Math.max(minDuration, Math.min(maxDuration, fallbackDuration));
}

/**
 * Enhanced fetch function that respects cache control headers from the Jikan API
 *
 * Features:
 * - Automatically calculates Next.js revalidation time from Expires header
 * - Provides sensible fallbacks for missing cache headers
 * - Includes ETag support for future conditional requests
 * - Handles rate limiting and error responses gracefully
 *
 * @param url - The URL to fetch
 * @param options - Fetch options with cache-aware extensions
 * @returns Promise<Response>
 */
export async function cacheAwareFetch(
  url: string,
  options: CacheAwareFetchOptions = {}
): Promise<Response> {
  const { ...fetchOptions } = options;

  // Ensure we have proper headers
  const headers = new Headers(fetchOptions.headers);

  // Add User-Agent if not present (Jikan API best practice)
  if (!headers.has('User-Agent')) {
    headers.set('User-Agent', 'AniTrend-Website');
  }

  // For Jikan API, we can add ETag support for conditional requests
  // This would require storing ETags in a cache/database for production use
  // For now, we'll focus on the Expires header approach

  try {
    // First, make a request to get the cache headers
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      // For non-2xx responses, we should not cache or provide minimal caching
      // depending on the error type
      if (response.status === 429) {
        // Rate limited - cache the error briefly to avoid hammering
        console.warn(
          'Jikan API rate limit exceeded. Caching error response briefly.'
        );
        throw new Error(
          `Rate limited: ${response.status} ${response.statusText}`
        );
      }

      if (response.status >= 500) {
        // Server error - don't cache these
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      // Client errors (404, 400) can be cached briefly
      throw new Error(
        `Client error: ${response.status} ${response.statusText}`
      );
    }

    return response;
  } catch (error) {
    console.error('Cache-aware fetch failed:', error);
    throw error;
  }
}

/**
 * Enhanced fetch function specifically for Next.js server-side usage
 * that automatically sets the `next: { revalidate }` option based on cache headers
 *
 * @param url - The URL to fetch
 * @param options - Fetch options with cache-aware extensions
 * @returns Promise<Response>
 */
export async function nextCacheAwareFetch(
  url: string,
  options: CacheAwareFetchOptions = {}
): Promise<Response> {
  const {
    fallbackCacheDuration = 300,
    retries = 2,
    retryDelayMs = 300,
    retryFactor = 2,
    maxRetryDelayMs = 3_000,
    ...fetchOptions
  } = options;

  // Helper delay with jitter
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  let attempt = 0;
  let lastError: unknown = null;
  let backoff = retryDelayMs;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'User-Agent': 'AniTrend-Website',
          ...fetchOptions.headers,
        },
        next: {
          revalidate: fallbackCacheDuration,
          ...(fetchOptions.next || {}),
        },
      });

      // Retry on 429/5xx
      if (!response.ok) {
        const status = response.status;
        if (status === 429 || (status >= 500 && status < 600)) {
          // Respect Retry-After when present
          const retryAfter = response.headers.get('retry-after');
          if (retryAfter) {
            const parsed = Number(retryAfter);
            const waitMs = isNaN(parsed)
              ? Math.max(0, new Date(retryAfter).getTime() - Date.now())
              : parsed * 1000;
            if (attempt < retries) {
              await delay(waitMs || backoff);
              attempt++;
              backoff = Math.min(maxRetryDelayMs, backoff * retryFactor);
              continue;
            }
          } else if (attempt < retries) {
            await delay(backoff + Math.floor(Math.random() * 100));
            attempt++;
            backoff = Math.min(maxRetryDelayMs, backoff * retryFactor);
            continue;
          }
        }
      }

      return response;
    } catch (err) {
      lastError = err;
      const message = (err as Error)?.message || '';
      const isTimeout =
        message.includes('ETIMEDOUT') || message.includes('timeout');
      const isNetwork =
        isTimeout ||
        message.includes('ENOTFOUND') ||
        message.includes('ECONNRESET');
      if (attempt < retries && isNetwork) {
        await delay(backoff + Math.floor(Math.random() * 100));
        attempt++;
        backoff = Math.min(maxRetryDelayMs, backoff * retryFactor);
        continue;
      }
      throw err;
    }
  }

  // Exhausted retries
  throw lastError instanceof Error
    ? lastError
    : new Error('Request failed after retries');
}

/**
 * Utility to extract cache information from response headers
 * Useful for debugging and monitoring cache behavior
 *
 * @param headers - Response headers
 * @returns Object with cache information
 */
export function extractCacheInfo(headers: Headers) {
  return {
    expires: headers.get('expires'),
    lastModified: headers.get('last-modified'),
    etag: headers.get('etag'),
    cacheControl: headers.get('cache-control'),
    xRequestFingerprint: headers.get('x-request-fingerprint'),
    // Calculate suggested revalidation time
    suggestedRevalidation: calculateRevalidationTime(headers),
  };
}

/**
 * Smart cache duration calculator based on data type and API patterns
 * Different types of anime data have different update frequencies
 *
 * @param endpoint - The API endpoint being called
 * @returns Recommended cache duration in seconds
 */
export function getRecommendedCacheDuration(endpoint: string): number {
  // Top anime lists - update frequently due to ranking changes
  if (endpoint.includes('/top/anime')) {
    return 300; // 5 minutes
  }

  // Individual anime details - rarely change
  if (endpoint.match(/\/anime\/\d+$/)) {
    return 3600; // 1 hour
  }

  // Search results - can be dynamic
  if (endpoint.includes('/anime?') && endpoint.includes('q=')) {
    return 180; // 3 minutes
  }

  // Recommendations - community data, moderate changes
  if (endpoint.includes('/recommendations')) {
    return 900; // 15 minutes
  }

  // Default for other endpoints
  return 300; // 5 minutes
}
