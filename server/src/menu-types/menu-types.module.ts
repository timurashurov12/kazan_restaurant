import { Module } from '@nestjs/common';
import { MenuTypesController } from './menu-types.controller';
import { MenuTypesService } from './menu-types.service';
import { UploadModule } from '../common/upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [MenuTypesController],
  providers: [MenuTypesService],
})
export class MenuTypesModule {}
