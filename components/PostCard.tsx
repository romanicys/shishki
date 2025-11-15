import Link from "next/link";
import Image from "next/image";
import type { PostCardDto } from "@/types/api";
import { TagBadge } from "./TagBadge";

export function PostCard({ post }: { post: PostCardDto }) {
  const publishedAt = new Date(post.publishedAt).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block h-full overflow-hidden rounded-[28px] border border-[var(--border)] bg-white/70 p-6 shadow-[0_25px_60px_-55px_rgba(24,21,19,0.62)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_36px_90px_-60px_rgba(24,21,19,0.58)]"
    >
      <div className="flex flex-col gap-4">
        {post.heroImage && (
          <div className="relative h-48 w-full overflow-hidden rounded-3xl bg-[var(--background)]/70">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              className="object-cover transition duration-700 hover:scale-110"
              sizes="(max-width: 768px) 90vw, 33vw"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[0.6rem] uppercase tracking-[0.5em] text-[var(--foreground)] shadow-sm">
              {publishedAt}
            </span>
          </div>
        )}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.45em] text-[var(--muted)]/70">
            {post.type}
          </p>
          {post.rubric && (
            <p className="text-[0.65rem] uppercase tracking-[0.5em] text-[var(--muted-soft)]">
              {post.rubric.title}
            </p>
          )}
          <h3 className="font-display text-2xl leading-snug text-[var(--foreground)] line-clamp-2">
            {post.title}
          </h3>
          {post.subtitle && (
            <p className="text-sm leading-relaxed text-[var(--muted)] line-clamp-3">{post.subtitle}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      </div>
    </Link>
  );
}
