import Link from "next/link";
import { searchCatalog } from "@/lib/services/search";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }> | { q?: string };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const query = resolved?.q ?? "";
  const results = await searchCatalog(query);

  if (!query) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 px-4 py-12 text-center text-[var(--muted)]">
        <p className="font-display text-3xl text-[var(--foreground)]">Введите запрос в поисковую строку.</p>
        <p className="text-sm leading-relaxed text-[var(--muted)]/80">
          Я найду посты, фильмы и теги по ключевым словам.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.45em] text-[var(--muted)]/70">Поиск</p>
        <h1 className="font-display text-4xl text-[var(--foreground)]">Результаты по «{query}»</h1>
      </div>

      {results.length === 0 && <p className="text-sm text-[var(--muted)]">По запросу ничего не найдено.</p>}

      <div className="grid gap-4">
        {results.map((item) => (
          <Link
            key={`${item.type}-${item.link}`}
            href={item.link}
            className="rounded-3xl border border-[var(--border)] bg-white/70 p-5 shadow-[0_20px_60px_-50px_rgba(24,21,19,0.45)] transition hover:border-[var(--accent)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]/80">{item.type}</p>
              {item.subtitle && <span className="text-xs text-[var(--muted)]/65">{item.subtitle}</span>}
            </div>
            <p className="font-display text-2xl text-[var(--foreground)]">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm leading-relaxed text-[var(--muted)]/80">{item.subtitle}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
