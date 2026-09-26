import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import { Params } from 'nestjs-pino';

const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-razorpay-signature"]',
  'req.headers["stripe-signature"]',
];

/**
 * One JSON object per line on stdout in production so any aggregator
 * (Fly logs, Datadog, Better Stack, CloudWatch...) can ingest it without a
 * sidecar. Pretty-printed locally unless LOG_FORMAT=json.
 */
export function buildLoggerParams(): Params {
  const isProduction = process.env.NODE_ENV === 'production';
  const pretty = !isProduction && process.env.LOG_FORMAT !== 'json';

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
      base: {
        service: 'ssk-matrimonial-api',
        env: process.env.NODE_ENV ?? 'development',
        version: process.env.APP_VERSION ?? process.env.FLY_IMAGE_REF ?? null,
      },
      redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
      genReqId: (req: IncomingMessage, res: ServerResponse) => {
        const incoming = req.headers['x-request-id'];
        const id =
          typeof incoming === 'string' && incoming.length <= 128
            ? incoming
            : randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      customProps: (req: IncomingMessage) => {
        const user = (req as IncomingMessage & { user?: { id?: string } }).user;
        return user?.id ? { userId: user.id } : {};
      },
      autoLogging: {
        ignore: (req: IncomingMessage) =>
          req.url === '/api/health' || req.url === '/api/health/live',
      },
      transport: pretty
        ? {
            target: 'pino-pretty',
            options: { colorize: true, singleLine: true },
          }
        : undefined,
    },
  };
}
