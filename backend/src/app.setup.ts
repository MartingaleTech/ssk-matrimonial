import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

const isProduction = process.env.NODE_ENV === 'production';

export function resolveCorsOrigin(): string[] | boolean {
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

/** Middleware, CORS, validation and prefix shared by `main.ts` and the e2e tests. */
export function configureApp(app: INestApplication): INestApplication {
  app.useLogger(app.get(Logger));
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
  return app;
}
