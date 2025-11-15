import filmAliases from "@/data/film-aliases.json";
import { buildFilmSearchKey, slugify, type FilmInfo } from "./transform";

type FilmAlias = {
  id: string;
  title: string;
  originalTitle?: string | null;
  year?: number;
  countries?: string;
  aliases: string[];
};

type TmdbMovieSearchResult = {
  id: number;
  title: string;
  original_title: string;
  overview?: string;
  release_date?: string;
  origin_country?: string[];
};

type EnrichOptions = {
  allowTmdb?: boolean;
};

export type EnrichedFilmInfo = FilmInfo & {
  normalizedTitle?: string;
  localizedTitle?: string;
  countries?: string;
  aliasId?: string;
  source?: "alias" | "tmdb" | "detected";
  overview?: string | null;
  tmdbId?: number;
};

const aliasIndex = new Map<string, FilmAlias>();
let aliasesPrimed = false;

function primeAliasIndex() {
  if (aliasesPrimed) return;
  for (const entry of filmAliases as FilmAlias[]) {
    const baseKey = buildFilmSearchKey(entry.title, entry.year) ?? slugify(entry.title);
    if (baseKey && !aliasIndex.has(baseKey)) {
      aliasIndex.set(baseKey, entry);
    }
    for (const alias of entry.aliases ?? []) {
      const aliasKey = buildFilmSearchKey(alias, entry.year) ?? slugify(alias);
      if (aliasKey && !aliasIndex.has(aliasKey)) {
        aliasIndex.set(aliasKey, entry);
      }
    }
  }
  aliasesPrimed = true;
}

export function findAliasForFilm(info: FilmInfo): FilmAlias | null {
  primeAliasIndex();
  const key = buildFilmSearchKey(info.title, info.year) ?? slugify(info.title);
  if (!key) return null;
  return aliasIndex.get(key) ?? null;
}

function parseYear(value?: string) {
  if (!value) return undefined;
  const [year] = value.split("-");
  const parsed = Number(year);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const tmdbCache = new Map<string, TmdbMovieSearchResult | null>();

async function fetchFromTmdb(info: FilmInfo): Promise<TmdbMovieSearchResult | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return null;
  }
  const key = `${info.title.toLowerCase()}-${info.year ?? "unknown"}`;
  if (tmdbCache.has(key)) {
    return tmdbCache.get(key) ?? null;
  }
  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("query", info.title);
  if (info.year) {
    url.searchParams.set("year", String(info.year));
  }
  url.searchParams.set("language", "ru-RU");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("page", "1");
  url.searchParams.set("api_key", apiKey);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      tmdbCache.set(key, null);
      return null;
    }
    const payload = (await response.json()) as { results?: TmdbMovieSearchResult[] };
    const match = payload.results?.[0] ?? null;
    tmdbCache.set(key, match ?? null);
    return match ?? null;
  } catch (error) {
    console.warn("⚠️  TMDB lookup failed:", error);
    tmdbCache.set(key, null);
    return null;
  }
}

export async function enrichFilmMetadata(info: FilmInfo, options: EnrichOptions = {}): Promise<EnrichedFilmInfo> {
  const alias = findAliasForFilm(info);
  if (alias) {
    return {
      ...info,
      normalizedTitle: alias.originalTitle ?? alias.title ?? info.title,
      localizedTitle: alias.title ?? info.title,
      year: alias.year ?? info.year,
      countries: alias.countries,
      aliasId: alias.id,
      source: "alias",
    };
  }

  if (options.allowTmdb !== false) {
    const tmdbResult = await fetchFromTmdb(info);
    if (tmdbResult) {
      return {
        ...info,
        normalizedTitle: tmdbResult.original_title ?? info.title,
        localizedTitle: tmdbResult.title ?? info.title,
        year: parseYear(tmdbResult.release_date) ?? info.year,
        overview: tmdbResult.overview ?? null,
        countries: tmdbResult.origin_country?.join(", "),
        source: "tmdb",
        tmdbId: tmdbResult.id,
      };
    }
  }

  return {
    ...info,
    localizedTitle: info.title,
    normalizedTitle: info.title,
    source: "detected",
  };
}
