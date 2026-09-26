#!/usr/bin/env bash
# One-time provisioning of a Fly.io environment (staging or production).
# Idempotent: re-running skips resources that already exist.
#
#   backend/fly/bootstrap.sh staging
#   backend/fly/bootstrap.sh production
#
# Requires: flyctl authenticated (`fly auth login`), and the app's third-party
# secrets exported in the environment (see SECRETS below) — they are pushed
# with `fly secrets set` and never written to disk.
set -euo pipefail

ENV_NAME="${1:?usage: bootstrap.sh <staging|production>}"
REGION="${FLY_REGION:-bom}"
ORG="${FLY_ORG:-personal}"
HERE="$(cd "$(dirname "$0")" && pwd)"

case "$ENV_NAME" in
  staging)
    APP="ssk-matrimonial-api-staging"
    PG="ssk-matrimonial-pg-staging"
    PG_ARGS=(--vm-size shared-cpu-1x --volume-size 10 --initial-cluster-size 1)
    ;;
  production)
    APP="ssk-matrimonial-api"
    PG="ssk-matrimonial-pg"
    # HA pair: leader + replica, so a node failure does not take the API down.
    PG_ARGS=(--vm-size shared-cpu-2x --volume-size 40 --initial-cluster-size 2)
    ;;
  *) echo "unknown environment: $ENV_NAME" >&2; exit 1 ;;
esac

SECRETS=(
  JWT_SECRET DATA_ENCRYPTION_KEY CORS_ORIGIN
  R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET R2_PUBLIC_BASE_URL
  TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_VERIFY_SERVICE_SID
  STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
  RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET RAZORPAY_WEBHOOK_SECRET
)

echo "==> app: $APP"
if ! fly apps list --json | grep -q "\"Name\": *\"$APP\""; then
  fly apps create "$APP" --org "$ORG"
fi

echo "==> postgres: $PG"
if ! fly apps list --json | grep -q "\"Name\": *\"$PG\""; then
  fly postgres create --name "$PG" --org "$ORG" --region "$REGION" "${PG_ARGS[@]}"
  # Nightly base snapshots of the volume(s). Combined with WAL archiving this
  # is the PITR story for Fly Postgres; see README.md for restore steps.
  fly volumes list -a "$PG" --json \
    | grep -o '"id": *"vol_[a-z0-9]*"' | grep -o 'vol_[a-z0-9]*' \
    | xargs -I{} fly volumes update {} -a "$PG" --snapshot-retention 14
fi

echo "==> attach postgres (sets DATABASE_URL on $APP)"
if ! fly secrets list -a "$APP" | grep -q '^DATABASE_URL'; then
  fly postgres attach "$PG" -a "$APP" --database-name ssk_matrimonial --yes
fi

echo "==> secrets"
missing=()
args=()
for key in "${SECRETS[@]}"; do
  if [[ -n "${!key:-}" ]]; then
    args+=("$key=${!key}")
  else
    missing+=("$key")
  fi
done
if ((${#args[@]})); then
  fly secrets set -a "$APP" --stage "${args[@]}"
fi
if ((${#missing[@]})); then
  echo "!! not set (export and re-run, or 'fly secrets set -a $APP KEY=...'):"
  printf '   %s\n' "${missing[@]}"
fi

echo
echo "Done. Next: fly deploy backend --config $HERE/$ENV_NAME.toml"
