import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAssetUrl } from "@/lib/assets";
import { FilmCardDto, FilmDetailDto } from "@/types/api";
import { resolvePage, resolvePageSize } from "./pagination";

const DEFAULT_PAGE_SIZE = 12;

type FilmFilters = {
  page?: number;
  pageSize?: number;
  tag?: string;
  query?: string;
  year?: number;
};

export async function getFilms(filters: FilmFilters) {
  const page = resolvePage(filters.page);
  const pageSize = resolvePageSize(filters.pageSize, DEFAULT_PAGE_SIZE);
  const where: Prisma.FilmWhereInput = {};

  if (filters.tag) {
    where.tags = {
      some: {
        tag: {
          slug: filters.tag,
        },
      },
    };
  }
  if (typeof filters.year === "number" && Number.isFinite(filters.year)) {
    where.year = Math.trunc(filters.year);
  }
  if (filters.query) {
    const term = filters.query.trim();
    if (term) {
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
        { synopsis: { contains: term } },
      ];
    }
  }

  const total = await prisma.film.count({ where });
  const films = await prisma.film.findMany({
    where,
    include: {
      posterImage: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [
      { rating: "desc" },
      { year: "desc" },
    ],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const items: FilmCardDto[] = films.map((film) => ({
    id: film.id,
    slug: film.slug,
    title: film.localizedTitle ?? film.title,
    localizedTitle: film.localizedTitle,
    originalTitle: film.originalTitle ?? film.normalizedTitle,
    year: film.year,
    rating: film.rating,
    poster: getAssetUrl(film.posterImage?.fileName),
    posterType: film.posterImage?.type === "VIDEO" ? "video" : "image",
    tags: film.tags.map((entry) => ({
      id: entry.tag.id,
      slug: entry.tag.slug,
      name: entry.tag.name,
      type: entry.tag.type,
    })),
  }));

  return {
    items,
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getFilmBySlug(slug: string): Promise<FilmDetailDto | null> {
  const film = await prisma.film.findUnique({
    where: { slug },
    include: {
      posterImage: true,
      medias: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      postLinks: {
        include: {
          post: {
            include: {
              medias: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
            },
          },
        },
      },
    },
  });

  if (!film) {
    return null;
  }

  return {
    id: film.id,
    slug: film.slug,
    title: film.localizedTitle ?? film.title,
    localizedTitle: film.localizedTitle,
    originalTitle: film.originalTitle ?? film.normalizedTitle,
    year: film.year,
    rating: film.rating,
    poster: getAssetUrl(film.posterImage?.fileName),
    description: film.description,
    synopsis: film.synopsis,
    runtime: film.runtime,
    countries: film.countries,
    genres: film.genres,
    tags: film.tags.map((entry) => ({
      id: entry.tag.id,
      slug: entry.tag.slug,
      name: entry.tag.name,
      type: entry.tag.type,
    })),
    medias: film.medias.map((media) => ({
      id: media.id,
      url: getAssetUrl(media.fileName) ?? "",
      type: media.type === "VIDEO" ? "video" : "image",
      alt: media.alt,
    })),
    relatedPosts: film.postLinks
      .filter((link) => link.post !== null)
      .map((link) => ({
        id: link.post!.id,
        slug: link.post!.slug,
        title: link.post!.title,
        type: link.post!.type,
        publishedAt: link.post!.publishedAt.toISOString(),
        excerpt: link.post!.excerpt,
        heroImage: getAssetUrl(link.post!.heroImage ?? link.post!.medias[0]?.fileName),
      })),
  };
}
