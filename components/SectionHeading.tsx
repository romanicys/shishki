import Link from "next/link";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
};

export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs uppercase tracking-[0.55em] text-[var(--muted)]/70">{eyebrow}</p>
        <h2 className="font-display text-3xl leading-tight text-[var(--foreground)] md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-xs uppercase tracking-[0.45em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
