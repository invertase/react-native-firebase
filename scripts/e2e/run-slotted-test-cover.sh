#!/usr/bin/env bash
# Run yarn tests:<platform>:test-cover with slotted ports (+ macOS PRODUCT_NAME).
# Usage: bash scripts/e2e/run-slotted-test-cover.sh <android|ios|macos> <slot>
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=lib/e2e-slot-env.sh
source "${SCRIPT_DIR}/lib/e2e-slot-env.sh"

PLATFORM="${1:?platform required: android|ios|macos}"
SLOT="${2:?slot required: non-negative integer}"

e2e_slot_env_apply "$PLATFORM" "$SLOT"

# Gate: do not start :test-cover until Metro /status reports packager-status:running.
# After concurrent jet-reset-cache, listen can precede ready by well over 120s.
METRO_STATUS_WAIT_SEC="${RNFB_SLOTTED_METRO_STATUS_WAIT_SEC:-600}"
metro_port="${RCT_METRO_PORT:?RCT_METRO_PORT must be set after e2e_slot_env_apply}"
echo "[slotted-test-cover] waiting up to ${METRO_STATUS_WAIT_SEC}s for Metro packager-status:running on :${metro_port}"
elapsed=0
while true; do
  body="$(curl -sf "http://127.0.0.1:${metro_port}/status" 2>/dev/null || true)"
  if [[ "${body}" == *"packager-status:running"* ]]; then
    echo "[slotted-test-cover] Metro OK on :${metro_port} (packager-status:running) after ${elapsed}s"
    break
  fi
  if (( elapsed >= METRO_STATUS_WAIT_SEC )); then
    echo "[slotted-test-cover] ERROR: Metro on :${metro_port} not packager-status:running within ${METRO_STATUS_WAIT_SEC}s (last body: ${body:-<empty>})" >&2
    exit 1
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

echo "[slotted-test-cover] active=${PLATFORM} slot${SLOT} RCT_METRO_PORT=${RCT_METRO_PORT} RNFB_ANDROID_METRO_PORT=${RNFB_ANDROID_METRO_PORT:-} RNFB_IOS_METRO_PORT=${RNFB_IOS_METRO_PORT:-} RNFB_MACOS_METRO_PORT=${RNFB_MACOS_METRO_PORT:-} jet=${JET_REMOTE_PORT} androidSerial=${ANDROID_SERIAL:-} consolePort=${RNFB_ANDROID_CONSOLE_PORT:-} macosProduct=${RNFB_MACOS_PRODUCT_NAME:-}"
cd "$REPO_ROOT"
exec yarn "tests:${PLATFORM}:test-cover"
