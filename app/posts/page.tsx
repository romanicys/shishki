import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getPosts } from "@/lib/services/posts";
import { getTags } from "@/lib/services/tags";
import { getRubrics } from "@/lib/services/rubrics";

type PostsPageProps = {
  searchParams:
    | Promise<{ page?: string; tag?: string; query?: string; rubric?: string }>
    | { page?: string; tag?: string; query?: string; rubric?: string };
};

const PAGE_SIZE = 12;

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const resolved = await searchParams;
  const page = Number(resolved?.page ?? "1");
  const tag = resolved?.tag ?? undefined;
  const query = resolved?.query ?? undefined;
  const rubric = resolved?.rubric ?? undefined;

  const [posts, tags, rubrics] = await Promise.all([
    getPosts({ page, pageSize: PAGE_SIZE, tag, query, rubric }),
    getTags(),
    getRubrics(),
  ]);

  const baseParams = new URLSearchParams();
  if (tag) baseParams.set("tag", tag);
  if (query) baseParams.set("query", query);
  if (rubric) baseParams.set("rubric", rubric);

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(targetPage));
    return `/posts?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-10 py-6">
      <SectionHeading
        eyebrow="Посты"
        title="Рецензии, подборки и истории"
        description={tag ? `Фильтр по тегу #${tag}` : "Последние заметки из телеграм-архива"}
      />
      {tag && (
        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.45em] text-[var(--muted)]">
          тег
          <span className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-1 text-[0.6rem] text-[var(--foreground)]">
            #{tag}
          </span>
        </div>
      )}
      {rubric && (
        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.45em] text-[var(--muted)]">
          рубрика
          <span className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-1 text-[0.6rem] text-[var(--foreground)]">
            {rubric}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 10).map((item) => (
          <Link
            key={item.id}
            href={`/posts?tag=${item.slug}`}
            className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.45em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
          >
            #{item.name}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {rubrics.map((item) => {
          const params = new URLSearchParams(baseParams);
          params.set("rubric", item.slug);
          params.delete("page");
          return (
            <Link
              key={item.id}
              href={`/posts?${params.toString()}`}
              className="rounded-full border border-[var(--border)] bg-white/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.45em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            >
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.45em] text-[var(--muted)]/70">
        <span className="normal-case tracking-normal text-[var(--muted)]/80">
          Страница {posts.page} из {posts.pages}
        </span>
        <div className="flex gap-3">
          {posts.page > 1 && (
            <Link
              className="rounded-full border border-[var(--border)] px-4 py-2 text-[0.65rem] uppercase tracking-[0.4em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              href={buildPageHref(posts.page - 1)}
            >
              Назад
            </Link>
          )}
          {posts.page < posts.pages && (
            <Link
              className="rounded-full border border-[var(--border)] px-4 py-2 text-[0.65rem] uppercase tracking-[0.4em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              href={buildPageHref(posts.page + 1)}
            >
              Вперед
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
