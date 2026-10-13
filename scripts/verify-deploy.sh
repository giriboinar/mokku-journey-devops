#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Mokku Journey DevOps — deployment verification.
#
#   ./scripts/verify-deploy.sh <public-ip>
#   ./scripts/verify-deploy.sh 13.232.10.20
#
# Checks the app, API, and monitoring endpoints. Prints PASS/FAIL per check
# and exits non-zero if anything fails (usable as a pipeline gate).
# ─────────────────────────────────────────────────────────────────────────────
set -u

IP="${1:-}"
if [[ -z "$IP" ]]; then
  echo "Usage: $0 <public-ip>"
  echo "Example: $0 13.232.10.20"
  exit 2
fi

pass=0
fail=0

check() { # $1 = description, $2 = URL, $3 = expected HTTP code
  local desc="$1" url="$2" expected="$3"
  printf '→ %s ... ' "$desc"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$url" 2>/dev/null || echo "000")"
  if [[ "$code" == "$expected" ]]; then
    echo "PASS (HTTP $code)"
    pass=$((pass + 1))
  else
    echo "FAIL (got HTTP $code, expected $expected)"
    fail=$((fail + 1))
  fi
}

echo "Verifying Mokku Journey DevOps deployment at ${IP}"
echo

check "Frontend serves index"            "http://${IP}/"                    200
check "API health endpoint"             "http://${IP}/api/health"          200
check "Stages API responds"             "http://${IP}/api/stages"          200
check "Backend /metrics exposed"        "http://${IP}/api/metrics"         200
check "Prometheus healthy"              "http://${IP}:9090/-/healthy"      200
check "Grafana login page"              "http://${IP}:3000/login"          200

# Print the health body so a human can eyeball it.
echo
echo "→ /api/health body:"
curl -sS --max-time 15 "http://${IP}/api/health" 2>/dev/null || echo "(unreachable)"
echo
echo "Passed: $pass  Failed: $fail"
[[ "$fail" -eq 0 ]] || { echo "VERIFY-DEPLOY FAILED"; exit 1; }
echo "VERIFY-DEPLOY PASSED"
