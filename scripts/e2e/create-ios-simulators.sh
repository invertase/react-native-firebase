#!/usr/bin/env bash
# Create dedicated iOS simulators for e2e slots 1–4 (slot 0 uses default iPhone 17).
set -euo pipefail

COUNT="${1:-4}"
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

for i in $(seq 1 "$COUNT"); do
  name="RNFB E2E iOS slot-${i}"
  if xcrun simctl list devices available | grep -q "${name}"; then
    echo "[sim] ${name} exists"
    continue
  fi
  echo "[sim] creating ${name}"
  xcrun simctl create "$name" "$BASE_NAME" "$RUNTIME"
done

echo "[sim] done"
