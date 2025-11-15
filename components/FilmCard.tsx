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
      className="group block border border-black/5 bg-white transition hover:scale-[1.02]"
    >
      <div className="relative h-[420px] w-full overflow-hidden">
        {film.poster && film.posterType !== "video" ? (
          <Image
            src={film.poster}
            alt={film.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
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
          <div className="flex h-full items-center justify-center bg-black/5 text-sm uppercase tracking-[0.5em] text-black/50">
            Изображение
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 border-t border-black/10 px-4 py-5">
        {leadTag && (
          <span className="text-[0.65rem] uppercase tracking-[0.5em] text-black/40">
            {leadTag}
          </span>
        )}
        <h3 className="text-2xl font-medium tracking-tight">
          {displayTitle}
        </h3>
        {subtitle && (
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            {subtitle}
          </p>
        )}
        {accentTags.length > 0 && (
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">
            {accentTags.join(" / ")}
          </p>
        )}
      </div>
    </Link>
  );
}
