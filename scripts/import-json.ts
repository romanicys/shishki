import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { PrismaClient, Prisma, PostType, TagType, MediaType } from "@prisma/client";
import {
  buildEntitiesPayload,
  buildFilmSearchKey,
  buildMessages,
  deriveSubtitle,
  deriveTitle,
  detectPostType,
  detectRubricSlug,
  exportSchema,
  extractFilmInfo,
  extractTags,
  type FilmInfo,
  type MediaItem,
  type MessageGroup,
  slugify,
  VIDEO_MEDIA_TYPES,
} from "./telegram/transform";
import { enrichFilmMetadata } from "./telegram/film";

const prisma = new PrismaClient();
const copyFile = promisify(fs.copyFile);

type CliArgs = {
  jsonPath?: string;
  mediaDir?: string;
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json" && argv[i + 1]) {
      args.jsonPath = argv[i + 1];
      i += 1;
    } else if (token === "--media" && argv[i + 1]) {
      args.mediaDir = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

async function pathExists(targetPath: string) {
  try {
    await fs.promises.access(targetPath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const tagCache = new Map<string, number>();
const filmCache = new Map<string, number>();
const filmAliasCache = new Map<string, { id: number; slug: string }>();
const rubricMap = new Map<string, number>();
async function preloadFilmCache() {
  const films = await prisma.film.findMany({
    select: {
      id: true,
      slug: true,
      searchTitle: true,
      title: true,
      localizedTitle: true,
      year: true,
    },
  });
  for (const film of films) {
    const key =
      film.searchTitle ??
      buildFilmSearchKey(film.localizedTitle ?? film.title, film.year ?? undefined);
    if (key && !filmAliasCache.has(key)) {
      filmAliasCache.set(key, { id: film.id, slug: film.slug });
    }
  }
}

async function ensureTag(tx: Prisma.TransactionClient, name: string) {
  const slug = slugify(name);
  if (!slug) return null;
  if (tagCache.has(slug)) {
    return { id: tagCache.get(slug)!, slug };
  }
  const result = await tx.tag.upsert({
    where: { slug },
    create: {
      slug,
      name: name.replace(/_/g, " ").trim(),
      type: TagType.THEME,
    },
    update: {
      name: name.replace(/_/g, " ").trim(),
    },
  });
  tagCache.set(slug, result.id);
  return { id: result.id, slug };
}

async function ensureFilm(tx: Prisma.TransactionClient, info: FilmInfo, description?: string) {
  const searchKey = buildFilmSearchKey(info.title, info.year);
  if (searchKey && filmAliasCache.has(searchKey)) {
    return filmAliasCache.get(searchKey)!;
  }
  const enriched = await enrichFilmMetadata(info);
  const localizedTitle = enriched.localizedTitle ?? info.title;
  const canonicalTitle = enriched.normalizedTitle ?? info.title;
  const slugBase =
    enriched.aliasId ??
    (slugify(`${canonicalTitle}-${enriched.year ?? info.year ?? ""}`) || `film-${Date.now()}`);
  if (filmCache.has(slugBase)) {
    const id = filmCache.get(slugBase)!;
    return { id, slug: slugBase };
  }
  const result = await tx.film.upsert({
    where: { slug: slugBase },
    create: {
      slug: slugBase,
      title: localizedTitle ?? canonicalTitle,
      localizedTitle,
      normalizedTitle: canonicalTitle,
      year: enriched.year ?? info.year,
      description: description?.slice(0, 1000) ?? null,
      originalTitle: canonicalTitle,
      countries: enriched.countries,
      searchTitle: searchKey,
    },
    update: {
      title: localizedTitle ?? canonicalTitle,
      localizedTitle,
      year: enriched.year ?? info.year ?? undefined,
      description: description?.slice(0, 1000) ?? undefined,
      normalizedTitle: canonicalTitle ?? undefined,
      originalTitle: canonicalTitle,
      countries: enriched.countries ?? undefined,
      searchTitle: searchKey ?? undefined,
    },
  });
  filmCache.set(slugBase, result.id);
  if (searchKey) {
    filmAliasCache.set(searchKey, { id: result.id, slug: result.slug });
  }
  return { id: result.id, slug: result.slug };
}

type ImportContext = {
  mediaDir: string;
  outputDir: string;
  rubricLookup: Map<string, number>;
};

async function importMessage(group: MessageGroup, ctx: ImportContext, stats: ImportStats) {
  const text = group.text ?? "";
  const tags = extractTags(text);
  const rawType = detectPostType(text, group.items.length, tags);
  const postType = PostType[rawType as keyof typeof PostType];
  const title = deriveTitle(text, `Пост ${group.id}`);
  const slugBase = slugify(title) || "post";
  const slug = `${slugBase}-${group.id}`;
  const publishedAt = group.date ?? new Date();
  const excerpt = text ? text.slice(0, 280) : null;
  const filmInfo = extractFilmInfo(text);
  const rubricSlug = detectRubricSlug(text, tags);
  const entities = buildEntitiesPayload(text, tags, filmInfo?.title);
  await prisma.$transaction(async (tx) => {
    const post = await tx.post.upsert({
      where: { slug },
      create: {
        slug,
        title,
        subtitle: deriveSubtitle(text),
        type: postType,
        body: text,
        excerpt,
        publishedAt,
        sourceId: String(group.id),
        heroImage: null,
        entities,
        rubricId: rubricSlug ? ctx.rubricLookup.get(rubricSlug) : undefined,
      },
      update: {
        title,
        subtitle: deriveSubtitle(text),
        type: postType,
        body: text,
        excerpt,
        publishedAt,
        entities,
        rubricId: rubricSlug ? ctx.rubricLookup.get(rubricSlug) : undefined,
      },
    });

    const tagIds: number[] = [];
    for (const tagName of tags) {
      const tag = await ensureTag(tx, tagName);
      if (!tag) continue;
      tagIds.push(tag.id);
      await tx.postTag.upsert({
        where: {
          postId_tagId: {
            postId: post.id,
            tagId: tag.id,
          },
        },
        create: {
          postId: post.id,
          tagId: tag.id,
        },
        update: {},
      });
    }
    stats.tags += tagIds.length;

    let filmId: number | null = null;
    if (filmInfo) {
      const film = await ensureFilm(tx, filmInfo, excerpt ?? text);
      filmId = film.id;
      await tx.postFilm.upsert({
        where: {
          postId_filmId: {
            postId: post.id,
            filmId: film.id,
          },
        },
        create: {
          postId: post.id,
          filmId: film.id,
          relationType: postType,
          highlight: postType === PostType.REVIEW,
        },
        update: {
          relationType: postType,
          highlight: postType === PostType.REVIEW,
        },
      });
      stats.films += 1;
    }

    let heroImagePath = post.heroImage ?? null;
    for (let index = 0; index < group.items.length; index += 1) {
      const item = group.items[index];
      if (!item.file_path) continue;
      const mediaType = item.media_type && VIDEO_MEDIA_TYPES.has(item.media_type.toLowerCase())
        ? MediaType.VIDEO
        : MediaType.IMAGE;
      const copied = await copyMediaFile(item, ctx.mediaDir, ctx.outputDir, group.id, item.id);
      if (!copied) continue;
      await tx.media.upsert({
        where: { fileName: copied.relativePath },
        create: {
          fileName: copied.relativePath,
          alt: item.caption ?? title,
          type: mediaType,
          width: item.width ?? undefined,
          height: item.height ?? undefined,
          sortOrder: index,
          postId: post.id,
          filmId,
        },
        update: {
          alt: item.caption ?? title,
          type: mediaType,
          postId: post.id,
          filmId,
          sortOrder: index,
        },
      });
      if (!heroImagePath && mediaType === MediaType.IMAGE) {
        heroImagePath = copied.relativePath;
      }
      stats.media += 1;
    }
    if (heroImagePath && heroImagePath !== post.heroImage) {
      await tx.post.update({
        where: { id: post.id },
        data: { heroImage: heroImagePath },
      });
    }
    stats.posts += 1;
  });
}

type CopyResult = {
  relativePath: string;
};

async function copyMediaFile(
  item: MediaItem,
  sourceRoot: string,
  outputDir: string,
  messageId: number,
  mediaId: number,
): Promise<CopyResult | null> {
  const sourcePath = path.resolve(sourceRoot, item.file_path!);
  const exists = await pathExists(sourcePath);
  if (!exists) {
    console.warn(`⚠️  Media file not found: ${sourcePath}`);
    return null;
  }
  const ext = path.extname(item.original_filename ?? item.file_path ?? "") || ".jpg";
  const destFile = `msg-${messageId}-${mediaId}${ext}`.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const destAbsolute = path.join(outputDir, destFile);
  if (!(await pathExists(destAbsolute))) {
    await fs.promises.mkdir(path.dirname(destAbsolute), { recursive: true });
    await copyFile(sourcePath, destAbsolute);
  }
  return {
    relativePath: `images/${destFile}`,
  };
}

type ImportStats = {
  posts: number;
  films: number;
  tags: number;
  media: number;
  skipped: number;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const jsonInput = args.jsonPath ?? process.env.IMPORT_JSON_PATH;
  const mediaInput = args.mediaDir ?? process.env.IMPORT_MEDIA_DIR;

  if (!jsonInput) {
    throw new Error("JSON path is required (--json or IMPORT_JSON_PATH).");
  }
  if (!mediaInput) {
    throw new Error("Media directory is required (--media or IMPORT_MEDIA_DIR).");
  }

  const jsonPath = path.resolve(jsonInput);
  const mediaDir = path.resolve(mediaInput);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`JSON file not found: ${jsonPath}`);
  }
  if (!fs.existsSync(mediaDir)) {
    throw new Error(`Media directory not found: ${mediaDir}`);
  }

  const outputDir = path.join(process.cwd(), "public", "images");
  await fs.promises.mkdir(outputDir, { recursive: true });
  await preloadFilmCache();
  const rubrics = await prisma.rubric.findMany();
  for (const rubric of rubrics) {
    rubricMap.set(rubric.slug, rubric.id);
  }

  console.log(`📥 Reading export JSON from ${jsonPath}`);
  const raw = await fs.promises.readFile(jsonPath, "utf-8");
  const parsed = exportSchema.parse(JSON.parse(raw));
  const messages = buildMessages(parsed.media_files);
  console.log(`🔎 Found ${messages.length} unique messages with media payloads`);

  const stats: ImportStats = {
    posts: 0,
    films: 0,
    tags: 0,
    media: 0,
    skipped: 0,
  };

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];
    try {
      await importMessage(message, { mediaDir, outputDir, rubricLookup: rubricMap }, stats);
    } catch (error) {
      stats.skipped += 1;
      console.warn(`⚠️  Failed to import message ${message.id}:`, error);
    }
    if ((index + 1) % 100 === 0) {
      console.log(
        `… processed ${index + 1}/${messages.length} messages (posts: ${stats.posts}, media: ${stats.media})`,
      );
    }
  }

  console.log("✅ Import completed");
  console.log(
    `Posts: ${stats.posts}, Films links created: ${stats.films}, Tags linked: ${stats.tags}, Media copied: ${stats.media}, Skipped: ${stats.skipped}`,
  );
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
