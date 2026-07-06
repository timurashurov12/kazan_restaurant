import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.menu.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.menu.findUnique({ where: { id } });
  }

  async create(data: { name: string; sortOrder?: number }) {
    return this.prisma.menu.create({
      data: {
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, data: { name?: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.menu.update({ where: { id }, data });
  }
}
