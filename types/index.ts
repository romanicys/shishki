export interface Film {
  id: number;
  title: string;
  original_title?: string;
  year?: number;
  description?: string;
  rating?: number;
  poster_url?: string;
  duration?: number;
  genre?: string;
  country?: string;
  director_id?: number;
  created_at: string;
  updated_at?: string;
  director?: Person;
}

export interface FilmDetail extends Film {
  film_persons?: Array<{
    person: Person;
    role: string;
    character_name?: string;
  }>;
  reviews?: Array<{
    id: number;
    title: string;
    rating?: number;
  }>;
  images?: Array<{
    id: number;
    url: string;
    type: string;
  }>;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  published_at: string;
  cover_image_url?: string;
  views: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ArticleDetail extends Article {
  images?: Array<{
    id: number;
    url: string;
    type: string;
  }>;
}

export interface Review {
  id: number;
  film_id?: number;
  title: string;
  content: string;
  author?: string;
  published_at: string;
  rating?: number;
  views: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ReviewDetail extends Review {
  film?: {
    id: number;
    title: string;
    year?: number;
    poster_url?: string;
  };
  images?: Array<{
    id: number;
    url: string;
    type: string;
  }>;
}

export interface Person {
  id: number;
  name: string;
  original_name?: string;
  bio?: string;
  photo_url?: string;
  birth_date?: string;
  role?: string;
}

export interface Image {
  id: number;
  url: string;
  alt_text?: string;
  type: string;
  width?: number;
  height?: number;
  film_id?: number;
  article_id?: number;
  review_id?: number;
}

export interface SearchResult {
  type: "film" | "article" | "review";
  id: number;
  title: string;
  description?: string;
  url: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

