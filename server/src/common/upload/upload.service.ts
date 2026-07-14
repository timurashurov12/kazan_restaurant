import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharpModule = (() => { try { return require('sharp'); } catch { return null; } })() as ((input: Buffer) => ReturnType<typeof import('sharp')['default']>) | null;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (sharpModule) {
      this.logger.log('sharp loaded — images will be compressed to webp');
    } else {
      this.logger.warn('sharp not available — images saved in original format');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (sharpModule) {
      const filename = `${crypto.randomUUID()}.webp`;
      const filepath = join(this.uploadsDir, filename);
      try {
        await sharpModule(file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(filepath);
        return `/uploads/${filename}`;
      } catch (err) {
        this.logger.warn(`sharp processing failed, saving original: ${err}`);
      }
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = join(this.uploadsDir, filename);
    const { writeFile } = await import('fs/promises');
    await writeFile(filepath, file.buffer);
    return `/uploads/${filename}`;
  }
}
