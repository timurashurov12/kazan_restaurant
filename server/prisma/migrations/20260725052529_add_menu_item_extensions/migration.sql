-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "badges" JSONB,
ADD COLUMN     "classificationId" TEXT,
ADD COLUMN     "prices" JSONB,
ADD COLUMN     "regionId" TEXT;

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionTranslation" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RegionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WineClassification" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WineClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WineClassificationTranslation" (
    "id" TEXT NOT NULL,
    "classificationId" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "WineClassificationTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegionTranslation_regionId_locale_key" ON "RegionTranslation"("regionId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "WineClassification_code_key" ON "WineClassification"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WineClassificationTranslation_classificationId_locale_key" ON "WineClassificationTranslation"("classificationId", "locale");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "WineClassification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionTranslation" ADD CONSTRAINT "RegionTranslation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WineClassificationTranslation" ADD CONSTRAINT "WineClassificationTranslation_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "WineClassification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
