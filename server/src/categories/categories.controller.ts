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
import { CategoriesService } from './categories.service';
import { UploadService } from '../common/upload/upload.service';

@ApiTags('Admin - Categories')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List categories' })
  @ApiQuery({ name: 'menuTypeId', required: false })
  findAll(@Query('menuTypeId') menuTypeId?: string) {
    return this.categoriesService.findAll(menuTypeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  create(
    @Body()
    body: {
      menuTypeId: string;
      sortOrder?: number;
      translations: { locale: string; name: string; description?: string }[];
    },
  ) {
    return this.categoriesService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      sortOrder?: number;
      isActive?: boolean;
      imagePath?: string | null;
      translations?: { locale: string; name: string; description?: string }[];
    },
  ) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload image for category' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = await this.uploadService.saveFile(file);
    return this.categoriesService.uploadImage(id, imagePath);
  }
}
