import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as crypto from 'crypto';

// Keep sharp on the 0.33 line. From 0.34 the prebuilt Linux x64 binaries
// require the x86-64-v2 microarchitecture, and the production host is a QEMU
// vCPU without popcnt/sse4_1/sse4_2/ssse3 — so 0.34+ fails to load there and
// every upload silently falls through to the uncompressed branch below.
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

  // The modal shows the image at roughly 400px wide, the lists at 128px on a
  // phone — 384 device pixels at 3x. Serving one 1200px file to both means the
  // list downloads about six times what it can display, on every row.
  private static readonly FULL_PX = 1200;
  private static readonly THUMB_PX = 400;

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (sharp) {
      const id = crypto.randomUUID();
      const filename = `${id}.webp`;
      try {
        await sharp(file.buffer)
          .resize(UploadService.FULL_PX, UploadService.FULL_PX, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toFile(join(this.uploadsDir, filename));

        // Derived by convention from the stored path, so nothing extra goes
        // into the database. Its absence is not fatal: the client falls back
        // to the full image, which is what images predating this do.
        try {
          await sharp(file.buffer)
            .resize(UploadService.THUMB_PX, UploadService.THUMB_PX, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .webp({ quality: 72 })
            .toFile(join(this.uploadsDir, `${id}.thumb.webp`));
        } catch (err) {
          this.logger.warn(`thumbnail generation failed for ${filename}: ${err}`);
        }

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
