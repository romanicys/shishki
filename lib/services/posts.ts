import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PostType } from "@prisma/client";
import { PostCardDto, PostDetailDto, PostEntities } from "@/types/api";
import { getAssetUrl } from "@/lib/assets";
import { resolvePage, resolvePageSize } from "./pagination";

const DEFAULT_PAGE_SIZE = 12;

const buildPagination = (total: number, page: number, pageSize: number) => {
  return {
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
};

const emptyEntities: PostEntities = {
  films: [],
  names: [],
  topics: [],
  links: [],
};
function normalizeEntities(value: Prisma.JsonValue | null): PostEntities | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const source = value as Record<string, unknown>;
  return {
    films: Array.isArray(source.films) ? source.films.map(String) : emptyEntities.films,
    names: Array.isArray(source.names) ? source.names.map(String) : emptyEntities.names,
    topics: Array.isArray(source.topics) ? source.topics.map(String) : emptyEntities.topics,
    links: Array.isArray(source.links) ? source.links.map(String) : emptyEntities.links,
  };
}

const mapRubric = (rubric?: { id: number; slug: string; title: string; description: string | null }) =>
  rubric
    ? {
        id: rubric.id,
        slug: rubric.slug,
        title: rubric.title,
        description: rubric.description,
      }
    : null;

type PostListFilters = {
  page?: number;
  pageSize?: number;
  tag?: string;
  type?: PostType;
  query?: string;
  rubric?: string;
};

export async function getPosts(filters: PostListFilters) {
  const page = resolvePage(filters.page);
  const pageSize = resolvePageSize(filters.pageSize, DEFAULT_PAGE_SIZE);
  const where: Prisma.PostWhereInput = {};

  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.tag) {
    where.tags = {
      some: {
        tag: {
          slug: filters.tag,
        },
      },
    };
  }
  if (filters.rubric) {
    where.rubric = {
      slug: filters.rubric,
    };
  }
  if (filters.query) {
    const term = filters.query.trim();
    if (term) {
      where.OR = [
        { title: { contains: term } },
        { body: { contains: term } },
        { excerpt: { contains: term } },
      ];
    }
  }

  const total = await prisma.post.count({ where });
  const posts = await prisma.post.findMany({
    where,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      medias: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      rubric: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const items: PostCardDto[] = posts.map((post) => {
    const hero = post.medias[0];
    const heroPath = post.heroImage ?? hero?.fileName ?? undefined;
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle,
      type: post.type,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt.toISOString(),
      heroImage: heroPath ? getAssetUrl(heroPath) : undefined,
      tags: post.tags.map((entry) => ({
        id: entry.tag.id,
        slug: entry.tag.slug,
        name: entry.tag.name,
        type: entry.tag.type,
      })),
      rubric: mapRubric(post.rubric ?? undefined),
      entities: normalizeEntities(post.entities),
    };
  });

  return {
    items,
    ...buildPagination(total, page, pageSize),
  };
}

export async function getPostBySlug(slug: string): Promise<PostDetailDto | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      medias: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      postFilms: {
        include: {
          film: true,
        },
      },
      rubric: true,
    },
  });

  if (!post) {
    return null;
  }

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    type: post.type,
    publishedAt: post.publishedAt.toISOString(),
    body: post.body,
    heroImage: getAssetUrl(post.heroImage ?? post.medias[0]?.fileName),
    tags: post.tags.map((entry) => ({
      id: entry.tag.id,
      slug: entry.tag.slug,
      name: entry.tag.name,
      type: entry.tag.type,
    })),
    medias: post.medias.map((media) => ({
      id: media.id,
      url: getAssetUrl(media.fileName) ?? "",
      type: media.type === "VIDEO" ? "video" : "image",
      alt: media.alt,
      width: media.width,
      height: media.height,
    })),
    rubric: mapRubric(post.rubric ?? undefined),
    entities: normalizeEntities(post.entities),
    relatedFilms: await Promise.all(
      post.postFilms
        .filter((link) => link.film !== null)
        .map(async (link) => {
          const related = await prisma.postFilm.findMany({
            where: {
              filmId: link.filmId,
              postId: { not: post.id },
            },
            include: {
              post: true,
            },
            orderBy: {
              post: {
                publishedAt: "desc",
              },
            },
            take: 4,
          });
          return {
            id: link.film!.id,
            slug: link.film!.slug,
            title: link.film!.title,
            year: link.film!.year,
            posts: related
              .filter((entry) => entry.post !== null)
              .map((entry) => ({
                id: entry.post!.id,
                slug: entry.post!.slug,
                title: entry.post!.title,
                publishedAt: entry.post!.publishedAt.toISOString(),
              })),
          };
        }),
    ),
  };
}
