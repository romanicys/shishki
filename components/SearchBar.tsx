'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

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
    <form onSubmit={handleSearch} className="flex w-full items-center gap-3 border-b border-black/10 pb-1">
      <Search className="h-4 w-4 text-black/60" />
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent text-sm uppercase tracking-[0.4em] outline-none placeholder:text-black/30"
      />
    </form>
  );
}
