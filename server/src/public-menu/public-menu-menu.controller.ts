import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PublicMenuService } from './public-menu.service';

@ApiTags('Menu (public)')
@Controller('menu')
export class PublicMenuController2 {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get menu by type ID or code (public)' })
  @ApiQuery({ name: 'menuTypeId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'locale', required: false, default: 'ru' })
  getMenu(
    @Query('menuTypeId') menuTypeId?: string,
    @Query('type') type?: string,
    @Query('locale') locale = 'ru',
  ) {
    if (type) {
      return this.publicMenuService.getMenuByCode(type, locale);
    }
    if (menuTypeId) {
      return this.publicMenuService.getMenu(menuTypeId, locale);
    }
    return [];
  }

  @Get(':menuTypeId/categories')
  @ApiOperation({ summary: 'Get categories for a menu type (public)' })
  @ApiQuery({ name: 'locale', required: false, default: 'ru' })
  getCategories(
    @Param('menuTypeId') menuTypeId: string,
    @Query('locale') locale = 'ru',
  ) {
    return this.publicMenuService.getCategories(menuTypeId, locale);
  }

  @Get('categories/:categoryId/items')
  @ApiOperation({ summary: 'Get items for a category (public)' })
  @ApiQuery({ name: 'locale', required: false, default: 'ru' })
  getCategoryItems(
    @Param('categoryId') categoryId: string,
    @Query('locale') locale = 'ru',
  ) {
    return this.publicMenuService.getCategoryItems(categoryId, locale);
  }
}
