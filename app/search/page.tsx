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
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-10 text-slate-300">
        <p className="text-xl text-white">Введите запрос в поисковую строку.</p>
        <p>Я найду посты, фильмы и теги по ключевым словам.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 text-slate-100">
      <div className="flex flex-col gap-1">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Поиск</p>
        <h1 className="text-3xl font-semibold text-white">Результаты по «{query}»</h1>
      </div>

      {results.length === 0 && (
        <p className="text-slate-300">По запросу ничего не найдено.</p>
      )}

      <div className="grid gap-4">
        {results.map((item) => (
          <Link
            key={`${item.type}-${item.link}`}
            href={item.link}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 hover:border-amber-400/70"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">{item.type}</p>
              {item.subtitle && <span className="text-xs text-slate-400">{item.subtitle}</span>}
            </div>
            <p className="text-lg font-semibold text-white">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm text-slate-400">{item.subtitle}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
