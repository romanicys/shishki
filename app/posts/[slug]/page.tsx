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
    return <p className="p-6 text-center text-slate-200">Пост не найден.</p>;
  }
  const galleryMedias = post.heroImage
    ? post.medias.filter((media) => media.url !== post.heroImage)
    : post.medias;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 text-slate-100">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">{post.type}</p>
          {post.rubric && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.4em] text-slate-300">
              {post.rubric.title}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-semibold text-white">{post.title}</h1>
        {post.subtitle && (
          <p className="text-lg text-slate-300">{post.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
        {post.entities && post.entities.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.4em] text-slate-400">
            {post.entities.topics.slice(0, 4).map((topic) => (
              <span key={topic} className="rounded-full border border-white/10 px-3 py-1">
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.heroImage && (
        <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 900px"
          />
        </div>
      )}

      <div className="space-y-4 text-slate-200">
        {post.body.split("\n\n").map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <MediaGrid medias={galleryMedias} />

      {post.relatedFilms.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Связанные фильмы</h2>
          <div className="grid grid-cols-1 gap-3 text-sm text-slate-200 md:grid-cols-2">
            {post.relatedFilms.map((film) => (
              <div
                key={film.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-3"
              >
                <div>
                  <p className="text-lg font-semibold text-white">{film.title}</p>
                  {film.year && (
                    <p className="text-sm text-slate-400">Год выпуска: {film.year}</p>
                  )}
                </div>
                {film.posts.length > 0 && (
                  <div className="space-y-1 text-xs uppercase tracking-[0.35em] text-slate-400">
                    <p>Ещё посты:</p>
                    <div className="flex flex-col gap-1 text-white normal-case tracking-normal">
                      {film.posts.map((related) => (
                        <Link
                          key={related.id}
                          href={`/posts/${related.slug}`}
                          className="text-sm text-slate-200 hover:text-white"
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
