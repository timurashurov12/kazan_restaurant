import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterModule.register({
      storage: undefined,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
