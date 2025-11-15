-- AlterTable
ALTER TABLE "Film" ADD COLUMN "localizedTitle" TEXT;
ALTER TABLE "Film" ADD COLUMN "searchTitle" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Film_searchTitle_key" ON "Film"("searchTitle");

-- CreateIndex
CREATE INDEX "Film_normalizedTitle_idx" ON "Film"("normalizedTitle");

