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
      className="block h-full border border-black/5 bg-white p-4 transition hover:scale-[1.02]"
    >
      <div className="flex flex-col gap-4">
        {post.heroImage && (
          <div className="relative h-48 w-full overflow-hidden bg-black/5">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              className="object-cover transition duration-300 hover:scale-105"
              sizes="(max-width: 768px) 90vw, 33vw"
            />
            <span className="absolute bottom-3 left-3 bg-white/80 px-3 py-1 text-[0.6rem] uppercase tracking-[0.5em] text-black">
              {publishedAt}
            </span>
          </div>
        )}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-black/50">
            {post.type}
          </p>
          {post.rubric && (
            <p className="text-[0.65rem] uppercase tracking-[0.5em] text-black/40">
              {post.rubric.title}
            </p>
          )}
          <h3 className="text-xl font-semibold leading-snug text-black line-clamp-2">
            {post.title}
          </h3>
          {post.subtitle && (
            <p className="text-sm text-black/70 line-clamp-3">{post.subtitle}</p>
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
