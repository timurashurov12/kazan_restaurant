import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    categoryId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    take?: number;
  }) {
    const { categoryId, search, sortBy = 'sortOrder', sortOrder = 'asc', skip = 0, take = 50 } = params;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.translations = {
        some: {
          name: { contains: search, mode: 'insensitive' },
        },
      };
    }

    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else {
      orderBy.sortOrder = sortOrder;
    }

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { translations: true, category: { include: { translations: true } } },
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { translations: true, category: { include: { translations: true } } },
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async create(data: {
    categoryId: string;
    price: number;
    weightOrVolume?: string;
    sortOrder?: number;
    imagePath?: string;
    translations: {
      locale: string;
      name: string;
      description?: string;
    }[];
  }) {
    return this.prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        price: data.price,
        weightOrVolume: data.weightOrVolume,
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
      categoryId?: string;
      price?: number;
      weightOrVolume?: string;
      sortOrder?: number;
      isActive?: boolean;
      imagePath?: string | null;
      translations?: {
        locale: string;
        name: string;
        description?: string;
      }[];
    },
  ) {
    const existing = await this.findOne(id);

    if (data.translations) {
      for (const tr of data.translations) {
        await this.prisma.menuItemTranslation.upsert({
          where: { menuItemId_locale: { menuItemId: id, locale: tr.locale } },
          create: {
            menuItemId: id,
            locale: tr.locale,
            name: tr.name,
            description: tr.description ?? null,
          },
          update: { name: tr.name, description: tr.description ?? null },
        });
      }
    }

    const updated = await this.prisma.menuItem.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        price: data.price,
        weightOrVolume: data.weightOrVolume,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        imagePath: data.imagePath,
      },
      include: { translations: true },
    });

    invalidateMenuCache(existing.category.menuTypeId);
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.prisma.menuItem.delete({ where: { id } });
    invalidateMenuCache(existing.category.menuTypeId);
    return { deleted: true };
  }

  async uploadImage(id: string, imagePath: string) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.menuItem.update({
      where: { id },
      data: { imagePath },
      include: { translations: true, category: true },
    });
    invalidateMenuCache(existing.category.menuTypeId);
    return updated;
  }
}
