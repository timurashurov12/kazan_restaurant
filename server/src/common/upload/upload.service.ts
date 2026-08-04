import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as crypto from 'crypto';

let sharp: ((input: Buffer | string) => import('sharp').Sharp) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('sharp');
  sharp = typeof mod === 'function' ? mod : mod.default ?? null;
} catch {
  sharp = null;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (sharp) {
      this.logger.log('sharp loaded — images will be compressed to webp');
    } else {
      this.logger.warn('sharp not available — images saved in original format');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (sharp) {
      const filename = `${crypto.randomUUID()}.webp`;
      const filepath = join(this.uploadsDir, filename);
      try {
        await sharp(file.buffer)
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
    await writeFile(filepath, file.buffer);
    return `/uploads/${filename}`;
  }
}
