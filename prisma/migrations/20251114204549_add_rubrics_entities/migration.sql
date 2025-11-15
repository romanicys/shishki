-- AlterTable
ALTER TABLE "Film" ADD COLUMN "externalId" TEXT;
ALTER TABLE "Film" ADD COLUMN "externalSource" TEXT;
ALTER TABLE "Film" ADD COLUMN "normalizedTitle" TEXT;
ALTER TABLE "Film" ADD COLUMN "similarFilmIds" JSONB;

-- CreateTable
CREATE TABLE "Rubric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "type" TEXT NOT NULL DEFAULT 'ARTICLE',
    "body" TEXT NOT NULL,
    "excerpt" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "sourceId" TEXT,
    "heroImage" TEXT,
    "entities" JSONB,
    "rubricId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("body", "createdAt", "excerpt", "id", "publishedAt", "slug", "sourceId", "subtitle", "title", "type", "updatedAt") SELECT "body", "createdAt", "excerpt", "id", "publishedAt", "slug", "sourceId", "subtitle", "title", "type", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");
CREATE INDEX "Post_rubricId_idx" ON "Post"("rubricId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Rubric_slug_key" ON "Rubric"("slug");
