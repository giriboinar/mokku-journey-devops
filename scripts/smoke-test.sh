#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Smoke tests for Raja's Mokku Journey backend.
#
#   BASE_URL=http://localhost:8000 ./scripts/smoke-test.sh
#   BASE_URL="http://<alb-hostname>" ./scripts/smoke-test.sh
#
# Exits non-zero on the first failure (used as a pipeline gate).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8000}"
BASE_URL="${BASE_URL%/}"

pass=0
fail=0

check() { # $1 = description, $2 = curl args..., last arg = expected substring
  local desc="$1"; shift
  local expected="${!#}"
  local args=("${@:1:$#-1}")
  echo "→ $desc"
  local body
  if ! body="$(curl -sf --max-time 15 "${args[@]}" 2>/dev/null)"; then
    echo "  ✗ FAIL: request failed"
    fail=$((fail + 1)); return
  fi
  if [[ "$body" == *"$expected"* ]]; then
    echo "  ✓ OK"
    pass=$((pass + 1))
  else
    echo "  ✗ FAIL: expected '$expected' in response"
    fail=$((fail + 1))
  fi
}

check_status() { # $1 = description, $2 = path, $3 = expected HTTP code
  local desc="$1" path="$2" expected="$3"
  echo "→ $desc"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "${BASE_URL}${path}")"
  if [[ "$code" == "$expected" ]]; then
    echo "  ✓ OK (HTTP $code)"; pass=$((pass + 1))
  else
    echo "  ✗ FAIL: got HTTP $code, expected $expected"; fail=$((fail + 1))
  fi
}

echo "Smoke-testing ${BASE_URL}"

check_status "Health endpoint responds"            "/api/health" 200
check        "Health body reports status ok"      "${BASE_URL}/api/health" '"status":"ok"'
check_status "Stages list responds"               "/api/stages" 200
check        "Stages list is a JSON array"        "${BASE_URL}/api/stages" '['
check_status "Stage detail responds"              "/api/stages/1" 200
check        "Stage detail has English title"    "${BASE_URL}/api/stages/1" '"title_en"'
check        "Stage detail has Telugu title"     "${BASE_URL}/api/stages/1" '"title_te"'
check_status "Config endpoint responds"           "/api/config" 200
check_status "Unknown stage returns 404"          "/api/stages/9999" 404

echo
echo "Passed: $pass  Failed: $fail"
[[ "$fail" -eq 0 ]] || { echo "SMOKE TESTS FAILED"; exit 1; }
echo "SMOKE TESTS PASSED"
