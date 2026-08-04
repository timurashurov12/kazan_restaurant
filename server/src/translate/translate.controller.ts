import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TranslateService } from './translate.service';

@ApiTags('Admin - Translate')
@Controller('admin/translate')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post('menu-type')
  @ApiOperation({ summary: 'Translate menu type' })
  translateMenuType(
    @Body() body: { menuTypeId: string; targetLocales?: string[] },
  ) {
    return this.translateService.translateMenuType(
      body.menuTypeId,
      body.targetLocales,
    );
  }

  @Post('category')
  @ApiOperation({ summary: 'Translate category' })
  translateCategory(
    @Body() body: { categoryId: string; targetLocales?: string[] },
  ) {
    return this.translateService.translateCategory(
      body.categoryId,
      body.targetLocales,
    );
  }

  @Post('menu-item')
  @ApiOperation({ summary: 'Translate menu item' })
  translateMenuItem(
    @Body() body: { menuItemId: string; targetLocales?: string[] },
  ) {
    return this.translateService.translateMenuItem(
      body.menuItemId,
      body.targetLocales,
    );
  }

  @Post('region')
  @ApiOperation({ summary: 'Translate region' })
  translateRegion(
    @Body() body: { regionId: string; targetLocales?: string[] },
  ) {
    return this.translateService.translateRegion(
      body.regionId,
      body.targetLocales,
    );
  }

  @Post('wine-classification')
  @ApiOperation({ summary: 'Translate wine classification' })
  translateWineClassification(
    @Body() body: { classificationId: string; targetLocales?: string[] },
  ) {
    return this.translateService.translateWineClassification(
      body.classificationId,
      body.targetLocales,
    );
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk translate entities' })
  async bulkTranslate(
    @Body()
    body: {
      type: 'menu-type' | 'category' | 'menu-item' | 'region' | 'wine-classification';
      ids: string[];
      targetLocales?: string[];
    },
  ) {
    const errors: { id: string; message: string }[] = [];
    let totalTranslated = 0;

    for (const id of body.ids) {
      try {
        let result;
        switch (body.type) {
          case 'menu-type':
            result = await this.translateService.translateMenuType(id, body.targetLocales);
            break;
          case 'category':
            result = await this.translateService.translateCategory(id, body.targetLocales);
            break;
          case 'menu-item':
            result = await this.translateService.translateMenuItem(id, body.targetLocales);
            break;
          case 'region':
            result = await this.translateService.translateRegion(id, body.targetLocales);
            break;
          case 'wine-classification':
            result = await this.translateService.translateWineClassification(id, body.targetLocales);
            break;
        }
        totalTranslated += result?.translated ?? 0;
      } catch (err: unknown) {
        errors.push({
          id,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { totalTranslated, errors };
  }
}
