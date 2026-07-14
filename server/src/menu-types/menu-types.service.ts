import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';

@Injectable()
export class MenuTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    menuId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    take?: number;
  }) {
    const { menuId, search, sortBy = 'sortOrder', sortOrder = 'asc', skip = 0, take = 50 } = params;

    const where: any = {};
    if (menuId) where.menuId = menuId;
    if (search) {
      where.translations = {
        some: {
          name: { contains: search, mode: 'insensitive' },
        },
      };
    }

    const orderBy: any = {};
    orderBy.sortOrder = sortOrder;

    const [items, total] = await Promise.all([
      this.prisma.menuType.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { translations: true },
      }),
      this.prisma.menuType.count({ where }),
    ]);

    return { items, total, skip, take };
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
    imagePath?: string;
    translations: { locale: string; name: string }[];
  }) {
    return this.prisma.menuType.create({
      data: {
        menuId: data.menuId,
        code: data.code,
        sortOrder: data.sortOrder ?? 0,
        imagePath: data.imagePath ?? null,
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
    const existing = await this.findOne(id);
    const updated = await this.prisma.menuType.update({
      where: { id },
      data: { imagePath },
      include: { translations: true },
    });
    invalidateMenuCache(id);
    return updated;
  }
}
