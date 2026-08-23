#!/usr/bin/env bash
# Create dedicated iOS simulators for e2e slots 0..(count-1).
# Default count=1 (CI / typical developer). Pass 8 on a host that can sustain it.
# Serial unslotted runs keep using iPhone 17; slotted slot 0 uses RNFB E2E iOS slot-0.
set -euo pipefail

COUNT="${1:-1}"
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

if [[ "$COUNT" -lt 1 ]]; then
  echo "error: count must be >= 1 (got ${COUNT})" >&2
  exit 2
fi

for ((i = 0; i < COUNT; i++)); do
  name="RNFB E2E iOS slot-${i}"
  if xcrun simctl list devices available | grep -q "${name}"; then
    echo "[sim] ${name} exists"
    continue
  fi
  echo "[sim] creating ${name}"
  xcrun simctl create "$name" "$BASE_NAME" "$RUNTIME"
done

echo "[sim] done — slotted slots 0..$((COUNT - 1)) use RNFB E2E iOS slot-N; serial unslotted keeps ${BASE_NAME}"
