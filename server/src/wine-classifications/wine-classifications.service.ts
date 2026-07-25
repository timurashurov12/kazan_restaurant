import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class WineClassificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.wineClassification.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string) {
    const classification = await this.prisma.wineClassification.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!classification) throw new NotFoundException('Wine classification not found');
    return classification;
  }

  async create(data: {
    code: string;
    sortOrder?: number;
    translations: { locale: string; name: string }[];
  }) {
    return this.prisma.wineClassification.create({
      data: {
        code: data.code,
        sortOrder: data.sortOrder ?? 0,
        translations: { create: data.translations },
      },
      include: { translations: true },
    });
  }

  async update(
    id: string,
    data: {
      code?: string;
      sortOrder?: number;
      isActive?: boolean;
      translations?: { locale: string; name: string }[];
    },
  ) {
    await this.findOne(id);

    if (data.translations) {
      for (const tr of data.translations) {
        await this.prisma.wineClassificationTranslation.upsert({
          where: { classificationId_locale: { classificationId: id, locale: tr.locale } },
          create: { classificationId: id, locale: tr.locale, name: tr.name },
          update: { name: tr.name },
        });
      }
    }

    return this.prisma.wineClassification.update({
      where: { id },
      data: {
        code: data.code,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
      include: { translations: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.wineClassification.delete({ where: { id } });
    return { deleted: true };
  }
}
