import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiService } from '../common/ai/ai.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';

@Injectable()
export class TranslateService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async translateMenuType(
    menuTypeId: string,
    targetLocales?: string[],
  ) {
    const menuType = await this.prisma.menuType.findUnique({
      where: { id: menuTypeId },
      include: { translations: true },
    });
    if (!menuType) return { translated: 0, locales: [] };

    const languages = await this.prisma.language.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    const existingLocales = new Set(
      menuType.translations.map((t) => t.locale),
    );
    const firstTr = menuType.translations[0];
    if (!firstTr?.name?.trim()) return { translated: 0, locales: [] };
    const sourceLocale = firstTr.locale;
    const sourceName = firstTr.name;

    const targetLangs = targetLocales?.length
      ? languages.filter(
          (l) => targetLocales.includes(l.code) && !existingLocales.has(l.code),
        )
      : languages.filter((l) => !existingLocales.has(l.code));

    const translatedLocales: string[] = [];
    for (const lang of targetLangs) {
      const name = await this.ai.translate(sourceName, sourceLocale, lang.code);
      await this.prisma.menuTypeTranslation.create({
        data: { menuTypeId, locale: lang.code, name },
      });
      translatedLocales.push(lang.code);
    }
    invalidateMenuCache(menuTypeId);
    return { translated: translatedLocales.length, locales: translatedLocales };
  }

  async translateCategory(
    categoryId: string,
    targetLocales?: string[],
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { translations: true },
    });
    if (!category) return { translated: 0, locales: [] };

    const languages = await this.prisma.language.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    const existingLocales = new Set(
      category.translations.map((t) => t.locale),
    );
    const sourceTr = category.translations[0];
    if (!sourceTr?.name?.trim()) return { translated: 0, locales: [] };
    const sourceLocale = sourceTr.locale;
    const sourceName = sourceTr.name;
    const sourceDesc = sourceTr.description ?? '';

    const targetLangs = targetLocales?.length
      ? languages.filter(
          (l) => targetLocales.includes(l.code) && !existingLocales.has(l.code),
        )
      : languages.filter((l) => !existingLocales.has(l.code));

    const translatedLocales: string[] = [];
    for (const lang of targetLangs) {
      const name = await this.ai.translate(sourceName, sourceLocale, lang.code);
      const description = sourceDesc
        ? await this.ai.translate(sourceDesc, sourceLocale, lang.code)
        : null;
      await this.prisma.categoryTranslation.create({
        data: { categoryId, locale: lang.code, name, description },
      });
      translatedLocales.push(lang.code);
    }
    invalidateMenuCache(category.menuTypeId);
    return { translated: translatedLocales.length, locales: translatedLocales };
  }

  async translateMenuItem(
    menuItemId: string,
    targetLocales?: string[],
  ) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        translations: true,
        category: { select: { menuTypeId: true } },
      },
    });
    if (!item) return { translated: 0, locales: [] };

    const languages = await this.prisma.language.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    const existingLocales = new Set(
      item.translations.map((t) => t.locale),
    );
    const sourceTr = item.translations[0];
    if (!sourceTr?.name?.trim()) return { translated: 0, locales: [] };
    const sourceLocale = sourceTr.locale;
    const sourceName = sourceTr.name;
    const sourceDesc = sourceTr.description ?? '';

    const targetLangs = targetLocales?.length
      ? languages.filter(
          (l) => targetLocales.includes(l.code) && !existingLocales.has(l.code),
        )
      : languages.filter((l) => !existingLocales.has(l.code));

    const translatedLocales: string[] = [];
    for (const lang of targetLangs) {
      const name = await this.ai.translate(sourceName, sourceLocale, lang.code);
      const description = sourceDesc
        ? await this.ai.translate(sourceDesc, sourceLocale, lang.code)
        : null;
      await this.prisma.menuItemTranslation.create({
        data: { menuItemId, locale: lang.code, name, description },
      });
      translatedLocales.push(lang.code);
    }
    invalidateMenuCache(item.category.menuTypeId);
    return { translated: translatedLocales.length, locales: translatedLocales };
  }
}
