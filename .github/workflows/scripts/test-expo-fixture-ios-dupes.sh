#!/bin/bash
# Builds a generated blank Expo app (app + the requested RNFB modules) the same
# way test-expo-ios-link.sh builds test-expo, then runs the shared duplicate
# Objective-C class scan on it. Isolates which RNFB module combination
# duplicates a class, which the all-modules test-expo graph cannot show.
#
# Usage: test-expo-fixture-ios-dupes.sh --modules messaging[,analytics...]
#          [--expect-duplicates N | --report-only]
#
# --modules is required; --modules "" builds app only.
#
# --expect-duplicates N asserts an exact duplicate count instead of zero, for
# control runs against a graph that is known to duplicate classes.
# --report-only lists duplicates and the GULNetwork/FIRApp owners without
# failing on them; scan guards still apply.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SCRIPTS="${REPO_ROOT}/.github/workflows/scripts"
# shellcheck source=lib/derived-data-path.sh
source "${SCRIPTS}/lib/derived-data-path.sh"

log() {
  echo "[test-expo-fixture-ios-dupes] $*"
}

usage_error() {
  log "ERROR: $*"
  log "usage: $0 --modules <m>[,<m>...] [--expect-duplicates N | --report-only]"
  exit 2
}

MODULES=""
MODULES_SET=0
REPORT_ONLY=0
scan_mode_args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --modules)
      [[ $# -ge 2 ]] || usage_error "$1 needs a value"
      MODULES="$2"
      MODULES_SET=1
      shift 2
      ;;
    --expect-duplicates)
      [[ $# -ge 2 ]] || usage_error "$1 needs a value"
      [[ "$2" =~ ^(0|[1-9][0-9]*)$ ]] || usage_error "--expect-duplicates must be a non-negative integer, got '$2'"
      [[ "$REPORT_ONLY" -eq 0 ]] || usage_error "--report-only and --expect-duplicates are mutually exclusive"
      scan_mode_args=(--expect-duplicates "$2")
      shift 2
      ;;
    --report-only)
      [[ "${#scan_mode_args[@]}" -eq 0 || "$REPORT_ONLY" -eq 1 ]] || usage_error "--report-only and --expect-duplicates are mutually exclusive"
      REPORT_ONLY=1
      scan_mode_args=(--report-only)
      shift
      ;;
    *)
      usage_error "unknown argument: $1"
      ;;
  esac
done

[[ "$MODULES_SET" -eq 1 ]] || usage_error "--modules is required (use --modules \"\" for app only)"
checked_modules="$(bash "${SCRIPTS}/lib/make-expo-fixture.sh" --modules "$MODULES" --check-modules)" ||
  usage_error "invalid --modules '${MODULES}'"
suffix="${checked_modules// /-}"
suffix="${suffix:-app}"

FIXTURE_DIR="${REPO_ROOT}/test-expo/.fixtures/${suffix}"
DERIVED_DATA="$(wipeable_derived_data_path "${RNFB_TEST_EXPO_FIXTURE_DERIVED_DATA-/tmp/test-expo-fixture-derived-data-${suffix}}" "$REPO_ROOT")" || exit 2
PREBUILD_LOG="${RNFB_TEST_EXPO_FIXTURE_PREBUILD_LOG:-/tmp/test-expo-fixture-${suffix}-prebuild.log}"
XCODEBUILD_LOG="${RNFB_TEST_EXPO_FIXTURE_XCODEBUILD_LOG:-/tmp/test-expo-fixture-${suffix}-xcodebuild.log}"
SCHEME="rnfbfixture"

rm -rf "$FIXTURE_DIR"
bash "${SCRIPTS}/lib/make-expo-fixture.sh" --modules "$MODULES" --out "$FIXTURE_DIR"
cd "$FIXTURE_DIR"

# Expo silences `pod install` unless EXPO_DEBUG or CI is set.
log "expo prebuild --platform ios --clean (log: ${PREBUILD_LOG})"
set +e
EXPO_DEBUG=1 npx expo prebuild --platform ios --clean 2>&1 | tee "$PREBUILD_LOG"
prebuild_status=${PIPESTATUS[0]}
set -e
if [[ "$prebuild_status" -ne 0 ]]; then
  log "ERROR: expo prebuild failed (exit ${prebuild_status}); inspect ${PREBUILD_LOG}"
  exit "$prebuild_status"
fi

WORKSPACE="ios/${SCHEME}.xcworkspace"
if [[ ! -d "$WORKSPACE" ]]; then
  log "ERROR: expected workspace not found at ${WORKSPACE}"
  ls -la ios || true
  exit 1
fi

export SKIP_BUNDLING=1
export RCT_NO_LAUNCH_PACKAGER=1

# A reused DerivedData can embed frameworks from an earlier graph, so every
# build starts empty.
rm -rf "$DERIVED_DATA"
HOST_ARCH="$(uname -m)"
log "xcodebuild build (iOS Simulator, unsigned, Release, arch=${HOST_ARCH}, DerivedData=${DERIVED_DATA}) (log: ${XCODEBUILD_LOG})"
xcodebuild_args=(
  ARCHS="${HOST_ARCH}"
  VALID_ARCHS="${HOST_ARCH}"
  ONLY_ACTIVE_ARCH=YES
  CC=clang CPLUSPLUS=clang++
  -workspace "$WORKSPACE"
  -scheme "$SCHEME"
  -configuration Release
  -destination 'generic/platform=iOS Simulator'
  -derivedDataPath "$DERIVED_DATA"
  CODE_SIGNING_ALLOWED=NO
  CODE_SIGNING_REQUIRED=NO
  CODE_SIGN_IDENTITY=""
  build
)
set +e
if command -v xcbeautify >/dev/null 2>&1; then
  xcodebuild "${xcodebuild_args[@]}" 2>&1 | tee "$XCODEBUILD_LOG" | xcbeautify
  xcodebuild_status=${PIPESTATUS[0]}
else
  xcodebuild "${xcodebuild_args[@]}" 2>&1 | tee "$XCODEBUILD_LOG"
  xcodebuild_status=${PIPESTATUS[0]}
fi
set -e
if [[ "$xcodebuild_status" -ne 0 ]]; then
  log "ERROR: xcodebuild failed (exit ${xcodebuild_status}); inspect ${XCODEBUILD_LOG}"
  exit "$xcodebuild_status"
fi

bash "${SCRIPTS}/lib/duplicate-objc-class-scan.sh" \
  "${DERIVED_DATA}/Build/Products/Release-iphonesimulator/${SCHEME}.app" \
  test-expo-fixture-ios-dupes \
  ${scan_mode_args[@]+"${scan_mode_args[@]}"}
