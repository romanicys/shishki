import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

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
      <body className="bg-white text-black">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6">
              <Link
                href="/"
                className="text-lg font-semibold tracking-[0.6em]"
              >
                ШИШКИНО
              </Link>
              <nav className="flex items-center gap-10 text-sm tracking-[0.4em]">
                <Link href="/posts" className="hover:underline">
                  Журнал
                </Link>
                <Link href="/films" className="hover:underline">
                  Архив
                </Link>
                <Link href="/search" className="hover:underline">
                  Поиск
                </Link>
              </nav>
              <div className="w-64">
                <SearchBar />
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-20">
              {children}
            </div>
          </main>
          <footer className="border-t border-black/10 py-10 text-center text-xs tracking-[0.5em]">
            © {new Date().getFullYear()} ШИШКИНО JOURNAL
          </footer>
        </div>
      </body>
    </html>
  );
}
