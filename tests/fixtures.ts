import { test as base, expect } from 'next/experimental/testmode/playwright';
import type { JikanAnime } from '../src/lib/types';

const image = '/screenshots/anime-detail.png';
const images = {
  jpg: { image_url: image, small_image_url: image, large_image_url: image },
  webp: { image_url: image, small_image_url: image, large_image_url: image },
};

function anime(id: number, title = `Fixture anime ${id}`): JikanAnime {
  return {
    mal_id: id,
    title,
    title_english: title,
    synopsis: 'A deterministic anime description for browser regression tests.',
    genres: [
      {
        mal_id: 1,
        name: 'Action',
        url: 'https://myanimelist.net/anime/genre/1',
      },
    ],
    score: 8.5,
    images,
    episodes: 26,
    year: 1998,
    season: 'spring',
    rank: 1,
    popularity: 1,
    status: 'Finished Airing',
    duration: '24 min per ep',
    rating: 'PG-13',
    background: 'Fixture background.',
    trailer: { embed_url: 'https://www.youtube.com/embed/test-trailer' },
    producers: [{ name: 'Fixture producer' }],
    studios: [{ name: 'Fixture studio' }],
    aired: { string: 'Apr 3, 1998 to Apr 24, 1999' },
  };
}

export const test = base.extend<{ apiFixtures: void }>({
  apiFixtures: [
    async ({ next, page }, use) => {
      next.onFetch((request) => {
        const url = new URL(request.url);
        if (url.hostname !== 'api.jikan.moe') return 'continue';
        if (url.pathname === '/v4/anime/1') {
          return Response.json({ data: anime(1, 'Cowboy Bebop') });
        }
        if (url.pathname === '/v4/anime/1/characters') {
          return Response.json({
            data: [
              {
                character: {
                  mal_id: 1,
                  name: 'Spike',
                  images: { jpg: { image_url: image } },
                },
                role: 'Main',
              },
            ],
          });
        }
        if (url.pathname === '/v4/top/anime' || url.pathname === '/v4/anime') {
          const pageNumber = Number(url.searchParams.get('page') ?? 1);
          const limit = Number(url.searchParams.get('limit') ?? 25);
          return Response.json({
            data: Array.from({ length: limit }, (_, index) =>
              anime((pageNumber - 1) * limit + index + 1)
            ),
          });
        }
        // An unexpected API call must fail rather than quietly using live data.
        return 'abort';
      });
      await page.route('https://www.youtube.com/embed/test-trailer', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<html><body>Fixture trailer</body></html>',
        })
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect };
