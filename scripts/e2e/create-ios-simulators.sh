#!/usr/bin/env bash
# Create dedicated iOS simulators for e2e slots 0..(count-1).
# Default count=1 (CI / typical developer). Pass 8 on a host that can sustain it.
# Serial unslotted runs keep using iPhone 17; slotted slot 0 uses RNFB E2E iOS slot-0.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/ios-simulator-helpers.sh
source "${SCRIPT_DIR}/lib/ios-simulator-helpers.sh"

COUNT="${1:-1}"
BASE_NAME="${RNFB_IOS_BASE_SIMULATOR:-iPhone 17}"
RUNTIME="$(rnfb_resolve_ios_sim_runtime_identifier)"

if [[ "$COUNT" -lt 1 ]]; then
  echo "error: count must be >= 1 (got ${COUNT})" >&2
  exit 2
fi

for ((i = 0; i < COUNT; i++)); do
  name="RNFB E2E iOS slot-${i}"
  if udid="$(rnfb_resolve_ios_sim_udid_for_name "$name" 2>/dev/null)"; then
    echo "[sim] ${name} exists udid=${udid}"
    continue
  fi
  echo "[sim] creating ${name} on runtime ${RUNTIME}"
  udid="$(xcrun simctl create "$name" "$BASE_NAME" "$RUNTIME")"
  echo "[sim] ${name} udid=${udid}"
done

echo "[sim] done — slotted slots 0..$((COUNT - 1)) use RNFB E2E iOS slot-N on $(rnfb_ios_sim_runtime_label); serial unslotted keeps ${BASE_NAME}"
