import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WineClassificationsService } from './wine-classifications.service';

@ApiTags('Admin - Wine Classifications')
@Controller('admin/wine-classifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WineClassificationsController {
  constructor(private readonly wineClassificationsService: WineClassificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List wine classifications' })
  findAll() {
    return this.wineClassificationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wine classification by ID' })
  findOne(@Param('id') id: string) {
    return this.wineClassificationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create wine classification' })
  create(
    @Body()
    body: {
      code: string;
      sortOrder?: number;
      translations: { locale: string; name: string }[];
    },
  ) {
    return this.wineClassificationsService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update wine classification' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      code?: string;
      sortOrder?: number;
      isActive?: boolean;
      translations?: { locale: string; name: string }[];
    },
  ) {
    return this.wineClassificationsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete wine classification' })
  remove(@Param('id') id: string) {
    return this.wineClassificationsService.remove(id);
  }
}
