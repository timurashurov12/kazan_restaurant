import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

const LOCALE_NAMES: Record<string, string> = {
  ru: 'Russian',
  en: 'English',
};

@Injectable()
export class TranslateService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private getGenAI(): GoogleGenerativeAI {
    if (this.genAI) return this.genAI;
    const key = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!key) {
      throw new BadRequestException(
        'Translation unavailable: set GEMINI_API_KEY in .env',
      );
    }
    this.genAI = new GoogleGenerativeAI(key);
    return this.genAI;
  }

  private buildTranslatePrompt(
    sourceLang: string,
    targetLang: string,
    text: string,
  ): string {
    return `You are a restaurant menu translator. Translate the following text from ${sourceLang} to ${targetLang}. 
Keep the tone neutral and suitable for a menu. For dish names use established equivalents where they exist, otherwise transliterate.
Return ONLY the translation, no explanations.

Text to translate:
${text}`;
  }

  async translate(
    text: string,
    sourceLocale: string,
    targetLocale: string,
  ): Promise<string> {
    if (!text?.trim()) return '';

    const genAI = this.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const sourceLang = LOCALE_NAMES[sourceLocale] || sourceLocale;
    const targetLang = LOCALE_NAMES[targetLocale] || targetLocale;
    const prompt = this.buildTranslatePrompt(sourceLang, targetLang, text);

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return result.response.text()?.trim() ?? '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Translation error: ${msg}`);
    }
  }

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
      const name = await this.translate(sourceName, sourceLocale, lang.code);
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
      const name = await this.translate(sourceName, sourceLocale, lang.code);
      const description = sourceDesc
        ? await this.translate(sourceDesc, sourceLocale, lang.code)
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
      const name = await this.translate(sourceName, sourceLocale, lang.code);
      const description = sourceDesc
        ? await this.translate(sourceDesc, sourceLocale, lang.code)
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
