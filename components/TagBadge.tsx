import Link from "next/link";
import type { BasicTag } from "@/types/api";

export function TagBadge({ tag }: { tag: BasicTag }) {
  return (
    <Link
      href={`/posts?tag=${encodeURIComponent(tag.slug)}`}
      className="rounded-full border border-[var(--border)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.45em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
    >
      {tag.name}
    </Link>
  );
}
