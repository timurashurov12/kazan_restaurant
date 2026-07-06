-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuType" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuTypeTranslation" (
    "id" TEXT NOT NULL,
    "menuTypeId" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MenuTypeTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "menuTypeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "weightOrVolume" VARCHAR(50),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemTranslation" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "MenuItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT,
    "logoPath" TEXT,
    "footerText" TEXT,
    "contactText" TEXT,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MenuType_menuId_code_key" ON "MenuType"("menuId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "MenuTypeTranslation_menuTypeId_locale_key" ON "MenuTypeTranslation"("menuTypeId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_locale_key" ON "CategoryTranslation"("categoryId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemTranslation_menuItemId_locale_key" ON "MenuItemTranslation"("menuItemId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "MenuType" ADD CONSTRAINT "MenuType_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuTypeTranslation" ADD CONSTRAINT "MenuTypeTranslation_menuTypeId_fkey" FOREIGN KEY ("menuTypeId") REFERENCES "MenuType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_menuTypeId_fkey" FOREIGN KEY ("menuTypeId") REFERENCES "MenuType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemTranslation" ADD CONSTRAINT "MenuItemTranslation_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
