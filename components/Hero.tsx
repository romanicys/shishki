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
    <section className="relative isolate flex h-[540px] w-full overflow-hidden rounded-[40px] bg-[var(--foreground)] text-white shadow-[0_45px_120px_-60px_rgba(17,16,14,0.65)]">
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
      <div className="absolute inset-0 bg-gradient-to-tr from-black/75 via-black/30 to-transparent" />
      <div className="relative z-10 mt-auto flex w-full flex-col gap-6 px-8 pb-12 pt-24 sm:px-12">
        {eyebrow && (
          <span className="w-fit rounded-full bg-white/10 px-4 py-1 text-[0.65rem] uppercase tracking-[0.55em]">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-5xl leading-tight tracking-[-0.02em] sm:text-6xl">
          {headline}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          {description}
        </p>
        <div className="flex flex-wrap items-center gap-6 text-[0.7rem] uppercase tracking-[0.45em]">
          <Link href={primary.href} className="border-b border-white/60 pb-1 transition hover:border-white">
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="border-b border-white/40 pb-1 text-white/80 transition hover:border-white hover:text-white">
              {secondary.label}
            </Link>
          )}
        </div>
        {byline && (
          <span className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60">
            {byline}
          </span>
        )}
      </div>
    </section>
  );
}
