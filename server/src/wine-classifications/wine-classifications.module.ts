import { Module } from '@nestjs/common';
import { WineClassificationsController } from './wine-classifications.controller';
import { WineClassificationsService } from './wine-classifications.service';

@Module({
  controllers: [WineClassificationsController],
  providers: [WineClassificationsService],
  exports: [WineClassificationsService],
})
export class WineClassificationsModule {}
