#!/bin/bash
# Builds a fresh React Native CLI app in SwiftPM mode (no Podfile) with every
# RNFB package that declares a SwiftPM autolinking plugin, installed from this
# checkout. Proves `spm add` / `spm sync` run the @react-native-firebase/app
# plugin and that the result compiles (Debug, iOS Simulator).
#
# Runs locally too. Needs root `yarn` (or `yarn lerna:prepare`) first, which
# builds packages/app/spm/build.
#
# Environment (all optional):
#   RNFB_TEST_RN_SWIFTPM_REPO_ROOT     checkout to install from (default: this one)
#   RNFB_TEST_RN_SWIFTPM_WORK_DIR      app and logs (default: /tmp/test-rn-swiftpm)
#   RNFB_TEST_RN_SWIFTPM_DERIVED_DATA  xcodebuild DerivedData (default: <work dir>/DerivedData)
set -euo pipefail

RN_VERSION=0.88.1
RN_CLI_VERSION=20.2.0
APP_NAME=RnfbSpm

REPO_ROOT="${RNFB_TEST_RN_SWIFTPM_REPO_ROOT:-$(cd "$(dirname "$0")/../../.." && pwd)}"
WORK_DIR="${RNFB_TEST_RN_SWIFTPM_WORK_DIR:-/tmp/test-rn-swiftpm}"
DERIVED_DATA="${RNFB_TEST_RN_SWIFTPM_DERIVED_DATA:-${WORK_DIR}/DerivedData}"
APP_DIR="${WORK_DIR}/${APP_NAME}"
XCODEBUILD_LOG="${WORK_DIR}/xcodebuild.log"
PACKAGE_SWIFT_REL="ios/build/generated/autolinking/ReactNativeFirebase/Package.swift"
PBXPROJ_REL="ios/${APP_NAME}.xcodeproj/project.pbxproj"
REQUIRED_SCRIPT_PHASES=("[RNFB] Core Configuration" "[RNFB] Crashlytics Configuration")

log() {
  echo "[test-rn-swiftpm-ios-build] $*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

[[ -f "${REPO_ROOT}/packages/app/spm/build/index.js" ]] ||
  fail "packages/app/spm/build/index.js is missing in ${REPO_ROOT}; run root \`yarn\` (or \`yarn lerna:prepare\`) first"

# Every package that declares swiftpmConfig.autolinkingPlugin, so a new iOS
# package is covered without editing this script.
package_specs=()
while IFS= read -r package_dir; do
  package_specs+=("file:${package_dir}")
done < <(
  node -e '
    const fs = require("fs");
    const path = require("path");
    const packagesDir = path.join(process.argv[1], "packages");
    for (const name of fs.readdirSync(packagesDir).sort()) {
      const manifest = path.join(packagesDir, name, "package.json");
      if (!fs.existsSync(manifest)) continue;
      if (JSON.parse(fs.readFileSync(manifest, "utf8")).swiftpmConfig?.autolinkingPlugin) {
        console.log(path.join(packagesDir, name));
      }
    }
  ' "$REPO_ROOT"
)
[[ ${#package_specs[@]} -gt 0 ]] || fail "no package under ${REPO_ROOT}/packages declares swiftpmConfig.autolinkingPlugin"
log "RNFB packages with a SwiftPM autolinking plugin: ${#package_specs[@]}"

mkdir -p "$WORK_DIR"
rm -rf "$APP_DIR"

log "creating React Native ${RN_VERSION} app at ${APP_DIR}"
# Run from the work dir so package-manager config in the checkout does not apply.
(
  cd "$WORK_DIR"
  npx --yes "@react-native-community/cli@${RN_CLI_VERSION}" init "$APP_NAME" \
    --version "$RN_VERSION" \
    --directory "$APP_DIR" \
    --skip-git-init \
    --install-pods false
)

cd "$APP_DIR"

# --install-links packs each package like a registry install (no symlink into
# the monorepo). --ignore-scripts: package prepare scripts need the monorepo's
# dev dependencies and fail inside the app; the checkout is already prepared.
log "installing RNFB packages from ${REPO_ROOT}"
npm install --install-links --ignore-scripts "${package_specs[@]}"

log "converting to SwiftPM mode"
npx react-native spm add --yes --deintegrate
log "re-running spm sync"
npx react-native spm sync

[[ -f "$PACKAGE_SWIFT_REL" ]] ||
  fail "spm sync did not write ${PACKAGE_SWIFT_REL}; the @react-native-firebase/app autolinking plugin did not run"
for phase in "${REQUIRED_SCRIPT_PHASES[@]}"; do
  grep -Fq "$phase" "$PBXPROJ_REL" ||
    fail "${PBXPROJ_REL} has no '${phase}' script phase; spm sync did not apply the plugin's script phases"
done
log "sync wrote ReactNativeFirebase/Package.swift and the RNFB script phases"

export SKIP_BUNDLING=1
export RCT_NO_LAUNCH_PACKAGER=1

HOST_ARCH="$(uname -m)"
log "xcodebuild build (Debug, iOS Simulator, arch=${HOST_ARCH}) (log: ${XCODEBUILD_LOG})"
xcodebuild_args=(
  -project "${APP_DIR}/ios/${APP_NAME}.xcodeproj"
  -scheme "$APP_NAME"
  -configuration Debug
  -destination 'generic/platform=iOS Simulator'
  -derivedDataPath "$DERIVED_DATA"
  ARCHS="$HOST_ARCH"
  ONLY_ACTIVE_ARCH=YES
  CODE_SIGNING_ALLOWED=NO
  build
)
set +e
if command -v xcbeautify >/dev/null 2>&1; then
  xcodebuild "${xcodebuild_args[@]}" 2>&1 | tee "$XCODEBUILD_LOG" | xcbeautify
else
  xcodebuild "${xcodebuild_args[@]}" 2>&1 | tee "$XCODEBUILD_LOG"
fi
xcodebuild_status=${PIPESTATUS[0]}
set -e

if [[ "$xcodebuild_status" -ne 0 ]]; then
  first_error="$(grep -E -m 1 'error:' "$XCODEBUILD_LOG" || true)"
  fail "xcodebuild failed (exit ${xcodebuild_status}): ${first_error:-no error line}. Full log: ${XCODEBUILD_LOG}"
fi

log "PASS: React Native ${RN_VERSION} SwiftPM-mode app with ${#package_specs[@]} RNFB packages builds (Debug, iOS Simulator)"
