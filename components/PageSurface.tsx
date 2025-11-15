import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageSurfaceProps = {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
};

const toneStyles: Record<NonNullable<PageSurfaceProps["tone"]>, string> = {
  dark: "border-white/10 bg-slate-950/95 text-slate-100 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.75)]",
  light: "border-black/10 bg-white text-slate-900 shadow-[0_45px_90px_-60px_rgba(15,23,42,0.15)]",
};

const toneOverlays: Record<NonNullable<PageSurfaceProps["tone"]>, string> = {
  dark: "bg-[radial-gradient(circle_at_top,#1e293b80,transparent_68%)]",
  light: "bg-[radial-gradient(circle_at_top,#e2e8f080,transparent_68%)]",
};

export function PageSurface({
  children,
  className,
  tone = "dark",
}: PageSurfaceProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden rounded-[40px] border backdrop-blur-xl",
        toneStyles[tone],
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-80",
          toneOverlays[tone],
        )}
      />
      <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
        {children}
      </div>
    </section>
  );
}
