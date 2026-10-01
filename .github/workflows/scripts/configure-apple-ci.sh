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

# Capture xcodebuild -version to a var first. Piping directly into sed has crashed
# concurrent Apple CI jobs on Xcode 27 images with NSFileHandle Broken pipe (exit 134).
xcode_version_out=""
for _try in 1 2 3; do
  if xcode_version_out="$(xcodebuild -version 2>&1)"; then
    break
  fi
  log "xcodebuild -version failed (attempt ${_try}); retrying..."
  sleep 2
done
[[ -n "$xcode_version_out" ]] || fail "xcodebuild -version failed after retries"
echo "$xcode_version_out" | sed 's/^/[configure-apple-ci] /'

xcode_line="$(printf '%s\n' "$xcode_version_out" | head -1)"
dev_dir="$(xcode-select -p 2>/dev/null || true)"
if echo "$xcode_line" | grep -qiE 'beta'; then
  fail "refusing beta Xcode on Apple CI: ${xcode_line}"
fi
# GitHub's 27.0 image may still live under Xcode_*_Release_Candidate.app until GA; only refuse
# explicitly beta-suffixed installs (e.g. Xcode_27.1_beta.app selected via latest-stable).
if [[ "$dev_dir" == *_beta* ]]; then
  fail "refusing beta Xcode path on Apple CI: ${dev_dir}"
fi

# D6: pin the 27.0 line (latest-stable on xcode-27 images may float to 27.1 beta).
major_minor="$(sed -E 's/Xcode ([0-9]+\.[0-9]+).*/\1/' <<<"$xcode_line")"
[[ "$major_minor" == "27.0" ]] || fail "expected stable Xcode 27.0.x, got ${xcode_line} (path=${dev_dir})"
major="27"

if [[ "$require_runtime" == "1" ]]; then
  runtime_label="$(rnfb_ios_sim_runtime_label)"
  runtime_id="$(rnfb_resolve_ios_sim_runtime_identifier)"
  log "ios_sim_runtime label=${runtime_label} id=${runtime_id}"
fi

# GHA macOS runner sim availability workaround (runner-images#13459).
xcrun simctl list >/dev/null

log "PASS: Apple CI toolchain (Xcode ${major}, selector=${selector})"
