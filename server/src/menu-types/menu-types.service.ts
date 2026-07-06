import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';

@Injectable()
export class MenuTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(menuId?: string) {
    return this.prisma.menuType.findMany({
      where: menuId ? { menuId } : {},
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string) {
    const mt = await this.prisma.menuType.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!mt) throw new NotFoundException('Menu type not found');
    return mt;
  }

  async create(data: {
    menuId: string;
    code: string;
    sortOrder?: number;
    translations: { locale: string; name: string }[];
  }) {
    return this.prisma.menuType.create({
      data: {
        menuId: data.menuId,
        code: data.code,
        sortOrder: data.sortOrder ?? 0,
        translations: {
          create: data.translations,
        },
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
      imagePath?: string | null;
      translations?: { locale: string; name: string }[];
    },
  ) {
    const existing = await this.findOne(id);

    if (data.translations) {
      for (const tr of data.translations) {
        await this.prisma.menuTypeTranslation.upsert({
          where: { menuTypeId_locale: { menuTypeId: id, locale: tr.locale } },
          create: { menuTypeId: id, locale: tr.locale, name: tr.name },
          update: { name: tr.name },
        });
      }
    }

    const updated = await this.prisma.menuType.update({
      where: { id },
      data: {
        code: data.code,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        imagePath: data.imagePath,
      },
      include: { translations: true },
    });

    invalidateMenuCache(id);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.menuType.delete({ where: { id } });
    invalidateMenuCache(id);
    return { deleted: true };
  }

  async uploadImage(id: string, imagePath: string) {
    await this.findOne(id);
    return this.prisma.menuType.update({
      where: { id },
      data: { imagePath },
    });
  }
}
