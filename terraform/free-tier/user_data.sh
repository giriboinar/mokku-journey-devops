#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Mokku Journey DevOps — EC2 user_data (Free Tier).
#
# Terraform fills in ${repo_url} and ${compose_file} via templatefile().
# This script installs Docker, pulls the repo, and starts the production
# stack with docker compose. Log: /var/log/user-data.log
# ─────────────────────────────────────────────────────────────────────────────
set -xe
exec > >(tee -a /var/log/user-data.log) 2>&1

echo "== Mokku Journey DevOps user-data starting =="

dnf install -y docker git curl

systemctl enable --now docker
usermod -aG docker ec2-user || true

# ── Docker Compose v2 plugin ────────────────────────────────────────────────
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64)  COMPOSE_ARCH="x86_64" ;;
  aarch64) COMPOSE_ARCH="aarch64" ;;
  *) echo "unsupported architecture: $ARCH"; exit 1 ;;
esac
COMPOSE_VERSION="v2.29.7"
mkdir -p /usr/libexec/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/$${COMPOSE_VERSION}/docker-compose-linux-$${COMPOSE_ARCH}" \
  -o /usr/libexec/docker/cli-plugins/docker-compose
chmod +x /usr/libexec/docker/cli-plugins/docker-compose
docker compose version

# ── Deploy the application ──────────────────────────────────────────────────
APP_DIR="/opt/mokku-journey-devops"
rm -rf "$APP_DIR"
git clone "${repo_url}" "$APP_DIR"
cd "$APP_DIR"
docker compose -f "${compose_file}" up -d --build

# ── Wait for the API (through the nginx /api proxy), up to 5 minutes ────────
for i in $(seq 1 60); do
  if curl -fsS --max-time 5 http://localhost/api/health >/dev/null 2>&1; then
    echo "API is healthy."
    break
  fi
  echo "waiting for API... ($i/60)"
  sleep 5
done
curl -fsS --max-time 5 http://localhost/api/health || {
  echo "ERROR: API never became healthy"
  docker compose -f "${compose_file}" ps
  exit 1
}

echo "== Mokku Journey DevOps user-data complete =="
