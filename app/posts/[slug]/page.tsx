import Image from "next/image";
import Link from "next/link";
import { getPostBySlug } from "@/lib/services/posts";
import { MediaGrid } from "@/components/MediaGrid";
import { TagBadge } from "@/components/TagBadge";
import { notFound } from "next/navigation";

type PostDetailPageProps = {
  params: Promise<{ slug?: string }> | { slug?: string };
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = (await params) ?? {};
  if (!slug) {
    notFound();
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    return <p className="p-4 text-center text-[var(--muted)]">Пост не найден.</p>;
  }
  const galleryMedias = post.heroImage
    ? post.medias.filter((media) => media.url !== post.heroImage)
    : post.medias;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-[0.45em] text-[var(--muted)]/70">{post.type}</p>
          {post.rubric && (
            <span className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.45em] text-[var(--muted)]">
              {post.rubric.title}
            </span>
          )}
        </div>
        <h1 className="font-display text-4xl text-[var(--foreground)] md:text-5xl">{post.title}</h1>
        {post.subtitle && (
          <p className="text-lg leading-relaxed text-[var(--muted)]/85">{post.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
        {post.entities && post.entities.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.4em] text-[var(--muted)]/65">
            {post.entities.topics.slice(0, 4).map((topic) => (
              <span key={topic} className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1">
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.heroImage && (
        <div className="relative h-72 w-full overflow-hidden rounded-[36px] border border-[var(--border)] bg-white/70 shadow-[0_30px_80px_-60px_rgba(24,21,19,0.55)]">
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 900px"
          />
        </div>
      )}

      <div className="space-y-4 text-[var(--muted)]">
        {post.body.split("\n\n").map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <MediaGrid medias={galleryMedias} />

      {post.relatedFilms.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[var(--foreground)]">Связанные фильмы</h2>
          <div className="grid grid-cols-1 gap-3 text-sm text-[var(--muted)] md:grid-cols-2">
            {post.relatedFilms.map((film) => (
              <div
                key={film.id}
                className="space-y-3 rounded-3xl border border-[var(--border)] bg-white/70 p-4"
              >
                <div className="space-y-1">
                  <p className="font-display text-lg text-[var(--foreground)]">{film.title}</p>
                  {film.year && (
                    <p className="text-sm text-[var(--muted)]/75">Год выпуска: {film.year}</p>
                  )}
                </div>
                {film.posts.length > 0 && (
                  <div className="space-y-1 text-xs uppercase tracking-[0.35em] text-[var(--muted)]/65">
                    <p>Ещё посты:</p>
                    <div className="flex flex-col gap-1 text-[var(--muted)] normal-case tracking-normal">
                      {film.posts.map((related) => (
                        <Link
                          key={related.id}
                          href={`/posts/${related.slug}`}
                          className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
                        >
                          {related.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
