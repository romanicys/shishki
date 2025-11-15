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
    return <p className="p-6 text-center text-slate-200">Фильм не найден.</p>;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 text-slate-100">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Фильм</p>
        <h1 className="text-4xl font-semibold text-white">{film.localizedTitle ?? film.title}</h1>
        {film.originalTitle && (
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
            {film.originalTitle}
          </p>
        )}
        {film.year && <p className="text-sm text-slate-400">Год: {film.year}</p>}
        {film.rating && (
          <p className="text-sm font-semibold text-amber-300">Рейтинг: {film.rating.toFixed(1)}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {film.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/films?tag=${tag.slug}`}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200 transition hover:border-amber-400 hover:text-amber-200"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>

      {film.poster && (
        <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-white/10">
          <Image
            src={film.poster}
            alt={film.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 900px"
          />
        </div>
      )}

      <div className="grid gap-6 text-slate-200 md:grid-cols-2">
        <div className="space-y-4">
          {film.description && <p className="text-base leading-relaxed">{film.description}</p>}
          {film.synopsis && (
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{film.synopsis}</p>
          )}
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          {film.runtime && <p>Длительность: {film.runtime} минут</p>}
          {film.countries && <p>Страны: {film.countries}</p>}
          {film.genres && <p>Жанры: {film.genres}</p>}
        </div>
      </div>

      <MediaGrid medias={film.medias} />

      {film.relatedPosts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">Связанные посты</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {film.relatedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-100 transition hover:border-amber-400"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-amber-300">{post.type}</p>
                <p className="text-lg font-semibold text-white">{post.title}</p>
                {post.excerpt && (
                  <p className="text-sm text-slate-300">{post.excerpt}</p>
                )}
                <p className="text-xs text-slate-500">
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
