import { Module } from '@nestjs/common';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';
import { AiModule } from '../common/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [TranslateController],
  providers: [TranslateService],
})
export class TranslateModule {}
