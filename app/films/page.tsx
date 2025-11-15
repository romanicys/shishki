import { TagType } from "@prisma/client";
import Link from "next/link";
import { FilmCard } from "@/components/FilmCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getFilms } from "@/lib/services/films";
import { getTags } from "@/lib/services/tags";

interface FilmsPageProps {
  searchParams: {
    page?: string;
    tag?: string;
    query?: string;
    year?: string;
  };
}

const PAGE_SIZE = 12;

export default async function FilmsPage({ searchParams }: FilmsPageProps) {
  const page = Number(searchParams.page ?? "1");
  const tag = searchParams.tag ?? undefined;
  const query = searchParams.query ?? undefined;
  const year = searchParams.year ? Number(searchParams.year) : undefined;

  const [films, tags] = await Promise.all([
    getFilms({ page, pageSize: PAGE_SIZE, tag, query, year }),
    getTags(TagType.GENRE),
  ]);

  const baseParams = new URLSearchParams();
  if (tag) baseParams.set("tag", tag);
  if (query) baseParams.set("query", query);
  if (year) baseParams.set("year", String(year));

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(targetPage));
    return `/films?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-12 py-8">
      <SectionHeading
        eyebrow="Фокус киноархива"
        title="Архив кадр за кадром"
        description="Подборка редких кадров и забытых витрин кино, собранная из телеграм-канала."
      />

      <div className="flex gap-3 overflow-x-auto py-2">
        {tags.slice(0, 10).map((item) => (
          <Link
            key={item.id}
            href={`/films?tag=${item.slug}`}
            className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.5em] text-slate-300 transition hover:border-amber-400 hover:text-amber-200"
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {films.items.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.45em] text-slate-400">
        <span>
          Страница {films.page} из {films.pages}
        </span>
        <div className="flex gap-3">
          {films.page > 1 && (
            <Link
              className="border-b border-white/30 pb-1 text-slate-300 hover:text-white"
              href={buildHref(films.page - 1)}
            >
              Назад
            </Link>
          )}
          {films.page < films.pages && (
            <Link
              className="border-b border-white/30 pb-1 text-slate-300 hover:text-white"
              href={buildHref(films.page + 1)}
            >
              Вперед
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
