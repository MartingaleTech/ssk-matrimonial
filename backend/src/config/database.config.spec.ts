import { resolveDatabaseConnection } from './database.config';

describe('resolveDatabaseConnection', () => {
  it('uses DB_* variables when DATABASE_URL is absent', () => {
    expect(
      resolveDatabaseConnection({
        DB_HOST: 'db',
        DB_PORT: '5433',
        DB_USERNAME: 'u',
        DB_PASSWORD: 'p',
        DB_DATABASE: 'd',
      }),
    ).toEqual({
      host: 'db',
      port: 5433,
      username: 'u',
      password: 'p',
      database: 'd',
      ssl: false,
    });
  });

  it('prefers DATABASE_URL and decodes credentials', () => {
    expect(
      resolveDatabaseConnection({
        DATABASE_URL: 'postgres://app:p%40ss@pg.internal:5432/ssk',
        DB_HOST: 'ignored',
      }),
    ).toMatchObject({
      host: 'pg.internal',
      port: 5432,
      username: 'app',
      password: 'p@ss',
      database: 'ssk',
      ssl: false,
    });
  });

  it('enables TLS from sslmode=require and honours DB_SSL_REJECT_UNAUTHORIZED', () => {
    expect(
      resolveDatabaseConnection({
        DATABASE_URL: 'postgres://a:b@h/d?sslmode=require',
        DB_SSL_REJECT_UNAUTHORIZED: 'false',
      }).ssl,
    ).toEqual({ rejectUnauthorized: false, ca: undefined });
  });

  it('lets DB_SSL override the URL sslmode', () => {
    expect(
      resolveDatabaseConnection({
        DATABASE_URL: 'postgres://a:b@h/d?sslmode=require',
        DB_SSL: 'false',
      }).ssl,
    ).toBe(false);
  });
});
