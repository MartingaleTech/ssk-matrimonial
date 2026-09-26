import { registerAs } from '@nestjs/config';

export interface DatabaseConnection {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: false | { rejectUnauthorized: boolean; ca?: string };
}

/**
 * Connection settings from the environment. `DATABASE_URL` (what managed
 * providers such as Fly Postgres inject) takes precedence over the discrete
 * `DB_*` variables; `?sslmode=require` in the URL enables TLS.
 */
export function resolveDatabaseConnection(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseConnection {
  const sslEnabled = (() => {
    if (env.DB_SSL) return env.DB_SSL === 'true';
    if (env.DATABASE_URL) {
      const mode = new URL(env.DATABASE_URL).searchParams.get('sslmode');
      return mode !== null && mode !== 'disable';
    }
    return false;
  })();

  const ssl: DatabaseConnection['ssl'] = sslEnabled
    ? {
        rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        ca: env.DB_SSL_CA,
      }
    : false;

  if (env.DATABASE_URL) {
    const url = new URL(env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      ssl,
    };
  }

  return {
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT || '5432', 10),
    username: env.DB_USERNAME || 'postgres',
    password: env.DB_PASSWORD || 'postgres',
    database: env.DB_DATABASE || 'ssk_matrimonial',
    ssl,
  };
}

export default registerAs('database', () => resolveDatabaseConnection());
