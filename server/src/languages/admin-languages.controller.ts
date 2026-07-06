import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LanguagesService } from './languages.service';

@ApiTags('Admin - Languages')
@Controller('admin/languages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminLanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({ summary: 'List languages (admin)' })
  findAll() {
    return this.languagesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create language' })
  create(@Body() body: { code: string; name: string; sortOrder?: number }) {
    return this.languagesService.create(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete language' })
  remove(@Param('id') id: string) {
    return this.languagesService.remove(id);
  }

  @Post('translate/:code')
  @ApiOperation({ summary: 'Translate i18n file for language' })
  translateFile(
    @Param('code') code: string,
    @Body() body: { sourceLocale?: string },
  ) {
    return this.languagesService.translateI18nFile(code, body.sourceLocale || 'ru');
  }
}
