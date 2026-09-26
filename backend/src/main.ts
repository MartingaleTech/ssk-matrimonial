import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  if (isProduction && !process.env.DATA_ENCRYPTION_KEY) {
    throw new Error('DATA_ENCRYPTION_KEY must be set in production');
  }

  // Payment webhook signatures are verified against the exact request bytes.
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
  });
  configureApp(app);
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  app.get(Logger).log(`SSK Matrimonial API listening on port ${port}`);
}
bootstrap();
