import Link from "next/link";

import { searchCatalog } from "@/lib/services/search";
import { SearchResultDto } from "@/types/api";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }> | { q?: string };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const query = resolved?.q ?? "";
  const results = await searchCatalog(query);

  if (!query) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center text-slate-300">
        <p className="text-2xl font-medium text-white">
          Введите запрос, чтобы начать поиск.
        </p>
        <p className="max-w-md text-sm text-slate-400">
          Я найду посты, фильмы и рубрики по ключевым словам и покажу краткие карточки с переходами.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-slate-100">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.45em] text-amber-300">Поиск</p>
        <h1 className="text-4xl font-semibold text-white">Результаты по «{query}»</h1>
      </div>

      {results.length === 0 && (
        <p className="text-sm text-slate-300">По запросу ничего не найдено.</p>
      )}

      <div className="grid gap-4">
        {results.map((item) => (
          <Link
            key={`${item.type}-${item.link}`}
            href={item.link}
            className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-amber-400/80 hover:bg-slate-900"
          >
            <p className="text-xs uppercase tracking-[0.45em] text-amber-300">
              {typeLabels[item.type]}
            </p>
            <p className="mt-3 text-xl font-semibold leading-tight text-white">{item.title}</p>
            {item.subtitle && (
              <p className="mt-2 text-sm text-slate-400">{item.subtitle}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

const typeLabels: Record<SearchResultDto["type"], string> = {
  post: "Журнал",
  film: "Фильм",
  tag: "Тег",
  rubric: "Рубрика",
};
