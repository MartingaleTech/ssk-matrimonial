# Deployment runbook (Fly.io)

Two isolated environments, each its own Fly app + its own Postgres cluster:

| Environment | API app                       | Postgres                    | Deployed when                          |
| ----------- | ----------------------------- | --------------------------- | -------------------------------------- |
| staging     | `ssk-matrimonial-api-staging` | `ssk-matrimonial-pg-staging` | CI passes on `init-branch` / `main`   |
| production  | `ssk-matrimonial-api`         | `ssk-matrimonial-pg` (HA ×2) | a `vX.Y.Z` tag is pushed              |

Region `bom` (Mumbai) — change `primary_region` in the `*.toml` files and
`FLY_REGION` for `bootstrap.sh` if the user base is elsewhere.

## First-time setup

1. `fly auth login`, then provision each environment (creates app, Postgres,
   attaches `DATABASE_URL`, pushes secrets from your shell env):

   ```bash
   export JWT_SECRET=$(openssl rand -hex 32) DATA_ENCRYPTION_KEY=$(openssl rand -hex 32) \
          CORS_ORIGIN=https://app.example.com R2_ACCOUNT_ID=... # etc, see SECRETS in bootstrap.sh
   backend/fly/bootstrap.sh staging
   backend/fly/bootstrap.sh production   # use *different* secret values
   ```

2. Create two deploy tokens, scoped to one app each, and add them as GitHub
   Actions secrets:

   ```bash
   fly tokens create deploy -a ssk-matrimonial-api-staging  # -> FLY_API_TOKEN_STAGING
   fly tokens create deploy -a ssk-matrimonial-api          # -> FLY_API_TOKEN_PRODUCTION
   ```

3. In GitHub → Settings → Environments, create `staging` and `production`;
   add **required reviewers** to `production` for a manual approval gate.

4. First deploy: `fly deploy backend --config backend/fly/staging.toml` (and production).
   Existing databases created by TypeORM `synchronize` need the one-time
   `npm run typeorm -- migration:run --fake` described in `backend/DOCS.md`.

## How a deploy works

`.github/workflows/deploy.yml` → `flyctl deploy --remote-only`:

1. Image is built on Fly's builders from `backend/Dockerfile`.
2. `release_command = "npm run migration:run:prod"` runs in a throw-away
   machine against the **new** image. If a migration fails the deploy stops
   and the old release keeps serving.
3. Machines are replaced with `strategy = "rolling"` (production:
   `max_unavailable = 0.33`, `min_machines_running = 2`). Fly only routes to a
   machine once `GET /api/health` (DB ping) passes.
4. The workflow smoke-tests `/api/health` on the public hostname.

Migrations are therefore applied exactly once per release, before any new
code takes traffic. Keep them backward-compatible with the previous release
(add column → deploy → backfill → drop old column in a later release).

## Promoting to production

```bash
git tag v1.4.0 <sha already running on staging>
git push origin v1.4.0
```

`APP_VERSION` (git sha on staging, tag on production) is stamped on every
log line and is visible in `fly releases`.

## Rollback

```bash
fly releases -a ssk-matrimonial-api                 # find the previous image
fly deploy -a ssk-matrimonial-api --image registry.fly.io/ssk-matrimonial-api:<label>
```

If the bad release included a migration, run
`fly ssh console -a ssk-matrimonial-api -C "npx typeorm -d dist/database/data-source.js migration:revert"`
**before** redeploying the old image.

## Backups and point-in-time recovery

Fly Postgres (the `fly postgres create` flavour) is a Postgres cluster you own:

- **Daily volume snapshots**, retained 14 days (`bootstrap.sh` sets
  `--snapshot-retention 14`). Restore = new cluster from a snapshot:
  `fly postgres create --snapshot-id <id> --name ssk-matrimonial-pg-restore`,
  then `fly postgres attach` it to the API app.
- **WAL archiving / PITR**: Fly Postgres uses Barman for continuous archiving
  when `S3_ARCHIVE_CONFIG` is set. Configure it once per cluster to any
  S3-compatible bucket (the existing R2 account works):

  ```bash
  fly secrets set -a ssk-matrimonial-pg \
    S3_ARCHIVE_CONFIG="https://<key>:<secret>@<account>.r2.cloudflarestorage.com/ssk-pg-wal/ssk-matrimonial-pg"
  ```

  Restore to a timestamp: `fly postgres create --name ...-restore --restore-target-time "<RFC3339>"`.
  Follow the current flyctl docs for exact flags — they change more often
  than this file.
- **Logical dumps** (belt and braces, and how you get data out of Fly):
  `fly postgres connect -a ssk-matrimonial-pg -c "pg_dump ssk_matrimonial" > backup.sql`
  — schedule it from a cron job or a `scheduled-backup` GitHub workflow that
  uploads to R2.

If you would rather not operate Postgres yourself, **Fly Managed Postgres**
(or Neon / Supabase / RDS) exposes PITR as a checkbox. The API only needs a
`DATABASE_URL` (`?sslmode=require` enables TLS), so switching is
`fly secrets set DATABASE_URL=...` plus `DB_SSL_REJECT_UNAUTHORIZED`/`DB_SSL_CA`
if the provider uses a private CA.

## Logs and monitoring

- `fly logs -a ssk-matrimonial-api` — live JSON lines from pino.
- Long-term aggregation: deploy
  [`fly-log-shipper`](https://github.com/superfly/fly-log-shipper) once per
  org and point it at Datadog / Better Stack / Loki / S3. It tails the same
  stdout, so no app change is needed. Queryable fields: `req.id`, `userId`,
  `res.statusCode`, `responseTime`, `service`, `env`, `version`.
- Alerting: point an uptime monitor at `https://<app>.fly.dev/api/health`.
  It returns `503` when Postgres is unreachable.

## Secrets rotation

`fly secrets set -a <app> KEY=value` triggers a rolling restart. Rotating
`JWT_SECRET` logs everyone out; rotating `DATA_ENCRYPTION_KEY` requires a
re-encryption migration — do not rotate it casually.
