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

echo "[slotted-test-cover] active=${PLATFORM} slot${SLOT} RCT_METRO_PORT=${RCT_METRO_PORT} RNFB_ANDROID_METRO_PORT=${RNFB_ANDROID_METRO_PORT:-} RNFB_IOS_METRO_PORT=${RNFB_IOS_METRO_PORT:-} RNFB_MACOS_METRO_PORT=${RNFB_MACOS_METRO_PORT:-} jet=${JET_REMOTE_PORT} macosProduct=${RNFB_MACOS_PRODUCT_NAME:-}"
cd "$REPO_ROOT"
exec yarn "tests:${PLATFORM}:test-cover"
