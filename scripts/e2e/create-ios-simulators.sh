#!/usr/bin/env bash
# Create dedicated iOS simulators for e2e slots 0..(count-1).
# Default count=1 (CI / typical developer). Pass 8 on a host that can sustain it.
# Serial unslotted runs keep using iPhone 17; slotted slot 0 uses RN E2E iOS slot-0.
# Setup is create-only: it never erases, renames, or deletes existing simulators.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/e2e-slot-env.sh
source "${SCRIPT_DIR}/lib/e2e-slot-env.sh"

COUNT="${1:-1}"
e2e_validate_slot_count "$COUNT"

BASE_NAME="${RNFB_IOS_BASE_SIMULATOR:-iPhone 17}"
RUNTIME=$(xcrun simctl list runtimes available -j | node -e "
  const j=JSON.parse(require('fs').readFileSync(0,'utf8'));
  const compareVersions = (a, b) => {
    const av = a.split('.').map(Number);
    const bv = b.split('.').map(Number);
    for (let i = 0; i < Math.max(av.length, bv.length); i++) {
      const an = av[i] || 0;
      const bn = bv[i] || 0;
      if (an !== bn) return bn - an;
    }
    return 0;
  };
  const ios=j.runtimes.filter(r=>r.isAvailable&&r.platform==='iOS').sort((a,b)=>compareVersions(a.version, b.version));
  if(!ios.length) process.exit(1);
  console.log(ios[0].identifier);
")

DEVICES_JSON=$(xcrun simctl list devices available -j)

for ((i = 0; i < COUNT; i++)); do
  name="RN E2E iOS slot-${i}"
  if printf '%s' "$DEVICES_JSON" | node -e "
    const target = process.argv[1];
    const input = require('fs').readFileSync(0, 'utf8');
    const devices = Object.values(JSON.parse(input).devices || {}).flat();
    process.exit(devices.some(device => device.name === target && device.isAvailable !== false) ? 0 : 1);
  " "$name"; then
    echo "[sim] ${name} exists"
    continue
  fi
  echo "[sim] creating ${name}"
  xcrun simctl create "$name" "$BASE_NAME" "$RUNTIME"
done

echo "[sim] done — slotted slots 0..$((COUNT - 1)) use RN E2E iOS slot-N; serial unslotted keeps ${BASE_NAME}"
