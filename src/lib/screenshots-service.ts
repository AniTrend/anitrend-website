export interface AppScreenshot {
  src: string;
  alt: string;
  hint: string;
  category:
    | 'home'
    | 'detail'
    | 'profile'
    | 'discovery'
    | 'themes'
    | 'feeds'
    | 'reviews'
    | 'misc';
}

const screenshots: AppScreenshot[] = [
  // Home screens
  {
    src: '/screenshots/app-home-light.png',
    alt: 'App home screen - Light theme',
    hint: 'app screenshot',
    category: 'home',
  },
  {
    src: '/screenshots/app-home-dark.png',
    alt: 'App home screen - Dark theme',
    hint: 'app screenshot',
    category: 'home',
  },

  // Detail screens
  {
    src: '/screenshots/anime-detail.png',
    alt: 'Anime detail screen with comprehensive information',
    hint: 'app screenshot',
    category: 'detail',
  },
  {
    src: '/screenshots/anime-detail-2.png',
    alt: 'Anime detail screen with additional metadata',
    hint: 'app screenshot',
    category: 'detail',
  },
  {
    src: '/screenshots/manga-detail.png',
    alt: 'Manga detail screen with reading progress',
    hint: 'app screenshot',
    category: 'detail',
  },

  // User profile
  {
    src: '/screenshots/user-profile.png',
    alt: 'User profile screen with anime statistics',
    hint: 'app screenshot',
    category: 'profile',
  },

  // Discovery and feeds
  {
    src: '/screenshots/discover.png',
    alt: 'Discover anime with trending and recommendations',
    hint: 'app screenshot',
    category: 'discovery',
  },
  {
    src: '/screenshots/feeds-1.png',
    alt: 'Social feeds with community activity',
    hint: 'app screenshot',
    category: 'feeds',
  },
  {
    src: '/screenshots/feeds-2.png',
    alt: 'News feed with anime updates',
    hint: 'app screenshot',
    category: 'feeds',
  },
  {
    src: '/screenshots/feeds-3.png',
    alt: 'Crunchyroll integration and external feeds',
    hint: 'app screenshot',
    category: 'feeds',
  },

  // Theme variations
  {
    src: '/screenshots/dual-theme-1.png',
    alt: 'App interface with light theme variation',
    hint: 'app screenshot',
    category: 'themes',
  },
  {
    src: '/screenshots/dual-theme-2.png',
    alt: 'App interface with dark theme variation',
    hint: 'app screenshot',
    category: 'themes',
  },

  // Reviews and community
  {
    src: '/screenshots/reviews-1.png',
    alt: 'Anime reviews and ratings interface',
    hint: 'app screenshot',
    category: 'reviews',
  },
  {
    src: '/screenshots/reviews-2.png',
    alt: 'User reviews with detailed feedback',
    hint: 'app screenshot',
    category: 'reviews',
  },
  {
    src: '/screenshots/reviews-3.png',
    alt: 'Community reviews and discussions',
    hint: 'app screenshot',
    category: 'reviews',
  },

  // Additional features
  {
    src: '/screenshots/more-1.png',
    alt: 'Additional app features and navigation',
    hint: 'app screenshot',
    category: 'misc',
  },
  {
    src: '/screenshots/more-2.png',
    alt: 'Settings and customization options',
    hint: 'app screenshot',
    category: 'misc',
  },
  {
    src: '/screenshots/more-3.png',
    alt: 'Search and filtering capabilities',
    hint: 'app screenshot',
    category: 'misc',
  },
  {
    src: '/screenshots/more-4.png',
    alt: 'Additional interface elements',
    hint: 'app screenshot',
    category: 'misc',
  },
  {
    src: '/screenshots/more-5.png',
    alt: 'Extended functionality showcase',
    hint: 'app screenshot',
    category: 'misc',
  },
  {
    src: '/screenshots/more-6.png',
    alt: 'Final feature demonstration',
    hint: 'app screenshot',
    category: 'misc',
  },
];

/**
 * Get all app screenshots
 */
export function getAllScreenshots(): AppScreenshot[] {
  return screenshots;
}

/**
 * Get screenshots filtered by category
 */
export function getScreenshotsByCategory(
  category: AppScreenshot['category']
): AppScreenshot[] {
  return screenshots.filter((screenshot) => screenshot.category === category);
}

/**
 * Get a curated selection of screenshots for the main showcase
 * Returns a diverse mix representing the app's key features
 */
export function getShowcaseScreenshots(): AppScreenshot[] {
  return [
    // Start with both theme variations to show light/dark support
    screenshots.find((s) => s.category === 'home' && s.alt.includes('Light'))!,
    screenshots.find((s) => s.category === 'home' && s.alt.includes('Dark'))!,

    // Core functionality screens
    screenshots.find((s) => s.category === 'detail')!,
    screenshots.find((s) => s.category === 'discovery')!,
    screenshots.find((s) => s.category === 'profile')!,

    // Additional feature
    screenshots.find((s) => s.category === 'feeds')!,
  ];
}

/**
 * Get a random selection of screenshots
 */
export function getRandomScreenshots(count: number = 6): AppScreenshot[] {
  const shuffled = [...screenshots].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get screenshots optimized for different display contexts
 */
export function getScreenshotsForContext(
  context: 'showcase' | 'gallery' | 'demo'
): AppScreenshot[] {
  switch (context) {
    case 'showcase':
      return getShowcaseScreenshots();
    case 'gallery':
      return getAllScreenshots();
    case 'demo':
      return getRandomScreenshots(4);
    default:
      return getShowcaseScreenshots();
  }
}
