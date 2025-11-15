import fs from "node:fs";
import { once } from "node:events";
import path from "node:path";
import * as fsp from "node:fs/promises";
import {
  buildEntitiesPayload,
  buildMessages,
  deriveSubtitle,
  deriveTitle,
  detectPostType,
  detectRubricSlug,
  exportSchema,
  extractFilmInfo,
  extractTags,
  type MediaItem,
  type MessageGroup,
  slugify,
  VIDEO_MEDIA_TYPES,
} from "./telegram/transform";
import { enrichFilmMetadata, type EnrichedFilmInfo } from "./telegram/film";

const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), "data", "etl");

type CliArgs = {
  jsonPath?: string;
  outDir?: string;
  since?: string;
  limit?: number;
  tmdb?: boolean;
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--json" && argv[index + 1]) {
      args.jsonPath = argv[index + 1];
      index += 1;
    } else if (token === "--out" && argv[index + 1]) {
      args.outDir = argv[index + 1];
      index += 1;
    } else if (token === "--since" && argv[index + 1]) {
      args.since = argv[index + 1];
      index += 1;
    } else if (token === "--limit" && argv[index + 1]) {
      args.limit = Number(argv[index + 1]);
      index += 1;
    } else if (token === "--tmdb" && argv[index + 1]) {
      const value = argv[index + 1].toLowerCase();
      args.tmdb = value !== "false" && value !== "0";
      index += 1;
    } else if (token === "--no-tmdb") {
      args.tmdb = false;
    }
  }
  return args;
}

function validateSince(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Некорректное значение для --since: ${value}`);
  }
  return parsed;
}

type RawMediaRecord = {
  telegram_media_id: number;
  file_path: string | null;
  original_filename: string | null;
  media_type: string | null;
  mime_type: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

type RawPostRecord = {
  message_id: number;
  message_date: string | null;
  message_text: string;
  media: RawMediaRecord[];
  payload: {
    items: MediaItem[];
  };
};

type ParsedMediaRecord = {
  telegram_media_id: number;
  sort_order: number;
  type: "image" | "video";
  file_path: string | null;
  original_filename: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

type ParsedPostRecord = {
  message_id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  post_type: ReturnType<typeof detectPostType>;
  published_at: string;
  excerpt: string | null;
  tags: string[];
  rubric_slug: string | null;
  hero_media_id: number | null;
  media: ParsedMediaRecord[];
  film: {
    title: string;
    normalized_title: string | undefined;
    year: number | undefined;
    countries: string | undefined;
    alias_id: string | undefined;
    source: EnrichedFilmInfo["source"];
    tmdb_id: number | undefined;
  } | null;
  entities: ReturnType<typeof buildEntitiesPayload>;
};

type FilmRecord = {
  slug: string;
  title: string;
  normalized_title?: string;
  original_title?: string;
  year?: number;
  countries?: string;
  alias_id?: string;
  source?: string;
  tmdb_id?: number;
  overview?: string | null;
};

type TopicAggregate = {
  slug: string;
  label: string;
  type: "hashtag" | "rubric";
  postIds: Set<number>;
};

type TopicRecord = {
  slug: string;
  label: string;
  type: "hashtag" | "rubric";
  post_count: number;
};

async function writeRecord(stream: fs.WriteStream, record: unknown) {
  const payload = `${JSON.stringify(record)}\n`;
  if (!stream.write(payload)) {
    await once(stream, "drain");
  }
}

async function closeStream(stream: fs.WriteStream) {
  await new Promise<void>((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
    stream.end();
  });
}

function mapRawMedia(item: MediaItem): RawMediaRecord {
  return {
    telegram_media_id: item.id,
    file_path: item.file_path ?? null,
    original_filename: item.original_filename ?? null,
    media_type: item.media_type ?? null,
    mime_type: item.mime_type ?? null,
    caption: item.caption ?? null,
    width: item.width ?? null,
    height: item.height ?? null,
  };
}

function mapParsedMedia(item: MediaItem, index: number): ParsedMediaRecord {
  const mediaType = item.media_type && VIDEO_MEDIA_TYPES.has(item.media_type.toLowerCase()) ? "video" : "image";
  return {
    telegram_media_id: item.id,
    sort_order: index,
    type: mediaType,
    file_path: item.file_path ?? null,
    original_filename: item.original_filename ?? null,
    caption: item.caption ?? null,
    width: item.width ?? null,
    height: item.height ?? null,
  };
}

function buildTopicKey(type: TopicAggregate["type"], slug: string) {
  return `${type}:${slug}`;
}

async function processMessages(
  messages: MessageGroup[],
  options: { outDir: string; allowTmdb: boolean },
) {
  await fsp.mkdir(options.outDir, { recursive: true });
  const rawPath = path.join(options.outDir, "raw_posts.ndjson");
  const parsedPath = path.join(options.outDir, "parsed_posts.ndjson");
  const rawStream = fs.createWriteStream(rawPath, { encoding: "utf-8" });
  const parsedStream = fs.createWriteStream(parsedPath, { encoding: "utf-8" });

  const films = new Map<string, FilmRecord>();
  const topics = new Map<string, TopicAggregate>();
  const stats = {
    rawPosts: 0,
    parsedPosts: 0,
    filmMentions: 0,
  };

  try {
    for (const message of messages) {
      const text = message.text ?? "";
      const rawTags = extractTags(text);
      const normalizedTags = rawTags.map((tag) => tag.toLowerCase());
      const rawType = detectPostType(text, message.items.length, normalizedTags);
      const title = deriveTitle(text, `Пост ${message.id}`);
      const slugBase = slugify(title) || "post";
      const slug = `${slugBase}-${message.id}`;
      const publishedAt = (message.date ?? new Date()).toISOString();
      const excerpt = text ? text.slice(0, 280) : null;
      const rubricSlug = detectRubricSlug(text, normalizedTags);
      const filmInfo = extractFilmInfo(text);
      const entities = buildEntitiesPayload(text, rawTags, filmInfo?.title ?? null);

      const rawRecord: RawPostRecord = {
        message_id: message.id,
        message_date: message.date ? message.date.toISOString() : null,
        message_text: text,
        media: message.items.map(mapRawMedia),
        payload: { items: message.items },
      };
      await writeRecord(rawStream, rawRecord);
      stats.rawPosts += 1;

      const mediaRecords = message.items.map(mapParsedMedia);
      const heroMedia = mediaRecords.find((media) => media.type === "image")?.telegram_media_id ?? null;

      let filmDetails: EnrichedFilmInfo | null = null;
      if (filmInfo) {
        filmDetails = await enrichFilmMetadata(filmInfo, { allowTmdb: options.allowTmdb });
        const generatedSlug = slugify(
          `${filmDetails.localizedTitle ?? filmDetails.title}-${filmDetails.year ?? filmInfo.year ?? ""}`,
        );
        const filmSlug = filmDetails.aliasId ?? generatedSlug || `film-${message.id}`;
        if (!films.has(filmSlug)) {
          films.set(filmSlug, {
            slug: filmSlug,
            title: filmDetails.localizedTitle ?? filmDetails.title,
            normalized_title: filmDetails.normalizedTitle ?? filmDetails.title,
            original_title: filmDetails.normalizedTitle ?? filmDetails.title,
            year: filmDetails.year ?? filmInfo.year,
            countries: filmDetails.countries ?? undefined,
            alias_id: filmDetails.aliasId ?? undefined,
            source: filmDetails.source,
            tmdb_id: filmDetails.tmdbId ?? undefined,
            overview: filmDetails.overview ?? null,
          });
        }
        stats.filmMentions += 1;
      }

      const parsedRecord: ParsedPostRecord = {
        message_id: message.id,
        slug,
        title,
        subtitle: deriveSubtitle(text),
        post_type: rawType,
        published_at: publishedAt,
        excerpt,
        tags: normalizedTags,
        rubric_slug: rubricSlug,
        hero_media_id: heroMedia,
        media: mediaRecords,
        film: filmDetails
          ? {
              title: filmDetails.localizedTitle ?? filmDetails.title,
              normalized_title: filmDetails.normalizedTitle,
              year: filmDetails.year ?? filmInfo?.year,
              countries: filmDetails.countries ?? undefined,
              alias_id: filmDetails.aliasId ?? undefined,
              source: filmDetails.source,
              tmdb_id: filmDetails.tmdbId ?? undefined,
            }
          : null,
        entities,
      };
      await writeRecord(parsedStream, parsedRecord);
      stats.parsedPosts += 1;

      rawTags.forEach((originalTag, index) => {
        const canonical = normalizedTags[index] ?? originalTag.toLowerCase();
        const tagSlug = slugify(canonical);
        if (!tagSlug) continue;
        const key = buildTopicKey("hashtag", tagSlug);
        const entry = topics.get(key) ?? {
          slug: tagSlug,
          label: `#${originalTag.replace(/_/g, " ")}`,
          type: "hashtag" as const,
          postIds: new Set<number>(),
        };
        entry.postIds.add(message.id);
        topics.set(key, entry);
      });
      if (rubricSlug) {
        const key = buildTopicKey("rubric", rubricSlug);
        const entry = topics.get(key) ?? {
          slug: rubricSlug,
          label: rubricSlug,
          type: "rubric" as const,
          postIds: new Set<number>(),
        };
        entry.postIds.add(message.id);
        topics.set(key, entry);
      }
    }
  } finally {
    await closeStream(rawStream);
    await closeStream(parsedStream);
  }

  const filmPath = path.join(options.outDir, "films.ndjson");
  const topicPath = path.join(options.outDir, "topics.ndjson");
  const filmRecords = Array.from(films.values()).sort((a, b) => a.slug.localeCompare(b.slug));
  const topicRecords: TopicRecord[] = Array.from(topics.values())
    .map((topic) => ({
      slug: topic.slug,
      label: topic.label,
      type: topic.type,
      post_count: topic.postIds.size,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  await writeNdjsonFile(filmPath, filmRecords);
  await writeNdjsonFile(topicPath, topicRecords);

  console.log(
    `ETL завершён: raw=${stats.rawPosts}, parsed=${stats.parsedPosts}, films=${filmRecords.length}, topics=${topicRecords.length}`,
  );
}

async function writeNdjsonFile(filePath: string, records: unknown[]) {
  if (records.length === 0) {
    await fsp.writeFile(filePath, "");
    return;
  }
  const stream = fs.createWriteStream(filePath, { encoding: "utf-8" });
  try {
    for (const record of records) {
      await writeRecord(stream, record);
    }
  } finally {
    await closeStream(stream);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const jsonInput = args.jsonPath ?? process.env.IMPORT_JSON_PATH;
  if (!jsonInput) {
    throw new Error("Не указан путь к JSON (флаг --json или переменная IMPORT_JSON_PATH)");
  }

  const jsonPath = path.resolve(jsonInput);
  const outputDir = path.resolve(args.outDir ?? process.env.TELEGRAM_ETL_OUT ?? DEFAULT_OUTPUT_DIR);
  const since = validateSince(args.since ?? process.env.TELEGRAM_ETL_SINCE);
  const limit = args.limit ?? (process.env.TELEGRAM_ETL_LIMIT ? Number(process.env.TELEGRAM_ETL_LIMIT) : undefined);
  const allowTmdb = args.tmdb ?? true;

  if (!(await fileExists(jsonPath))) {
    throw new Error(`JSON файл не найден: ${jsonPath}`);
  }

  const raw = await fsp.readFile(jsonPath, "utf-8");
  const parsed = exportSchema.parse(JSON.parse(raw));
  let messages = buildMessages(parsed.media_files);

  if (since) {
    messages = messages.filter((message) => !message.date || message.date >= since);
  }
  if (limit && Number.isFinite(limit) && limit > 0) {
    messages = messages.slice(0, limit);
  }

  console.log(
    `Обнаружено ${messages.length} сообщений после фильтрации (since=${since?.toISOString() ?? "-"}, limit=${
      limit ?? "-"
    })`,
  );

  await processMessages(messages, { outDir: outputDir, allowTmdb });
}

async function fileExists(target: string) {
  try {
    await fsp.access(target, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

main()
  .catch((error) => {
    console.error("ETL завершился с ошибкой:", error);
    process.exitCode = 1;
  });
