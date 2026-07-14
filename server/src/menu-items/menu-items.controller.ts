import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MenuItemsService } from './menu-items.service';
import { UploadService } from '../common/upload/upload.service';

@ApiTags('Admin - Menu Items')
@Controller('admin/menu-items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List menu items' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.menuItemsService.findAll({
      categoryId,
      search,
      sortBy,
      sortOrder: sortOrder === 'desc' ? 'desc' : 'asc',
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create menu item' })
  create(
    @Body()
    body: {
      categoryId: string;
      price: number;
      weightOrVolume?: string;
      sortOrder?: number;
      imagePath?: string;
      translations: {
        locale: string;
        name: string;
        description?: string;
      }[];
    },
  ) {
    return this.menuItemsService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu item' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      categoryId?: string;
      price?: number;
      weightOrVolume?: string;
      sortOrder?: number;
      isActive?: boolean;
      imagePath?: string | null;
      translations?: {
        locale: string;
        name: string;
        description?: string;
      }[];
    },
  ) {
    return this.menuItemsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu item' })
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload image for menu item' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = await this.uploadService.saveFile(file);
    return this.menuItemsService.uploadImage(id, imagePath);
  }
}
