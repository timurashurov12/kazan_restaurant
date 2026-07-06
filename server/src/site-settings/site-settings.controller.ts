import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SiteSettingsService } from './site-settings.service';

@ApiTags('Site Settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get site settings (public)' })
  get() {
    return this.siteSettingsService.get();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update site settings (admin)' })
  update(
    @Body()
    body: {
      siteName?: string;
      logoPath?: string | null;
      footerText?: string;
      contactText?: string;
    },
  ) {
    return this.siteSettingsService.update(body);
  }
}
