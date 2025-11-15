import Image from "next/image";
import Link from "next/link";

interface HeroAction {
  label: string;
  href: string;
}

interface HeroProps {
  image?: string;
  eyebrow?: string;
  headline: string;
  description: string;
  byline?: string;
  primary: HeroAction;
  secondary?: HeroAction;
}

export function Hero({
  image,
  eyebrow,
  headline,
  description,
  byline,
  primary,
  secondary,
}: HeroProps) {
  return (
    <section className="relative h-[520px] w-full overflow-hidden">
      {image && (
        <Image
          src={image}
          alt={headline}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-10 left-10 flex max-w-2xl flex-col gap-4 text-white">
        {eyebrow && (
          <span className="text-xs font-light uppercase tracking-[0.6em]">
            {eyebrow}
          </span>
        )}
        <h1 className="text-5xl font-medium tracking-tight">{headline}</h1>
        <p className="text-base font-light leading-relaxed">{description}</p>
        <div className="flex items-center gap-6 text-xs font-medium uppercase tracking-[0.4em]">
          <Link href={primary.href} className="underline">
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="underline">
              {secondary.label}
            </Link>
          )}
        </div>
        {byline && (
          <span className="text-[0.65rem] uppercase tracking-[0.5em] text-white/70">
            {byline}
          </span>
        )}
      </div>
    </section>
  );
}
