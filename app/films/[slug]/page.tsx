import Image from "next/image";
import Link from "next/link";
import { getFilmBySlug } from "@/lib/services/films";
import { MediaGrid } from "@/components/MediaGrid";
import { notFound } from "next/navigation";

type FilmDetailPageProps = {
  params: Promise<{ slug?: string }> | { slug?: string };
};

export default async function FilmDetailPage({ params }: FilmDetailPageProps) {
  const { slug } = (await params) ?? {};
  if (!slug) {
    notFound();
  }

  const film = await getFilmBySlug(slug);
  if (!film) {
    return <p className="p-4 text-center text-[var(--muted)]">Фильм не найден.</p>;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.45em] text-[var(--muted)]/70">Фильм</p>
        <h1 className="font-display text-4xl text-[var(--foreground)] md:text-5xl">{film.localizedTitle ?? film.title}</h1>
        {film.originalTitle && (
          <p className="text-[0.75rem] uppercase tracking-[0.45em] text-[var(--muted)]/70">
            {film.originalTitle}
          </p>
        )}
        {film.year && <p className="text-sm text-[var(--muted)]/80">Год: {film.year}</p>}
        {film.rating && (
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Рейтинг: {film.rating.toFixed(1)}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {film.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/films?tag=${tag.slug}`}
              className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.45em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>

      {film.poster && (
        <div className="relative h-96 w-full overflow-hidden rounded-[36px] border border-[var(--border)] bg-white/70 shadow-[0_30px_80px_-60px_rgba(24,21,19,0.55)]">
          <Image
            src={film.poster}
            alt={film.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 900px"
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 text-[var(--muted)]">
          {film.description && <p className="text-base leading-relaxed">{film.description}</p>}
          {film.synopsis && (
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]/70">{film.synopsis}</p>
          )}
        </div>
        <div className="space-y-2 text-sm text-[var(--muted)]/80">
          {film.runtime && <p>Длительность: {film.runtime} минут</p>}
          {film.countries && <p>Страны: {film.countries}</p>}
          {film.genres && <p>Жанры: {film.genres}</p>}
        </div>
      </div>

      <MediaGrid medias={film.medias} />

      {film.relatedPosts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--foreground)]">Связанные посты</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {film.relatedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="rounded-3xl border border-[var(--border)] bg-white/70 p-4 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]/70">{post.type}</p>
                <p className="font-display text-xl text-[var(--foreground)]">{post.title}</p>
                {post.excerpt && (
                  <p className="text-sm leading-relaxed text-[var(--muted)]/80">{post.excerpt}</p>
                )}
                <p className="text-xs text-[var(--muted)]/60">
                  {new Date(post.publishedAt).toLocaleDateString("ru-RU")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
