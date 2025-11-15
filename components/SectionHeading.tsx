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
      <div className="max-w-2xl space-y-2">
        <p className="text-xs uppercase tracking-[0.6em] text-amber-200/80">{eyebrow}</p>
        <h2 className="font-display text-3xl leading-tight text-white md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-xs uppercase tracking-[0.4em] text-amber-200 transition hover:text-white"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
