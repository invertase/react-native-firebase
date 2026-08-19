#!/usr/bin/env bash
# Start Metro for a slotted platform with full multi-platform port carry-in.
# Usage: bash scripts/e2e/run-slotted-packager.sh <android|ios|macos> <slot>
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=lib/e2e-slot-env.sh
source "${SCRIPT_DIR}/lib/e2e-slot-env.sh"

PLATFORM="${1:?platform required: android|ios|macos}"
SLOT="${2:?slot required: non-negative integer}"

e2e_slot_env_apply "$PLATFORM" "$SLOT"

CACHE_DIR="/tmp/rnfb-metrocache-${PLATFORM}-slot${SLOT}"
mkdir -p "$CACHE_DIR"
export TMPDIR="$CACHE_DIR"

# Ignore SIGHUP so Metro keeps running after the agent starter shell exits.
# Do not add a "reuse if already up" path — android/ios/macos Metros are never shared.
trap '' HUP

echo "[slotted-packager] active=${PLATFORM} slot${SLOT} listen=${RCT_METRO_PORT} RCT_METRO_PORT=${RCT_METRO_PORT} RNFB_ANDROID_METRO_PORT=${RNFB_ANDROID_METRO_PORT:-} RNFB_IOS_METRO_PORT=${RNFB_IOS_METRO_PORT:-} RNFB_MACOS_METRO_PORT=${RNFB_MACOS_METRO_PORT:-} macosProduct=${RNFB_MACOS_PRODUCT_NAME:-} cache=${TMPDIR}"
cd "$REPO_ROOT"
if [[ "$PLATFORM" == "macos" ]]; then
  exec yarn tests:macos:packager:jet-reset-cache
fi
exec yarn tests:packager:jet-reset-cache
