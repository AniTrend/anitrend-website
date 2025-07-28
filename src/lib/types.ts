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
