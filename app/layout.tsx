import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Manrope, Prata } from "next/font/google";
import { SearchBar } from "@/components/SearchBar";

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const display = Prata({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ШишКИНО Journal — кадры и эссе о кино",
  description:
    "Альтернативный кино-журнал: атмосферные кадры, эссе, дневники и редкие находки из телеграм-канала ШишКИНО.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${sans.variable} ${display.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
              <Link
                href="/"
                className="font-display text-2xl tracking-[0.4em] text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
              >
                ШИШКИНО
              </Link>
              <nav className="hidden items-center gap-8 text-[0.7rem] uppercase tracking-[0.45em] text-[var(--muted)] md:flex">
                <Link href="/posts" className="transition-colors hover:text-[var(--foreground)]">
                  Журнал
                </Link>
                <Link href="/films" className="transition-colors hover:text-[var(--foreground)]">
                  Архив
                </Link>
                <Link href="/search" className="transition-colors hover:text-[var(--foreground)]">
                  Поиск
                </Link>
              </nav>
              <div className="hidden w-64 md:block">
                <SearchBar />
              </div>
              <div className="flex items-center gap-5 md:hidden">
                <Link href="/posts" className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--muted)]">
                  Журнал
                </Link>
                <Link href="/films" className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--muted)]">
                  Архив
                </Link>
                <Link href="/search" className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--muted)]">
                  Поиск
                </Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-6xl px-6 pb-4 md:hidden">
              <SearchBar />
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-20">
              {children}
            </div>
          </main>
          <footer className="border-t border-[var(--border)] bg-white/40 py-10 text-center text-[0.65rem] uppercase tracking-[0.45em] text-[var(--muted)]">
            © {new Date().getFullYear()} ШИШКИНО JOURNAL
          </footer>
        </div>
      </body>
    </html>
  );
}
