import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = `${crypto.randomUUID()}.webp`;
    const filepath = join(this.uploadsDir, filename);

    try {
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);
    } catch (err) {
      this.logger.warn(`sharp processing failed, saving original: ${err}`);
      const ext = file.originalname.split('.').pop() || 'jpg';
      const fallbackName = `${crypto.randomUUID()}.${ext}`;
      const fallbackPath = join(this.uploadsDir, fallbackName);
      const { writeFile } = await import('fs/promises');
      await writeFile(fallbackPath, file.buffer);
      return `/uploads/${fallbackName}`;
    }

    return `/uploads/${filename}`;
  }
}
