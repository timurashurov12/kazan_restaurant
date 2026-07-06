import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get available languages' })
  findAll() {
    return this.languagesService.findAll();
  }
}
