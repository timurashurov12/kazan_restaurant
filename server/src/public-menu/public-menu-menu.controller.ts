import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PublicMenuService } from './public-menu.service';

@ApiTags('Menu (public)')
@Controller('menu')
export class PublicMenuController2 {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get menu by type code or ID (public)' })
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

  @Get(':menuTypeCode/categories')
  @ApiOperation({ summary: 'Get categories by menu type code (public)' })
  @ApiQuery({ name: 'locale', required: false, default: 'ru' })
  getCategories(
    @Param('menuTypeCode') menuTypeCode: string,
    @Query('locale') locale = 'ru',
  ) {
    return this.publicMenuService.getCategoriesByCode(menuTypeCode, locale);
  }

  @Get(':menuTypeCode/categories/:categoryCode/items')
  @ApiOperation({ summary: 'Get items by category code (public)' })
  @ApiQuery({ name: 'locale', required: false, default: 'ru' })
  getCategoryItems(
    @Param('menuTypeCode') menuTypeCode: string,
    @Param('categoryCode') categoryCode: string,
    @Query('locale') locale = 'ru',
  ) {
    return this.publicMenuService.getCategoryItemsByCode(menuTypeCode, categoryCode, locale);
  }
}
