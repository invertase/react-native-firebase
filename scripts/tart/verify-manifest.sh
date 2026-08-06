#!/usr/bin/env bash
# Compare baked manifests to golden-expected.json pins.
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

EXPECTED="${RNFB_TART_ROOT}/manifests/golden-expected.json"
BAKED="${RNFB_TART_ROOT}/manifests/golden-baked.json"
WARMED="${RNFB_TART_ROOT}/manifests/warmed-main.json"

errors=0

check_file() {
  local label="$1"
  local file="$2"
  if [[ ! -f "$file" ]]; then
    echo "MISSING ${label}: ${file}"
    errors=$((errors + 1))
    return
  fi
  echo "OK ${label}: ${file}"
}

check_file "golden-expected" "$EXPECTED"
check_file "golden-baked" "$BAKED"
check_file "warmed-main" "$WARMED"

if [[ -f "$BAKED" && -f "$EXPECTED" ]]; then
  python3 - <<PY
import json, sys

expected = json.load(open("${EXPECTED}"))
baked = json.load(open("${BAKED}"))
node_major = str(expected.get("node_major", ""))
node_ver = baked.get("node_version", "")
if node_major and f"v{node_major}." not in node_ver:
    print(f"WARN node: expected major {node_major}, got {node_ver}")
java = expected.get("java_version", "")
if java and java not in baked.get("java_version", ""):
    print(f"WARN java: expected {java}, got {baked.get('java_version')}")
seed = expected.get("tart_seed_image", "")
if seed and baked.get("seed_image") != seed:
    print(f"WARN seed_image: expected {seed}, got {baked.get('seed_image')}")
print("golden manifest fields checked")
PY
fi

if [[ -f "$WARMED" ]]; then
  python3 - <<PY
import json
w = json.load(open("${WARMED}"))
print(f"warmed main_commit={w.get('main_commit','')[:12]} build={w.get('build_mode')}")
print(f"  yarn.lock sha256={w.get('yarn_lock_sha256','')[:16]}…")
PY
fi

if (( errors > 0 )); then
  exit 1
fi

echo "[verify-manifest] done"
