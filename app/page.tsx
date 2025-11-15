import Link from "next/link";
import { Hero } from "@/components/Hero";
import { FilmCard } from "@/components/FilmCard";
import { ArticlePreview } from "@/components/ArticlePreview";
import { getFilms } from "@/lib/services/films";
import { getPosts } from "@/lib/services/posts";

const PAGE_SIZE = 4;

export default async function Home() {
  const [posts, films] = await Promise.all([
    getPosts({ page: 1, pageSize: PAGE_SIZE }),
    getFilms({ page: 1, pageSize: PAGE_SIZE }),
  ]);

  const heroPost = posts.items[0];
  const heroFilm = films.items[0];
  const heroDescription =
    heroPost?.subtitle ?? heroPost?.excerpt ?? "Диалоги о светах, тенях и режиссёрских импульсах.";

  return (
    <div className="flex flex-col gap-28">
      <Hero
        image={heroPost?.heroImage ?? heroFilm?.poster}
        eyebrow={heroPost?.type}
        headline={heroPost?.title ?? "ШишКИНО Journal"}
        description={heroDescription}
        byline={heroFilm ? `Кадр · ${heroFilm.localizedTitle ?? heroFilm.title}` : undefined}
        primary={{ label: "Читать журнал", href: "/posts" }}
        secondary={{ label: "Киноархив", href: "/films" }}
      />

      <section className="grid grid-cols-12 items-end gap-6">
        <div className="col-span-12 space-y-4 md:col-span-5">
          <p className="text-xs uppercase tracking-[0.5em] text-black/50">Последний фокус</p>
          <h2 className="text-5xl font-medium tracking-tight">
            {heroFilm?.localizedTitle ?? heroFilm?.title}
          </h2>
          <p className="text-sm text-black/60">
            Выдержки из архива: редкие кадры, найденные в хронике канала.
          </p>
        </div>
        <div className="col-span-12 md:col-span-7">
          {heroFilm && <FilmCard film={heroFilm} />}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-black/50">Киноархив</p>
            <h2 className="text-4xl font-medium tracking-tight">Современные кадры</h2>
          </div>
          <Link href="/films" className="text-xs uppercase tracking-[0.5em] underline">
            Смотреть всё
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {films.items.slice(0, 3).map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-black/50">Журнал</p>
            <h2 className="text-4xl font-medium tracking-tight">Эссе и дневники</h2>
          </div>
          <Link href="/posts" className="text-xs uppercase tracking-[0.5em] underline">
            Все выпуски
          </Link>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          {posts.items.map((post) => (
            <ArticlePreview key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
