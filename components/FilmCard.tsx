import Image from "next/image";
import Link from "next/link";
import type { FilmCardDto } from "@/types/api";

interface FilmCardProps {
  film: FilmCardDto;
}

export function FilmCard({ film }: FilmCardProps) {
  const leadTag = film.tags[0]?.name;
  const accentTags = film.tags.slice(1, 3).map((tag) => tag.name);
  const displayTitle = film.localizedTitle ?? film.title;
  const subtitle = film.originalTitle && film.originalTitle !== displayTitle ? film.originalTitle : null;

  return (
    <Link
      href={`/films/${film.slug}`}
      className="group relative block overflow-hidden rounded-3xl border border-[var(--border)] bg-white/70 shadow-[0_25px_60px_-55px_rgba(24,21,19,0.65)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_40px_100px_-60px_rgba(24,21,19,0.6)]"
    >
      <div className="relative h-[420px] w-full overflow-hidden">
        {film.poster && film.posterType !== "video" ? (
          <Image
            src={film.poster}
            alt={film.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-110"
            priority={false}
          />
        ) : film.poster ? (
          <video
            src={film.poster}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--background)] text-xs uppercase tracking-[0.5em] text-[var(--muted)]">
            Изображение
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-white/80 px-6 py-6 backdrop-blur">
        {leadTag && (
          <span className="text-[0.65rem] uppercase tracking-[0.5em] text-[var(--muted)]/70">
            {leadTag}
          </span>
        )}
        <h3 className="font-display text-2xl leading-snug tracking-[-0.01em] text-[var(--foreground)]">
          {displayTitle}
        </h3>
        {subtitle && (
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[var(--muted-soft)]">
            {subtitle}
          </p>
        )}
        {accentTags.length > 0 && (
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[var(--muted-soft)]">
            {accentTags.join(" / ")}
          </p>
        )}
      </div>
    </Link>
  );
}
