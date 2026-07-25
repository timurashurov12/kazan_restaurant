import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.region.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!region) throw new NotFoundException('Region not found');
    return region;
  }

  async create(data: {
    sortOrder?: number;
    translations: { locale: string; name: string }[];
  }) {
    return this.prisma.region.create({
      data: {
        sortOrder: data.sortOrder ?? 0,
        translations: { create: data.translations },
      },
      include: { translations: true },
    });
  }

  async update(
    id: string,
    data: {
      sortOrder?: number;
      isActive?: boolean;
      translations?: { locale: string; name: string }[];
    },
  ) {
    await this.findOne(id);

    if (data.translations) {
      for (const tr of data.translations) {
        await this.prisma.regionTranslation.upsert({
          where: { regionId_locale: { regionId: id, locale: tr.locale } },
          create: { regionId: id, locale: tr.locale, name: tr.name },
          update: { name: tr.name },
        });
      }
    }

    return this.prisma.region.update({
      where: { id },
      data: {
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
      include: { translations: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.region.delete({ where: { id } });
    return { deleted: true };
  }
}
