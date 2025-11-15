import { z } from "zod";

export const mediaItemSchema = z.object({
  id: z.number(),
  message_id: z.number(),
  original_filename: z.string().optional().nullable(),
  file_path: z.string().optional().nullable(),
  media_type: z.string(),
  mime_type: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  message_text: z.string().optional().nullable(),
  original_date: z.string().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
});

export const exportSchema = z.object({
  media_files: z.array(mediaItemSchema),
});

export type MediaItem = z.infer<typeof mediaItemSchema>;

export type MessageGroup = {
  id: number;
  text: string;
  date?: Date;
  items: MediaItem[];
};

export type FilmInfo = {
  title: string;
  year?: number;
};

export type PostEntitiesPayload = {
  films: string[];
  names: string[];
  topics: string[];
  links: string[];
};

export const REVIEW_KEYWORDS = [
  "обзор",
  "реценз",
  "review",
  "разбор",
  "анализ",
];

export const GALLERY_HINTS = ["#screenshots", "#gallery", "#wallpaper", "подборка"];

export const VIDEO_MEDIA_TYPES = new Set(["видео", "video", "файл", "gif"]);

export const RUBRIC_KEYWORDS: Record<string, Array<string>> = {
  "visual-style": ["визуал", "композиция", "свет", "кадр", "цветокор", "color", "visual"],
  music: ["музыка", "саундтрек", "трек", "soundtrack", "ost"],
  shooting: ["съёмка", "съемка", "камера", "объектив", "плёнка", "пленка", "set"],
  inspiration: ["вдохнов", "подборка", "reference", "inspiration", "мудборд"],
  quotes: ["цитата", "сказал", "говорил"],
};

const FILM_PATTERNS: RegExp[] = [
  /«([^»]+)»\s*\((\d{4})\)/,
  /"([^"]+)"\s*\((\d{4})\)/,
  /([A-Za-zА-ЯЁа-яё0-9'’\-:\s]+?)\s*\((\d{4})\)/,
];

const RUS_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ь: "",
  ы: "y",
  ъ: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function normalizeSearchWord(word: string) {
  if (word.endsWith("ya")) {
    return `${word.slice(0, -2)}y`;
  }
  if (word.endsWith("ye")) {
    return word.slice(0, -1);
  }
  if (word.length > 4 && /[aeiuy]$/.test(word)) {
    return word.slice(0, -1);
  }
  return word;
}

export function slugify(value: string): string {
  const prepared = value
    .toLowerCase()
    .split("")
    .map((char) => RUS_MAP[char] ?? char)
    .join("")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return prepared;
}

export function buildFilmSearchKey(title: string, year?: number) {
  const baseSlug = slugify(title);
  if (!baseSlug) return null;
  const canonical = baseSlug
    .split("-")
    .filter(Boolean)
    .map((word) => normalizeSearchWord(word))
    .join("-");
  if (!canonical) return null;
  return `${canonical}-${year ?? "unknown"}`;
}

export function normalizeDate(value?: string | null): Date {
  if (!value) {
    return new Date();
  }
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

export function deriveTitle(text: string, fallback: string) {
  const clean = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (clean && clean.length > 0) {
    return clean.slice(0, 120);
  }
  return fallback;
}

export function deriveSubtitle(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 1 ? lines[1].slice(0, 140) : null;
}

export function extractTags(text: string): string[] {
  const set = new Set<string>();
  const regex = /#([A-Za-zА-Яа-я0-9_]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    set.add(match[1]);
  }
  return Array.from(set);
}

const URL_REGEX = /https?:\/\/[^\s)]+/gi;

export function extractLinks(text: string): string[] {
  return text.match(URL_REGEX) ?? [];
}

export function extractFilmInfo(text: string): FilmInfo | null {
  for (const pattern of FILM_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      return {
        title: match[1].trim(),
        year: Number(match[2]),
      };
    }
  }
  return null;
}

export function buildEntitiesPayload(text: string, tags: string[], filmTitle?: string | null): PostEntitiesPayload {
  return {
    films: filmTitle ? [filmTitle] : [],
    names: [],
    topics: tags.map((tag) => tag.toLowerCase()),
    links: extractLinks(text),
  };
}

export function detectPostType(text: string, mediaCount: number, tags: string[]) {
  const lower = text.toLowerCase();
  if (
    mediaCount >= 3 &&
    (tags.some((tag) => GALLERY_HINTS.includes(`#${tag.toLowerCase()}`)) ||
      lower.includes("#screenshots") ||
      lower.includes("подборка"))
  ) {
    return "GALLERY" as const;
  }
  if (REVIEW_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return "REVIEW" as const;
  }
  if (lower.length > 600) {
    return "ARTICLE" as const;
  }
  return "NEWS" as const;
}

export function buildMessages(items: MediaItem[]): MessageGroup[] {
  const map = new Map<number, MessageGroup>();
  for (const item of items) {
    const messageId = item.message_id;
    if (!messageId) continue;
    const entry = map.get(messageId) ?? {
      id: messageId,
      text: "",
      date: item.original_date ? normalizeDate(item.original_date) : undefined,
      items: [],
    };
    const combined = [item.message_text, item.caption].filter(Boolean).join("\n").trim();
    if (combined && combined.length > entry.text.length) {
      entry.text = combined;
    }
    if (!entry.date && item.original_date) {
      entry.date = normalizeDate(item.original_date);
    }
    entry.items.push(item);
    map.set(messageId, entry);
  }
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export function detectRubricSlug(text: string, tags: string[]): string | null {
  const lower = text.toLowerCase();
  const tagSet = new Set(tags.map((tag) => tag.toLowerCase()));
  for (const [slug, keywords] of Object.entries(RUBRIC_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword) || tagSet.has(keyword))) {
      return slug;
    }
  }
  return null;
}
