-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "type" TEXT NOT NULL DEFAULT 'ARTICLE',
    "body" TEXT NOT NULL,
    "excerpt" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "sourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Film" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "description" TEXT,
    "synopsis" TEXT,
    "year" INTEGER,
    "runtime" INTEGER,
    "countries" TEXT,
    "genres" TEXT,
    "rating" REAL,
    "posterImageId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Film_posterImageId_fkey" FOREIGN KEY ("posterImageId") REFERENCES "Media" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "fileName" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "dominantHex" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "postId" INTEGER,
    "filmId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'THEME',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PostTag" (
    "postId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("postId", "tagId"),
    CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FilmTag" (
    "filmId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("filmId", "tagId"),
    CONSTRAINT "FilmTag_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FilmTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PostFilm" (
    "postId" INTEGER NOT NULL,
    "filmId" INTEGER NOT NULL,
    "relationType" TEXT,
    "highlight" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("postId", "filmId"),
    CONSTRAINT "PostFilm_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PostFilm_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Film_slug_key" ON "Film"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Film_posterImageId_key" ON "Film"("posterImageId");

-- CreateIndex
CREATE INDEX "Film_year_idx" ON "Film"("year");

-- CreateIndex
CREATE INDEX "Film_rating_idx" ON "Film"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Media_fileName_key" ON "Media"("fileName");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");
