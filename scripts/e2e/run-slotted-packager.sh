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
# Launch in a new session (os.setsid() via exec-new-session.py)
# so yarn/metro is not in the agent shell’s process group — trap alone does
# not protect the Metro child. macOS has no setsid(1); do not use nohup as
# the detach mechanism (nohup stays in the agent PGID).
# Do not add a "reuse if already up" path — android/ios/macos Metros are never shared.
trap '' HUP

echo "[slotted-packager] active=${PLATFORM} slot${SLOT} listen=${RCT_METRO_PORT} RCT_METRO_PORT=${RCT_METRO_PORT} RNFB_ANDROID_METRO_PORT=${RNFB_ANDROID_METRO_PORT:-} RNFB_IOS_METRO_PORT=${RNFB_IOS_METRO_PORT:-} RNFB_MACOS_METRO_PORT=${RNFB_MACOS_METRO_PORT:-} macosProduct=${RNFB_MACOS_PRODUCT_NAME:-} cache=${TMPDIR}"
cd "$REPO_ROOT"

if [[ "$PLATFORM" == "macos" ]]; then
  PACKAGER_YARN=(yarn tests:macos:packager:jet-reset-cache)
else
  PACKAGER_YARN=(yarn tests:packager:jet-reset-cache)
fi

# Parent waits (stdout stays on this fd for tee); child: os.setsid() then exec yarn.
# setsid -w equivalent via scripts/e2e/lib/exec-new-session.py (macOS has no setsid(1)).
exec python3 "${SCRIPT_DIR}/lib/exec-new-session.py" "${PACKAGER_YARN[@]}"
