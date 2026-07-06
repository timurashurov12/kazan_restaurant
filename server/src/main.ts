import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();
const envCandidates = [
  join(cwd, '..', '.env'),
  join(cwd, '.env'),
];
const envPath = envCandidates.find((p) => existsSync(p));
if (envPath) config({ path: envPath });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function resolveUploadsDir(): string {
  if (process.env.UPLOADS_DIR) return process.env.UPLOADS_DIR;
  return join(process.cwd(), 'uploads');
}

const UPLOADS_DIR = resolveUploadsDir();

async function bootstrap() {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads/' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  app.enableCors({
    origin: [clientUrl],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kazan API')
    .setDescription('Kazan Restaurant — API для меню')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.API_PORT || 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on port ${port}`);
  console.log(`Swagger: http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('bootstrap failed', err);
  process.exit(1);
});
