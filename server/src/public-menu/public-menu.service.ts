import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export type MenuTypePublicDto = {
  id: string;
  code: string;
  sortOrder: number;
  name: string;
  imagePath: string | null;
};

export type MenuItemPublicDto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  prices: Record<string, number> | null;
  badges: string[] | null;
  weightOrVolume: string | null;
  imagePath: string | null;
  region: { id: string; name: string } | null;
  classification: { id: string; name: string; code: string } | null;
};

export type MenuCategoryPublicDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  items: MenuItemPublicDto[];
};

export type CategoryPublicDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  imagePath: string | null;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) return undefined;
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

export function invalidateMenuCache(menuTypeId?: string) {
  if (menuTypeId) {
    for (const k of cache.keys()) {
      if (k.includes(`:${menuTypeId}`)) cache.delete(k);
    }
  } else {
    cache.clear();
  }
}

@Injectable()
export class PublicMenuService {
  constructor(private prisma: PrismaService) {}

  async getMenuTypes(locale: string): Promise<MenuTypePublicDto[]> {
    const key = `mt:${locale}`;
    const cached = getCached<MenuTypePublicDto[]>(key);
    if (cached) return cached;

    const types = await this.prisma.menuType.findMany({
      where: {
        isActive: true,
        menu: { isActive: true },
      },
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });

    const result = types.map((t) => {
      const tr =
        t.translations.find((r) => r.locale === locale) || t.translations[0];
      return {
        id: t.id,
        code: t.code,
        sortOrder: t.sortOrder,
        name: tr?.name ?? t.code,
        imagePath: t.imagePath ?? null,
      };
    });

    setCache(key, result);
    return result;
  }

  async getMenu(
    menuTypeId: string,
    locale: string,
  ): Promise<MenuCategoryPublicDto[]> {
    const key = `menu:${menuTypeId}:${locale}`;
    const cached = getCached<MenuCategoryPublicDto[]>(key);
    if (cached) return cached;

    const mt = await this.prisma.menuType.findFirst({
      where: { id: menuTypeId, menu: { isActive: true } },
    });
    if (!mt) return [];

    const categories = await this.prisma.category.findMany({
      where: { menuTypeId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: true,
        menuItems: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            translations: true,
            region: { include: { translations: true } },
            classification: { include: { translations: true } },
          },
        },
      },
    });

    const result = categories.map((cat) => {
      const catTr =
        cat.translations.find((r) => r.locale === locale) || cat.translations[0];
      return {
        id: cat.id,
        code: cat.code ?? '',
        name: catTr?.name ?? '',
        description: catTr?.description ?? null,
        imagePath: cat.imagePath ?? null,
        items: cat.menuItems.map((item) => {
          const itemTr =
            item.translations.find((r) => r.locale === locale) ||
            item.translations[0];
          const regionTr = item.region
            ? item.region.translations.find((r) => r.locale === locale) || item.region.translations[0]
            : null;
          const classificationTr = item.classification
            ? item.classification.translations.find((r) => r.locale === locale) || item.classification.translations[0]
            : null;
          return {
            id: item.id,
            name: itemTr?.name ?? '',
            description: itemTr?.description ?? null,
            price: Number(item.price),
            prices: item.prices as Record<string, number> | null,
            badges: item.badges as string[] | null,
            weightOrVolume: item.weightOrVolume,
            imagePath: item.imagePath ?? null,
            region: item.region ? { id: item.region.id, name: regionTr?.name ?? '' } : null,
            classification: item.classification
              ? { id: item.classification.id, name: classificationTr?.name ?? '', code: item.classification.code }
              : null,
          };
        }),
      };
    });

    setCache(key, result);
    return result;
  }

  async getMenuByCode(
    code: string,
    locale: string,
  ): Promise<MenuCategoryPublicDto[] | null> {
    const type = await this.prisma.menuType.findFirst({
      where: {
        code,
        isActive: true,
        menu: { isActive: true },
      },
    });
    if (!type) return null;
    return this.getMenu(type.id, locale);
  }

  async getCategories(
    menuTypeId: string,
    locale: string,
  ): Promise<CategoryPublicDto[]> {
    const key = `cats:${menuTypeId}:${locale}`;
    const cached = getCached<CategoryPublicDto[]>(key);
    if (cached) return cached;

    const mt = await this.prisma.menuType.findFirst({
      where: { id: menuTypeId, menu: { isActive: true } },
    });
    if (!mt) return [];

    const categories = await this.prisma.category.findMany({
      where: { menuTypeId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });

    const result = categories.map((cat) => {
      const catTr =
        cat.translations.find((r) => r.locale === locale) || cat.translations[0];
      return {
        id: cat.id,
        code: cat.code ?? '',
        name: catTr?.name ?? '',
        description: catTr?.description ?? null,
        imagePath: cat.imagePath ?? null,
      };
    });

    setCache(key, result);
    return result;
  }

  async getCategoryItems(
    categoryId: string,
    locale: string,
  ): Promise<MenuItemPublicDto[]> {
    const key = `cat-items:${categoryId}:${locale}`;
    const cached = getCached<MenuItemPublicDto[]>(key);
    if (cached) return cached;

    const cat = await this.prisma.category.findFirst({
      where: { id: categoryId, isActive: true, menuType: { menu: { isActive: true } } },
    });
    if (!cat) return [];

    const items = await this.prisma.menuItem.findMany({
      where: { categoryId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: true,
        region: { include: { translations: true } },
        classification: { include: { translations: true } },
      },
    });

    const result = items.map((item) => {
      const itemTr =
        item.translations.find((r) => r.locale === locale) || item.translations[0];
      const regionTr = item.region
        ? item.region.translations.find((r) => r.locale === locale) || item.region.translations[0]
        : null;
      const classificationTr = item.classification
        ? item.classification.translations.find((r) => r.locale === locale) || item.classification.translations[0]
        : null;
      return {
        id: item.id,
        name: itemTr?.name ?? '',
        description: itemTr?.description ?? null,
        price: Number(item.price),
        prices: item.prices as Record<string, number> | null,
        badges: item.badges as string[] | null,
        weightOrVolume: item.weightOrVolume,
        imagePath: item.imagePath ?? null,
        region: item.region ? { id: item.region.id, name: regionTr?.name ?? '' } : null,
        classification: item.classification
          ? { id: item.classification.id, name: classificationTr?.name ?? '', code: item.classification.code }
          : null,
      };
    });

    setCache(key, result);
    return result;
  }

  async getCategoriesByCode(
    menuTypeCode: string,
    locale: string,
  ): Promise<CategoryPublicDto[] | null> {
    const type = await this.prisma.menuType.findFirst({
      where: { code: menuTypeCode, isActive: true, menu: { isActive: true } },
    });
    if (!type) return null;
    return this.getCategories(type.id, locale);
  }

  async getCategoryItemsByCode(
    menuTypeCode: string,
    categoryCode: string,
    locale: string,
  ): Promise<MenuItemPublicDto[] | null> {
    const type = await this.prisma.menuType.findFirst({
      where: { code: menuTypeCode, isActive: true, menu: { isActive: true } },
    });
    if (!type) return null;

    const cat = await this.prisma.category.findFirst({
      where: { code: categoryCode, menuTypeId: type.id, isActive: true },
    });
    if (!cat) return null;

    return this.getCategoryItems(cat.id, locale);
  }
}
