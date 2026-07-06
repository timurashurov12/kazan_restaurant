import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MenusService } from './menus.service';

@ApiTags('Admin - Menus')
@Controller('admin/menus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'List menus' })
  findAll() {
    return this.menusService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create menu' })
  create(@Body() body: { name: string; sortOrder?: number }) {
    return this.menusService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu' })
  update(@Param('id') id: string, @Body() body: { name?: string; sortOrder?: number; isActive?: boolean }) {
    return this.menusService.update(id, body);
  }
}
