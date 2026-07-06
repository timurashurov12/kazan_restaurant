import { Module } from '@nestjs/common';
import { LanguagesController } from './languages.controller';
import { AdminLanguagesController } from './admin-languages.controller';
import { LanguagesService } from './languages.service';

@Module({
  controllers: [LanguagesController, AdminLanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
