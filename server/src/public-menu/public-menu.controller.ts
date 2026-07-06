import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PublicMenuService } from './public-menu.service';

@ApiTags('Menu (public)')
@Controller('menu-types')
export class PublicMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get menu types (public)' })
  @ApiQuery({ name: 'locale', required: false, default: 'ru' })
  getMenuTypes(@Query('locale') locale = 'ru') {
    return this.publicMenuService.getMenuTypes(locale);
  }
}
