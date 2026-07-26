import { registerAs } from '@nestjs/config';

const DEV_SECRET = 'dev-only-insecure-jwt-secret';

function resolveSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return DEV_SECRET;
}

export default registerAs('jwt', () => ({
  secret: resolveSecret(),
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
