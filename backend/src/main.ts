import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  if (isProduction && !process.env.DATA_ENCRYPTION_KEY) {
    throw new Error('DATA_ENCRYPTION_KEY must be set in production');
  }

  // Payment webhook signatures are verified against the exact request bytes.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  configureApp(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`SSK Matrimonial API running on port ${port}`);
}
bootstrap();
