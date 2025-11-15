import Image from "next/image";
import Link from "next/link";
import type { PostCardDto } from "@/types/api";

interface ArticlePreviewProps {
  post: PostCardDto;
}

export function ArticlePreview({ post }: ArticlePreviewProps) {
  const publishedAt = new Date(post.publishedAt).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/70 shadow-[0_25px_60px_-50px_rgba(24,21,19,0.6)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_40px_100px_-60px_rgba(24,21,19,0.58)]"
    >
      <div className="grid min-h-[320px] w-full gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="relative h-64 overflow-hidden rounded-3xl bg-[var(--background)]/70 md:h-auto">
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 600px"
              className="object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.45em] text-[var(--muted)]/60">
              Без иллюстрации
            </div>
          )}
          <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] uppercase tracking-[0.5em] text-[var(--foreground)] shadow-sm">
            {publishedAt}
          </span>
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]/70">
              {post.type}
            </p>
            <h3 className="font-display text-3xl leading-tight text-[var(--foreground)]">
              {post.title}
            </h3>
            {post.subtitle && (
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {post.subtitle}
              </p>
            )}
          </div>
          <div className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.45em] text-[var(--muted-soft)]">
            Читать
            <span className="text-lg transition-transform duration-500 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
