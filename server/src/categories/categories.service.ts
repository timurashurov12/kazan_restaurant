import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { invalidateMenuCache } from '../public-menu/public-menu.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(menuTypeId?: string) {
    return this.prisma.category.findMany({
      where: menuTypeId ? { menuTypeId } : {},
      orderBy: { sortOrder: 'asc' },
      include: { translations: true },
    });
  }

  async findOne(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(data: {
    menuTypeId: string;
    sortOrder?: number;
    translations: { locale: string; name: string; description?: string }[];
  }) {
    return this.prisma.category.create({
      data: {
        menuTypeId: data.menuTypeId,
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
      sortOrder?: number;
      isActive?: boolean;
      imagePath?: string | null;
      translations?: { locale: string; name: string; description?: string }[];
    },
  ) {
    const existing = await this.findOne(id);

    if (data.translations) {
      for (const tr of data.translations) {
        await this.prisma.categoryTranslation.upsert({
          where: { categoryId_locale: { categoryId: id, locale: tr.locale } },
          create: {
            categoryId: id,
            locale: tr.locale,
            name: tr.name,
            description: tr.description ?? null,
          },
          update: { name: tr.name, description: tr.description ?? null },
        });
      }
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        imagePath: data.imagePath,
      },
      include: { translations: true },
    });

    invalidateMenuCache(existing.menuTypeId);
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
    invalidateMenuCache(existing.menuTypeId);
    return { deleted: true };
  }

  async uploadImage(id: string, imagePath: string) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.category.update({
      where: { id },
      data: { imagePath },
    });
    invalidateMenuCache(existing.menuTypeId);
    return updated;
  }
}
