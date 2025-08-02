import type { GitHubRepository, Repository } from '@/lib/types';

/**
 * GitHub API base URL
 */
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub organization name
 */
const GITHUB_ORG = 'AniTrend';

/**
 * Get language color for visual representation
 * @param language - Programming language name
 * @returns Color hex code
 */
export function getLanguageColor(language: string | null): string {
  if (!language) return '#6b7280'; // gray-500 for unknown languages

  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Kotlin: '#A97BFF',
    Java: '#b07219',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    'C++': '#f34b7d',
    'C#': '#239120',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Dart: '#00B4AB',
    GraphQL: '#e10098',
  };

  return colors[language] || '#6b7280';
}

/**
 * Transform GitHub API repository data to our internal Repository type
 */
function transformGitHubRepository(repo: GitHubRepository): Repository {
  return {
    id: repo.id.toString(),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || '',
    url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    topics: repo.topics || [],
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    isArchived: repo.archived,
    isPrivate: repo.private,
    license: repo.license?.name || null,
  };
}

/**
 * Remove duplicate repositories based on their ID
 */
function removeDuplicateRepositories(repos: Repository[]): Repository[] {
  const uniqueRepos = new Map<string, Repository>();
  repos.forEach((repo) => {
    uniqueRepos.set(repo.id, repo);
  });
  return Array.from(uniqueRepos.values());
}

/**
 * Calculate repository importance score for prioritization
 * This helps identify "pinned-worthy" repositories
 */
function calculateRepositoryScore(repo: Repository): number {
  let score = 0;

  // Star weight (primary factor)
  score += repo.stars * 10;

  // Fork weight
  score += repo.forks * 5;

  // Language bonus (prioritize main languages)
  const languageBonus: Record<string, number> = {
    Kotlin: 50, // Main app language
    TypeScript: 40, // Web/API language
    JavaScript: 35, // Web language
    Java: 30, // Android alternative
    Dart: 25, // Flutter
    Python: 20, // Scripts/tools
  };

  if (repo.language && languageBonus[repo.language]) {
    score += languageBonus[repo.language];
  }

  // Name priority bonus (core repositories)
  const nameBonus: Record<string, number> = {
    'anitrend-app': 200, // Main mobile app
    'anitrend-v2': 150, // Next version
    'anitrend-api': 140, // API
    'anitrend-platform': 130, // Platform/website
    anitrend: 120, // Original
    'retrofit-graphql': 100, // Popular library
    'android-emojify': 80, // Popular utility
    'support-arch': 70, // Architecture library
  };

  if (nameBonus[repo.name]) {
    score += nameBonus[repo.name];
  }

  // Topic bonus (relevant topics indicate importance)
  const importantTopics = [
    'android',
    'kotlin',
    'anime',
    'manga',
    'anilist',
    'graphql',
    'retrofit',
    'library',
    'framework',
    'api',
  ];

  const matchingTopics = repo.topics.filter((topic) =>
    importantTopics.includes(topic.toLowerCase())
  );
  score += matchingTopics.length * 15;

  // Recent activity bonus (updated within last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const updatedDate = new Date(repo.updatedAt);

  if (updatedDate > sixMonthsAgo) {
    score += 25;
  }

  // Homepage bonus (indicates it's a showcase project)
  if (repo.homepage) {
    score += 20;
  }

  return score;
}

/**
 * Get pinned repositories (prioritized by importance score)
 * @param limit - Number of repositories to return
 * @returns Promise<Repository[]>
 */
export async function getPinnedRepositories(limit = 6): Promise<Repository[]> {
  try {
    // Fetch more repositories to have a good selection for scoring
    const repositories = await getAniTrendRepositories({
      sort: 'updated',
      direction: 'desc',
      per_page: 50, // Get more repos to score and prioritize
    });

    // Calculate scores and sort by importance
    const scoredRepos = repositories
      .map((repo) => ({
        ...repo,
        score: calculateRepositoryScore(repo),
      }))
      .sort((a, b) => b.score - a.score);

    // Return top repositories without the score
    return (
      scoredRepos
        .slice(0, limit)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ score, ...repo }) => repo)
    );
  } catch (error) {
    console.error('Failed to fetch pinned repositories:', error);
    throw error;
  }
}

/**
 * Fetch repositories from GitHub API for the AniTrend organization
 * @param options - Query options
 * @returns Promise<Repository[]>
 */
export async function getAniTrendRepositories(
  options: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member';
    per_page?: number;
    page?: number;
  } = {}
): Promise<Repository[]> {
  try {
    const {
      sort = 'updated',
      direction = 'desc',
      type = 'public',
      per_page = 100,
      page = 1,
    } = options;

    const params = new URLSearchParams({
      sort,
      direction,
      type,
      per_page: per_page.toString(),
      page: page.toString(),
    });

    const url = `${GITHUB_API_BASE}/orgs/${GITHUB_ORG}/repos?${params}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AniTrend-Website',
      },
      // Add caching to reduce API calls
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 403) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        console.warn('GitHub API rate limit exceeded. Reset time:', resetTime);
      }
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const repositories: GitHubRepository[] = await response.json();

    const transformedRepos = repositories
      .filter((repo) => !repo.private && !repo.archived) // Only public, non-archived repos
      .map(transformGitHubRepository);

    return removeDuplicateRepositories(transformedRepos);
  } catch (error) {
    console.error('Failed to fetch AniTrend repositories:', error);
    throw error;
  }
}

/**
 * Get starred repositories for a specific user (fallback to organization repos if user is private)
 * @param username - GitHub username
 * @param options - Query options
 * @returns Promise<Repository[]>
 */
export async function getStarredRepositories(
  username: string = GITHUB_ORG,
  options: {
    sort?: 'created' | 'updated';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}
): Promise<Repository[]> {
  try {
    const {
      sort = 'created',
      direction = 'desc',
      per_page = 30,
      page = 1,
    } = options;

    const params = new URLSearchParams({
      sort,
      direction,
      per_page: per_page.toString(),
      page: page.toString(),
    });

    const url = `${GITHUB_API_BASE}/users/${username}/starred?${params}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AniTrend-Website',
      },
      // Add caching to reduce API calls
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      // If starred repos are private or user doesn't exist, fallback to org repos
      console.warn(
        `Could not fetch starred repos for ${username}, falling back to organization repos`
      );
      return getAniTrendRepositories(options);
    }

    const repositories: GitHubRepository[] = await response.json();

    const transformedRepos = repositories
      .filter((repo) => !repo.private) // Only public repos
      .map(transformGitHubRepository);

    return removeDuplicateRepositories(transformedRepos);
  } catch (error) {
    console.error('Failed to fetch starred repositories:', error);
    // Fallback to organization repositories
    return getAniTrendRepositories(options);
  }
}

/**
 * Get a specific repository by name from the AniTrend organization
 * @param repoName - Repository name
 * @returns Promise<Repository | null>
 */
export async function getRepository(
  repoName: string
): Promise<Repository | null> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${GITHUB_ORG}/${repoName}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AniTrend-Website',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const repository: GitHubRepository = await response.json();
    return transformGitHubRepository(repository);
  } catch (error) {
    console.error(`Failed to fetch repository ${repoName}:`, error);
    throw error;
  }
}

/**
 * Get the most popular AniTrend repositories (sorted by stars)
 * @param limit - Number of repositories to return
 * @returns Promise<Repository[]>
 */
export async function getPopularRepositories(
  limit = 10
): Promise<Repository[]> {
  try {
    const repositories = await getAniTrendRepositories({
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
    });

    // Sort by stars and take the top repositories
    return repositories.sort((a, b) => b.stars - a.stars).slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch popular repositories:', error);
    throw error;
  }
}

/**
 * Get recently updated AniTrend repositories
 * @param limit - Number of repositories to return
 * @returns Promise<Repository[]>
 */
export async function getRecentlyUpdatedRepositories(
  limit = 10
): Promise<Repository[]> {
  try {
    const repositories = await getAniTrendRepositories({
      sort: 'updated',
      direction: 'desc',
      per_page: limit,
    });

    return repositories.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch recently updated repositories:', error);
    throw error;
  }
}

/**
 * Get repositories by programming language
 * @param language - Programming language to filter by
 * @param limit - Number of repositories to return
 * @returns Promise<Repository[]>
 */
export async function getRepositoriesByLanguage(
  language: string,
  limit = 10
): Promise<Repository[]> {
  try {
    const repositories = await getAniTrendRepositories({
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
    });

    return repositories
      .filter((repo) => repo.language?.toLowerCase() === language.toLowerCase())
      .slice(0, limit);
  } catch (error) {
    console.error(
      `Failed to fetch repositories for language ${language}:`,
      error
    );
    throw error;
  }
}

/**
 * Get repositories data optimized for display (simplified structure)
 * @param options - Query options
 * @returns Promise with simplified repository data for display
 */
export async function getRepositoriesForDisplay(
  options: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    limit?: number;
    starred?: boolean; // New option to fetch starred repos instead
    username?: string; // Username for starred repos
    pinned?: boolean; // New option to fetch pinned repos (default: true)
  } = {}
): Promise<
  Array<{
    name: string;
    description: string;
    url: string;
    homepage: string | null;
    language: string | null;
    stars: number;
    forks: number;
    topics: string[];
    updatedAt: string;
  }>
> {
  try {
    const {
      sort = 'updated',
      limit = 20,
      starred = false,
      username,
      pinned = true, // Default to pinned repositories
    } = options;

    let repositories: Repository[];

    if (starred) {
      repositories = await getStarredRepositories(username, {
        sort: sort === 'created' || sort === 'updated' ? sort : 'updated',
        direction: 'desc',
        per_page: Math.min(limit * 2, 100), // Fetch more to account for filtering
      });
    } else if (pinned) {
      repositories = await getPinnedRepositories(limit);
    } else {
      repositories = await getAniTrendRepositories({
        sort,
        direction: 'desc',
        per_page: 100,
      });
    }

    return repositories.slice(0, limit).map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      homepage: repo.homepage,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      topics: repo.topics,
      updatedAt: repo.updatedAt,
    }));
  } catch (error) {
    console.error('Failed to fetch repositories for display:', error);
    throw error;
  }
}
