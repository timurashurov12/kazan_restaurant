import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiService } from '../common/ai/ai.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LanguagesService {
  private readonly logger = new Logger(LanguagesService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  private async translateText(text: string, sourceLocale: string, targetLocale: string): Promise<string> {
    if (!text?.trim()) return '';
    try {
      return await this.ai.translate(text, sourceLocale, targetLocale);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Translation error: ${msg}`);
      return text;
    }
  }

  private async translateObject(obj: Record<string, any>, sourceLocale: string, targetLocale: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = await this.translateObject(value, sourceLocale, targetLocale);
      } else if (typeof value === 'string') {
        if (value.trim()) {
          result[key] = await this.translateText(value, sourceLocale, targetLocale);
        } else {
          result[key] = '';
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  async findAll() {
    return this.prisma.language.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: { code: string; name: string; sortOrder?: number }) {
    const lang = await this.prisma.language.create({
      data: {
        code: data.code,
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    await this.generateI18nFile(data.code);

    return lang;
  }

  async remove(id: string) {
    const lang = await this.prisma.language.findUnique({ where: { id } });
    if (lang) {
      await this.removeI18nFile(lang.code);
    }
    return this.prisma.language.delete({ where: { id } });
  }

  async translateI18nFile(code: string, sourceLocale: string = 'ru') {
    const i18nDir = path.join(process.cwd(), '..', 'client', 'src', 'i18n');
    const targetPath = path.join(i18nDir, `${code}.json`);
    const sourcePath = path.join(i18nDir, `${sourceLocale}.json`);

    if (!fs.existsSync(sourcePath)) {
      throw new BadRequestException(`Source file ${sourceLocale}.json not found`);
    }

    if (!fs.existsSync(targetPath)) {
      await this.generateI18nFile(code);
    }

    const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

    const translated = await this.translateObject(sourceContent, sourceLocale, code);

    fs.writeFileSync(targetPath, JSON.stringify(translated, null, 2) + '\n');
    this.logger.log(`Translated i18n file: ${code}.json`);

    return { success: true, code };
  }

  private async generateI18nFile(code: string) {
    try {
      const ruPath = path.join(
        process.cwd(),
        '..',
        'client',
        'src',
        'i18n',
        'ru.json',
      );
      const ruContent = fs.readFileSync(ruPath, 'utf-8');
      const ruData = JSON.parse(ruContent);

      const newData = this.createEmptyTranslations(ruData);

      const targetPath = path.join(
        process.cwd(),
        '..',
        'client',
        'src',
        'i18n',
        `${code}.json`,
      );
      fs.writeFileSync(targetPath, JSON.stringify(newData, null, 2) + '\n');
      this.logger.log(`Created i18n file: ${code}.json`);
    } catch (err) {
      this.logger.error(`Failed to create i18n file for ${code}`, err);
    }
  }

  private async removeI18nFile(code: string) {
    if (code === 'ru' || code === 'en') return;

    try {
      const filePath = path.join(
        process.cwd(),
        '..',
        'client',
        'src',
        'i18n',
        `${code}.json`,
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Removed i18n file: ${code}.json`);
      }
    } catch (err) {
      this.logger.error(`Failed to remove i18n file for ${code}`, err);
    }
  }

  private createEmptyTranslations(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.createEmptyTranslations(value);
      } else if (typeof value === 'string') {
        result[key] = '';
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
