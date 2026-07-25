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
import { RegionsService } from './regions.service';

@ApiTags('Admin - Regions')
@Controller('admin/regions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'List regions' })
  findAll() {
    return this.regionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  findOne(@Param('id') id: string) {
    return this.regionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create region' })
  create(
    @Body()
    body: {
      sortOrder?: number;
      translations: { locale: string; name: string }[];
    },
  ) {
    return this.regionsService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update region' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      sortOrder?: number;
      isActive?: boolean;
      translations?: { locale: string; name: string }[];
    },
  ) {
    return this.regionsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete region' })
  remove(@Param('id') id: string) {
    return this.regionsService.remove(id);
  }
}
