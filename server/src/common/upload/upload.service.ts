import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private uploadsDir: string;
  private sharp: typeof import('sharp') | null = null;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
    this.loadSharp();
  }

  private async loadSharp() {
    try {
      this.sharp = await import('sharp');
      this.logger.log('sharp loaded successfully');
    } catch {
      this.logger.warn('sharp not available, images will be saved without compression');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (this.sharp) {
      const filename = `${crypto.randomUUID()}.webp`;
      const filepath = join(this.uploadsDir, filename);
      try {
        await this.sharp(file.buffer)
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
