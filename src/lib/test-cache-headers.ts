/**
 * Test script for validating cache-aware fetch implementation
 * This can be run to verify that the cache headers are being properly respected
 */

import {
  extractCacheInfo,
  getRecommendedCacheDuration,
} from './cache-aware-fetch';

/**
 * Test function to validate cache header extraction
 * This would typically be run in a test environment
 */
export async function testCacheHeaders() {
  try {
    // Test with a real Jikan API endpoint
    const testUrl = 'https://api.jikan.moe/v4/top/anime?limit=1';

    console.log('Testing cache headers with Jikan API...');
    console.log('URL:', testUrl);

    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'AniTrend-Website-Test',
      },
    });

    if (!response.ok) {
      console.error(
        'Test request failed:',
        response.status,
        response.statusText
      );
      return;
    }

    // Extract and display cache information
    const cacheInfo = extractCacheInfo(response.headers);
    console.log('Cache Information:', cacheInfo);

    // Test recommended cache duration calculation
    const recommendedDuration = getRecommendedCacheDuration(testUrl);
    console.log('Recommended cache duration:', recommendedDuration, 'seconds');

    // Display all relevant headers
    console.log('\\nAll Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

    return cacheInfo;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

/**
 * Test different endpoint types to validate cache duration recommendations
 */
export function testCacheDurationRecommendations() {
  const testEndpoints = [
    'https://api.jikan.moe/v4/top/anime',
    'https://api.jikan.moe/v4/anime/1',
    'https://api.jikan.moe/v4/anime?q=naruto',
    'https://api.jikan.moe/v4/recommendations/anime',
    'https://api.jikan.moe/v4/random/anime',
  ];

  console.log('Testing cache duration recommendations:');
  testEndpoints.forEach((url) => {
    const duration = getRecommendedCacheDuration(url);
    console.log(`${url} -> ${duration} seconds (${duration / 60} minutes)`);
  });
}

// Example usage for development/testing:
// testCacheDurationRecommendations();
// testCacheHeaders().then(info => console.log('Test completed:', info));
