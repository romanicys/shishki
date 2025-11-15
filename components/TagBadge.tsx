import Link from "next/link";
import type { BasicTag } from "@/types/api";

export function TagBadge({ tag }: { tag: BasicTag }) {
  return (
    <Link
      href={`/posts?tag=${encodeURIComponent(tag.slug)}`}
      className="border border-black/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-black transition hover:underline"
    >
      {tag.name}
    </Link>
  );
}
