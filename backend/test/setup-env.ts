/**
 * Defaults for running the e2e suite against a local Postgres
 * (`docker run ... postgres:16-alpine`, then `npm run migration:run`).
 * Any value already present in the environment wins, so CI can override.
 */
const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_DATABASE: 'ssk_matrimonial',
  DB_RUN_MIGRATIONS: 'false',
  JWT_SECRET: 'e2e-only-jwt-secret',
  DATA_ENCRYPTION_KEY:
    '0000000000000000000000000000000000000000000000000000000000000000',
  R2_ACCOUNT_ID: 'e2e',
  R2_ACCESS_KEY_ID: 'e2e',
  R2_SECRET_ACCESS_KEY: 'e2e',
  R2_BUCKET: 'e2e',
  R2_PUBLIC_BASE_URL: 'https://e2e.invalid',
};

for (const [key, value] of Object.entries(defaults)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}
