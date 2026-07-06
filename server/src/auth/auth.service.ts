import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }

  async validateUser(payload: { sub: string }) {
    return this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });
  }
}
