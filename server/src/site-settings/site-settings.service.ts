import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SiteSettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.siteSettings.create({ data: {} });
    }
    return settings;
  }

  async update(data: {
    siteName?: string;
    logoPath?: string | null;
    footerText?: string;
    contactText?: string;
  }) {
    let settings = await this.prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.siteSettings.create({ data });
    } else {
      settings = await this.prisma.siteSettings.update({
        where: { id: settings.id },
        data,
      });
    }
    return settings;
  }
}
