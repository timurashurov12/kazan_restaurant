import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = join(this.uploadsDir, filename);

    const { writeFile } = await import('fs/promises');
    await writeFile(filepath, file.buffer);

    return `/uploads/${filename}`;
  }
}
