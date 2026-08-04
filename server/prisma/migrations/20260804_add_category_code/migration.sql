-- AlterTable: Add code column to Category (nullable first)
ALTER TABLE "Category" ADD COLUMN "code" VARCHAR(30);

-- Backfill codes from translation names (slugified)
-- Run seed-category-codes.ts after this migration to set proper codes

-- AddUniqueConstraint
CREATE UNIQUE INDEX "Category_menuTypeId_code_key" ON "Category"("menuTypeId", "code");
