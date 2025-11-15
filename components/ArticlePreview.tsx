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
      className="group block border border-black/5 bg-white transition hover:scale-[1.02]"
    >
      <div className="grid min-h-[320px] w-full gap-8 p-6 md:grid-cols-2">
        <div className="relative h-64 overflow-hidden bg-black/5 md:h-auto">
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 600px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-black/30">
              Без иллюстрации
            </div>
          )}
          <span className="absolute bottom-4 left-4 bg-white/80 px-3 py-1 text-[0.65rem] uppercase tracking-[0.5em] text-black">
            {publishedAt}
          </span>
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.5em] text-black/50">
              {post.type}
            </p>
            <h3 className="font-display text-3xl leading-tight text-black">
              {post.title}
            </h3>
            {post.subtitle && (
              <p className="text-sm text-black/70">
                {post.subtitle}
              </p>
            )}
          </div>
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-black/60">
            Читать
            <span className="text-lg transition group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
