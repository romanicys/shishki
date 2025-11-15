export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export type PaginatedResponse<T> = PaginationMeta & {
  items: T[];
};

export type BasicTag = {
  id: number;
  slug: string;
  name: string;
  type: string;
};

export type RubricSummary = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
};

export type PostEntities = {
  films: string[];
  names: string[];
  topics: string[];
  links: string[];
};

export type PostCardDto = {
  id: number;
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  type: string;
  publishedAt: string;
  heroImage?: string;
  tags: BasicTag[];
  rubric?: RubricSummary | null;
  entities?: PostEntities | null;
};

export type PostDetailDto = PostCardDto & {
  body: string;
  medias: Array<{
    id: number;
    url: string;
    type: "image" | "video";
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  }>;
  relatedFilms: Array<{
    id: number;
    slug: string;
    title: string;
    year?: number | null;
    posts: Array<{
      id: number;
      slug: string;
      title: string;
      publishedAt: string;
    }>;
  }>;
};

export type FilmCardDto = {
  id: number;
  slug: string;
  title: string;
  localizedTitle?: string | null;
  originalTitle?: string | null;
  year?: number | null;
  rating?: number | null;
  poster?: string;
  posterType?: "image" | "video";
  tags: BasicTag[];
};

export type FilmDetailDto = FilmCardDto & {
  description?: string | null;
  synopsis?: string | null;
  runtime?: number | null;
  countries?: string | null;
  genres?: string | null;
  medias: Array<{
    id: number;
    url: string;
    type: "image" | "video";
    alt?: string | null;
  }>;
  relatedPosts: Array<{
    id: number;
    title: string;
    slug: string;
    type: string;
    publishedAt: string;
    excerpt?: string | null;
    heroImage?: string;
  }>;
};

export type SearchResultDto = {
  type: "post" | "film" | "tag" | "rubric";
  title: string;
  subtitle?: string | null;
  link: string;
};
