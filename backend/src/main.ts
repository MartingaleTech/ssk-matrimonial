import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

const isProduction = process.env.NODE_ENV === 'production';

function resolveCorsOrigin(): string[] | boolean {
  const configured = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length > 0 && !configured.includes('*')) {
    return configured;
  }
  if (isProduction) {
    throw new Error(
      'CORS_ORIGIN must list explicit allowed origins in production',
    );
  }
  return true;
}

async function bootstrap() {
  if (isProduction && !process.env.DATA_ENCRYPTION_KEY) {
    throw new Error('DATA_ENCRYPTION_KEY must be set in production');
  }

  // Payment webhook signatures are verified against the exact request bytes.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(helmet());

  app.enableCors({
    origin: resolveCorsOrigin(),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`SSK Matrimonial API running on port ${port}`);
}
bootstrap();
