export interface Anime {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  score: number;
  imageUrl: string;
  episodes: number;
  year: number;
  season: string;
  rank: number;
  popularity: number;
  status: string;
  // New fields
  trailer?: {
    embedUrl: string;
  };
  duration: string;
  rating: string;
  studios: string[];
  producers: string[];
  aired: string;
  background: string;
}

export interface Character {
  id: number;
  name: string;
  imageUrl: string;
  role: string;
}

// Jikan API response types
export interface JikanGenre {
  mal_id: number;
  name: string;
  url: string;
}

export interface JikanImages {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
  webp: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string;
  genres: JikanGenre[];
  score: number;
  images: JikanImages;
  episodes: number;
  year: number;
  season: string;
  rank: number;
  popularity: number;
  status: string;
  duration: string;
  rating: string;
  background: string;
  trailer: {
    embed_url: string;
  };
  producers: {
    name: string;
  }[];
  studios: {
    name: string;
  }[];
  aired: {
    string: string;
  };
}

export interface JikanCharacter {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
}

// Jikan Recommendations API types
export interface JikanRecommendationEntry {
  mal_id: number;
  url: string;
  images: JikanImages;
  title: string;
}

export interface JikanRecommendation {
  mal_id: string;
  entry: JikanRecommendationEntry[];
  content: string;
  date: string;
  user: {
    url: string;
    username: string;
  };
}

export interface AnimeRecommendation {
  id: string;
  fromAnime: {
    id: string;
    title: string;
    imageUrl: string;
  };
  toAnime: {
    id: string;
    title: string;
    imageUrl: string;
  };
  content: string;
  date: string;
  username: string;
}

// GitHub API response types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  topics: string[];
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  archived: boolean;
  disabled: boolean;
  private: boolean;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  isArchived: boolean;
  isPrivate: boolean;
  license: string | null;
}
