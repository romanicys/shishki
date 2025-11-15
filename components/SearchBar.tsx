"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="group flex w-full items-center gap-3 border-b border-[var(--border)] pb-2"
    >
      <Search className="h-4 w-4 text-[var(--muted-soft)] transition-colors group-focus-within:text-[var(--foreground)]" />
      <input
        type="text"
        placeholder="Поиск"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent text-xs uppercase tracking-[0.4em] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/60"
      />
    </form>
  );
}
