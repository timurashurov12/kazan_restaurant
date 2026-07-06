import { Module } from '@nestjs/common';
import { PublicMenuController } from './public-menu.controller';
import { PublicMenuController2 } from './public-menu-menu.controller';
import { PublicMenuService } from './public-menu.service';

@Module({
  controllers: [PublicMenuController, PublicMenuController2],
  providers: [PublicMenuService],
})
export class PublicMenuModule {}
