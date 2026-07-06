import { Module } from '@nestjs/common';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { UploadModule } from '../common/upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}
