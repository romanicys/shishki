import { Hero } from "@/components/Hero";
import { FilmCard } from "@/components/FilmCard";
import { ArticlePreview } from "@/components/ArticlePreview";
import { SectionHeading } from "@/components/SectionHeading";
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
    <div className="flex flex-col gap-24">
      <Hero
        image={heroPost?.heroImage ?? heroFilm?.poster}
        eyebrow={heroPost?.type}
        headline={heroPost?.title ?? "ШишКИНО Journal"}
        description={heroDescription}
        byline={heroFilm ? `Кадр · ${heroFilm.localizedTitle ?? heroFilm.title}` : undefined}
        primary={{ label: "Читать журнал", href: "/posts" }}
        secondary={{ label: "Киноархив", href: "/films" }}
      />

      <section className="grid items-end gap-10 rounded-[36px] border border-[var(--border)] bg-white/70 p-8 md:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] md:p-12">
        <div className="space-y-4">
          <p className="text-[0.65rem] uppercase tracking-[0.5em] text-[var(--muted)]/70">Последний фокус</p>
          <h2 className="font-display text-4xl leading-tight text-[var(--foreground)] md:text-5xl">
            {heroFilm?.localizedTitle ?? heroFilm?.title}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Выдержки из архива: редкие кадры, найденные в хронике канала.
          </p>
        </div>
        <div>
          {heroFilm && <FilmCard film={heroFilm} />}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Киноархив"
          title="Современные кадры"
          description="Выборка свежих визуальных находок и зацепок из телеграм-ленты."
          action={{ label: "Смотреть всё", href: "/films" }}
        />
        <div className="grid gap-8 md:grid-cols-3">
          {films.items.slice(0, 3).map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Журнал"
          title="Эссе и дневники"
          description="Истории, заметки и наблюдения о киноязыке, собранные в одном месте."
          action={{ label: "Все выпуски", href: "/posts" }}
        />
        <div className="grid gap-10 lg:grid-cols-2">
          {posts.items.map((post) => (
            <ArticlePreview key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
