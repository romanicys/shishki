import Image from "next/image";

type MediaItem = {
  id: number;
  url?: string | null;
  type?: "image" | "video";
  alt?: string | null;
};

export function MediaGrid({ medias }: { medias: MediaItem[] }) {
  const filteredMedias = medias.filter((media) => Boolean(media.url));
  if (!filteredMedias.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {filteredMedias.map((media) => (
        <div key={media.id} className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900">
          {media.type === "video" ? (
            <video
              src={media.url!}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
            />
          ) : (
            <Image
              src={media.url!}
              alt={media.alt ?? "Изображение"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 33vw"
            />
          )}
        </div>
      ))}
    </div>
  );
}
