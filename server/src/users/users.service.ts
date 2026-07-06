import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateAdmin(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, passwordHash },
    });
  }
}
