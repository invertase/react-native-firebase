#!/usr/bin/env bash
# Apple CI toolchain gate (D6): latest-stable must resolve to stable Xcode major 27
# and, when required, an available iOS 27 simulator runtime matching RNFB_IOS_SIM_RUNTIME.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
# shellcheck source=../../../scripts/e2e/lib/ios-simulator-helpers.sh
source "${REPO_ROOT}/scripts/e2e/lib/ios-simulator-helpers.sh"

log() {
  echo "[configure-apple-ci] $*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

require_runtime="${RNFB_CI_REQUIRE_IOS_SIM_RUNTIME:-1}"
selector="${RNFB_CI_XCODE_SELECTOR:-${XCODE_VERSION:-latest-stable}}"

log "selector=${selector} require_ios_sim_runtime=${require_runtime}"

xcodebuild -version | sed 's/^/[configure-apple-ci] /'

xcode_line="$(xcodebuild -version | head -1)"
if echo "$xcode_line" | grep -qi beta; then
  fail "refusing beta Xcode on Apple CI: ${xcode_line}"
fi

major="$(sed -E 's/Xcode ([0-9]+).*/\1/' <<<"$xcode_line")"
[[ "$major" == "27" ]] || fail "expected stable Xcode major 27, got major=${major} (${xcode_line})"

if [[ "$require_runtime" == "1" ]]; then
  runtime_label="$(rnfb_ios_sim_runtime_label)"
  runtime_id="$(rnfb_resolve_ios_sim_runtime_identifier)"
  log "ios_sim_runtime label=${runtime_label} id=${runtime_id}"
fi

# GHA macOS runner sim availability workaround (runner-images#13459).
xcrun simctl list >/dev/null

log "PASS: Apple CI toolchain (Xcode ${major}, selector=${selector})"
