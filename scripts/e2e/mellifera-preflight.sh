#!/usr/bin/env bash
# Wait for reserved services to be UP before starting e2e (Metro/emulators listening).
# This is the opposite of check-e2e-resources.sh (host CLEAR).
# Prefer env from tests/mellifera.env.json written by mellifera-apply-reservation.js.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MELLIFERA_URL="${MELLIFERA_URL:-http://127.0.0.1:8790}"
PORTS_FILE="${REPO_ROOT}/tests/mellifera.env.json"
WAIT_SEC="${RNFB_PREFLIGHT_WAIT_SEC:-300}"
FAIL=0

log_ok() { echo "[preflight] OK  $*"; }
log_fail() { echo "[preflight] FAIL $*" >&2; FAIL=1; }

wait_http() {
  local url=$1 label=$2 max=${3:-180}
  local i=0
  while ! curl -sf "$url" >/dev/null 2>&1; do
    sleep 2
    i=$((i + 2))
    if [[ $i -ge $max ]]; then
      log_fail "${label} timeout ${url} after ${max}s"
      return 1
    fi
  done
  log_ok "${label} ${url}"
}

wait_listen() {
  local port=$1 label=$2 max=${3:-$WAIT_SEC}
  local i=0
  while ! lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; do
    sleep 2
    i=$((i + 2))
    if [[ $i -ge $max ]]; then
      log_fail "${label} timeout :${port} after ${max}s"
      return 1
    fi
  done
  log_ok "${label} listening :${port}"
}

echo "[preflight] mellifera health (wait up to ${WAIT_SEC}s per service)"
wait_http "${MELLIFERA_URL}/health" "mellifera" 60 || true

[[ -f "$PORTS_FILE" ]] && log_ok "ports file ${PORTS_FILE}" || log_fail "missing ${PORTS_FILE}"

PREFLIGHT_PLATFORMS="${RNFB_PREFLIGHT_PLATFORMS:-android,ios,macos}"
IFS=',' read -r -a _preflight_platforms <<< "$PREFLIGHT_PLATFORMS"

for platform in "${_preflight_platforms[@]}"; do
  metro=$(node -e "try{console.log(require('${PORTS_FILE}').${platform}.metro)}catch(e){process.exit(1)}" 2>/dev/null || echo "")
  jet=$(node -e "try{console.log(require('${PORTS_FILE}').${platform}.jet)}catch(e){process.exit(1)}" 2>/dev/null || echo "")
  fs=$(node -e "try{console.log(require('${PORTS_FILE}').${platform}.emulator.firestore)}catch(e){process.exit(1)}" 2>/dev/null || echo "")
  fn=$(node -e "try{console.log(require('${PORTS_FILE}').${platform}.emulator.functions)}catch(e){process.exit(1)}" 2>/dev/null || echo "")

  echo "[preflight] platform=${platform} metro=${metro} jet=${jet} firestore=${fs} functions=${fn}"

  [[ -n "$metro" ]] && wait_listen "$metro" "metro-${platform}" 120 || true
  [[ -n "$metro" ]] && wait_http "http://127.0.0.1:${metro}/status" "metro-${platform}-status" 60 || true
  if [[ -n "$jet" ]] && lsof -nP -iTCP:"${jet}" -sTCP:LISTEN >/dev/null 2>&1; then
    log_fail "stale jet listener on :${jet} (${platform})"
  else
    [[ -n "$jet" ]] && log_ok "jet port free :${jet} (${platform})"
  fi
  [[ -n "$fs" ]] && wait_http "http://127.0.0.1:${fs}" "firestore-${platform}" "$WAIT_SEC" || true
  [[ -n "$fn" ]] && wait_listen "$fn" "functions-${platform}" "$WAIT_SEC" || true
done

MACOS_PRODUCT="${RNFB_MACOS_PRODUCT_NAME:-io.invertase.testing}"
MACOS_APP="${REPO_ROOT}/tests-macos/macos/build/Build/Products/Debug/${MACOS_PRODUCT}.app"
if [[ "$PREFLIGHT_PLATFORMS" == *macos* ]]; then
  [[ -d "$MACOS_APP" ]] && log_ok "macOS app ${MACOS_PRODUCT}" || log_fail "macOS app missing (${MACOS_APP})"
fi

# Finding #7: gate iOS/Android artifact existence checks on RNFB_PREFLIGHT_PLATFORMS,
# same as the port waits above — a platform not in scope for this run should not be
# able to fail preflight just because its app/APK was never built.
IOS_APP="${REPO_ROOT}/tests/ios/build/Build/Products/Debug-iphonesimulator/testing.app"
if [[ "$PREFLIGHT_PLATFORMS" == *ios* ]]; then
  [[ -d "$IOS_APP" ]] && log_ok "iOS app" || log_fail "iOS app missing"
fi

APK="${REPO_ROOT}/tests/android/app/build/outputs/apk/debug/app-debug.apk"
if [[ "$PREFLIGHT_PLATFORMS" == *android* ]]; then
  [[ -f "$APK" ]] && log_ok "android apk" || log_fail "android apk missing"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "[preflight] FAILED — not starting tests" >&2
  exit 1
fi

echo "[preflight] all checks passed"
exit 0
