import { prisma } from "@/lib/prisma";
import { SearchResultDto } from "@/types/api";

const DEFAULT_LIMIT = 12;

export async function searchCatalog(query: string): Promise<SearchResultDto[]> {
  const term = query.trim();
  if (!term) {
    return [];
  }

  const [posts, films, tags, rubrics] = await Promise.all([
    prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: term } },
          { subtitle: { contains: term } },
          { body: { contains: term } },
        ],
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: DEFAULT_LIMIT,
    }),
    prisma.film.findMany({
      where: {
        OR: [
          { title: { contains: term } },
          { localizedTitle: { contains: term } },
          { originalTitle: { contains: term } },
          { normalizedTitle: { contains: term } },
          { description: { contains: term } },
          { synopsis: { contains: term } },
        ],
      },
      take: DEFAULT_LIMIT,
    }),
    prisma.tag.findMany({
      where: {
        OR: [
          { name: { contains: term } },
          { slug: { contains: term } },
        ],
      },
      take: DEFAULT_LIMIT,
    }),
    prisma.rubric.findMany({
      where: {
        OR: [
          { title: { contains: term } },
          { description: { contains: term } },
        ],
      },
      orderBy: {
        sortOrder: "asc",
      },
      take: DEFAULT_LIMIT,
    }),
  ]);

  const results: SearchResultDto[] = [];
  results.push(
    ...posts.map((post) => ({
      type: "post" as const,
      title: post.title,
      subtitle: post.excerpt ?? null,
      link: `/posts/${post.slug}`,
    })),
  );
  results.push(
    ...films.map((film) => ({
      type: "film" as const,
      title: film.title,
      subtitle: film.year ? String(film.year) : null,
      link: `/films/${film.slug}`,
    })),
  );
  results.push(
    ...tags.map((tag) => ({
      type: "tag" as const,
      title: tag.name,
      subtitle: tag.type,
      link: `/posts?tag=${tag.slug}`,
    })),
  );
  results.push(
    ...rubrics.map((rubric) => ({
      type: "rubric" as const,
      title: rubric.title,
      subtitle: rubric.description ?? null,
      link: `/posts?rubric=${rubric.slug}`,
    })),
  );

  return results;
}
