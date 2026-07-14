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
import { MenuTypesService } from './menu-types.service';
import { UploadService } from '../common/upload/upload.service';

@ApiTags('Admin - Menu Types')
@Controller('admin/menu-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MenuTypesController {
  constructor(
    private readonly menuTypesService: MenuTypesService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List menu types' })
  @ApiQuery({ name: 'menuId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  findAll(
    @Query('menuId') menuId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.menuTypesService.findAll({
      menuId,
      search,
      sortBy,
      sortOrder: sortOrder === 'desc' ? 'desc' : 'asc',
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu type by ID' })
  findOne(@Param('id') id: string) {
    return this.menuTypesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create menu type' })
  create(
    @Body()
    body: {
      menuId: string;
      code: string;
      sortOrder?: number;
      imagePath?: string;
      translations: { locale: string; name: string }[];
    },
  ) {
    return this.menuTypesService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu type' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      code?: string;
      sortOrder?: number;
      isActive?: boolean;
      imagePath?: string | null;
      translations?: { locale: string; name: string }[];
    },
  ) {
    return this.menuTypesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu type' })
  remove(@Param('id') id: string) {
    return this.menuTypesService.remove(id);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload image for menu type' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = await this.uploadService.saveFile(file);
    return this.menuTypesService.uploadImage(id, imagePath);
  }
}
