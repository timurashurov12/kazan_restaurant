import { Module } from '@nestjs/common';
import { LanguagesController } from './languages.controller';
import { AdminLanguagesController } from './admin-languages.controller';
import { LanguagesService } from './languages.service';
import { AiModule } from '../common/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [LanguagesController, AdminLanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
