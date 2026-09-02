#!/bin/bash
# Vanilla RN CLI iOS compile closer for GitHub #8883: workspace fixture
# test-rn-bare/ with SPM on, use_frameworks! :linkage => :dynamic, and
# prebuilt RNCore left at the RN 0.86 default (on).
#
# This is a different bug from two other RNCore issues tracked elsewhere
# in this repo -- do not "fix" this script by touching their owning docs:
#   - producer-side podspec Clang / xcconfig order:
#     okf-bundle/ios-rncore-podspec.md (GitHub #9200 / CPRN-237)
#   - link-time / tests/ only / third-party pods (react-native-device-info,
#     @invertase/react-native-apple-authentication):
#     okf-bundle/testing/test-app-dependency-pins.md (tests/ios/Podfile's
#     RCT_USE_PREBUILT_RNCORE=0 / RCT_USE_RN_DEP=0 pin)
#   - Expo documented-path link / duplicate Firebase symbols:
#     yarn test-expo:ios:link (GitHub #9158 / #9202)
#
# Historical #8883 compile signatures to stay past:
#   'React/RCTConvert.h' file not found
#   'React/RCTBridgeModule.h' file not found
#   'React/RCTEventEmitter.h' file not found
#   include of non-modular header / -Wnon-modular-include-in-framework-module
set -euo pipefail

cd "$(dirname "$0")/../../.."

log() {
  echo "[test-rn-bare-ios-build] $*"
}

POD_INSTALL_LOG="${RNFB_TEST_RN_BARE_POD_LOG:-/tmp/test-rn-bare-pod-install.log}"
XCODEBUILD_LOG="${RNFB_TEST_RN_BARE_XCODEBUILD_LOG:-/tmp/test-rn-bare-xcodebuild.log}"
PODFILE="test-rn-bare/ios/Podfile"
PBXPROJ="test-rn-bare/ios/testrnbare.xcodeproj/project.pbxproj"
PODFILE_LOCK="test-rn-bare/ios/Podfile.lock"
WORKSPACE="${RNFB_TEST_RN_BARE_WORKSPACE:-test-rn-bare/ios/testrnbare.xcworkspace}"
SCHEME="${RNFB_TEST_RN_BARE_SCHEME:-testrnbare}"

fail() {
  log "ERROR: $*"
  exit 1
}

assert_podfile_fail_closed() {
  log "--- Podfile fail-closed checks ---"
  if [[ ! -f "$PODFILE" ]]; then
    fail "missing ${PODFILE}"
  fi

  if grep -E -v '^[[:space:]]*#' "$PODFILE" | grep -E -q "ENV\[['\"]RCT_USE_PREBUILT_RNCORE['\"]\][[:space:]]*=[[:space:]]*['\"]0['\"]"; then
    fail "Podfile sets RCT_USE_PREBUILT_RNCORE=0 (tests/ Issue 2 pin, not this closer)"
  fi
  if grep -E -v '^[[:space:]]*#' "$PODFILE" | grep -E -q "ENV\[['\"]RCT_USE_RN_DEP['\"]\][[:space:]]*=[[:space:]]*['\"]0['\"]"; then
    fail "Podfile sets RCT_USE_RN_DEP=0 (tests/ Issue 2 pin, not this closer)"
  fi
  if grep -E -v '^[[:space:]]*#' "$PODFILE" | grep -q 'pre_install' && \
     grep -E -v '^[[:space:]]*#' "$PODFILE" | grep -q 'Pod::BuildType.static_library'; then
    fail "Podfile has a RNFB pre_install Pod::BuildType.static_library hook (the #8883 workaround, not the documented path)"
  fi
  if grep -E -v '^[[:space:]]*#' "$PODFILE" | grep -E -q 'RNFirebaseDisableSPM[[:space:]]*=[[:space:]]*true'; then
    fail "Podfile disables SPM (\$RNFirebaseDisableSPM = true); documented CLI path keeps SPM on"
  fi
  if ! grep -E -v '^[[:space:]]*#' "$PODFILE" | grep -q 'use_frameworks! :linkage => :dynamic'; then
    fail "Podfile is missing use_frameworks! :linkage => :dynamic"
  fi
  log "Podfile: prebuilt RNCore not forced off, no RNFB static pre_install, SPM + dynamic present"
}

assert_generated_graph() {
  log "--- generated graph checks ---"
  if ! grep -q 'React-Core-prebuilt' "$PODFILE_LOCK"; then
    fail "Podfile.lock has no React-Core-prebuilt (prebuilt RNCore is not on)"
  fi
  if ! grep -q 'Building from source: false' "$POD_INSTALL_LOG"; then
    fail "pod install log does not show 'Building from source: false' (prebuilt RNCore not engaged)"
  fi
  if ! grep -q 'Using SPM for Firebase dependency resolution' "$POD_INSTALL_LOG"; then
    fail "pod install log is missing 'Using SPM for Firebase dependency resolution'"
  fi
  if [[ -f "$PBXPROJ" ]] && grep -q 'packageProductDependencies' "$PBXPROJ"; then
    log "app pbxproj HAS packageProductDependencies (SPM products linked)"
  else
    log "app pbxproj packageProductDependencies not found (CocoaPods may keep them on the Pods project); SPM log line was present"
  fi
  log "generated graph: prebuilt RNCore on, Firebase SPM on"
}

assert_podfile_fail_closed

log "pod install (log: ${POD_INSTALL_LOG})"
(
  cd test-rn-bare/ios
  bundle exec pod install
) 2>&1 | tee "$POD_INSTALL_LOG"

if [[ ! -d "$WORKSPACE" ]]; then
  log "ERROR: expected workspace not found at ${WORKSPACE} -- listing test-rn-bare/ios/ for triage"
  ls -la test-rn-bare/ios || true
  exit 1
fi

assert_generated_graph

export SKIP_BUNDLING=1
export RCT_NO_LAUNCH_PACKAGER=1

HOST_ARCH="$(uname -m)"
log "xcodebuild build (iOS Simulator, unsigned, Release, arch=${HOST_ARCH}) (log: ${XCODEBUILD_LOG})"
xcodebuild_args=(
  ARCHS="${HOST_ARCH}"
  VALID_ARCHS="${HOST_ARCH}"
  ONLY_ACTIVE_ARCH=YES
  CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++
  -workspace "$WORKSPACE"
  -scheme "$SCHEME"
  -configuration Release
  -destination 'generic/platform=iOS Simulator'
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

log "--- compile/link diagnosis ---"
grep -n -E -m 80 "fatal error: 'React/RCT(Convert|BridgeModule|EventEmitter)\\.h' file not found|error: include of non-modular header|_OBJC_CLASS_\\\$_RCTEventEmitter|duplicate symbol '_FIRFirebaseVersion'" "$XCODEBUILD_LOG" || true
log "--- end compile/link diagnosis ---"

if [[ "$xcodebuild_status" -ne 0 ]]; then
  if grep -E -q "fatal error: 'React/RCT(Convert|BridgeModule|EventEmitter)\\.h' file not found" "$XCODEBUILD_LOG" ||
     grep -E -q "React/RCT(Convert|BridgeModule|EventEmitter)\\.h' file not found" "$XCODEBUILD_LOG"; then
    fail "#8883 compile signature remains (React/*.h file not found). inspect ${XCODEBUILD_LOG}"
  fi
  if grep -E -q 'error: include of non-modular header' "$XCODEBUILD_LOG"; then
    fail "#8883 compile signature remains (non-modular include). inspect ${XCODEBUILD_LOG}"
  fi
  if grep -q '_OBJC_CLASS_$_RCTEventEmitter' "$XCODEBUILD_LOG"; then
    fail "Issue 2 RCTEventEmitter link failure (device-info / apple-auth graph) is not this closer's proof. inspect ${XCODEBUILD_LOG}"
  fi
  if grep -q "duplicate symbol '_FIRFirebaseVersion'" "$XCODEBUILD_LOG"; then
    fail "Expo duplicate-Firebase signature is not this closer's proof. inspect ${XCODEBUILD_LOG}"
  fi
  if grep -E -q 'CompileC|CompileSwift|fatal error:| error:' "$XCODEBUILD_LOG"; then
    fail "xcodebuild failed during compilation; inspect ${XCODEBUILD_LOG}"
  fi
  fail "xcodebuild failed without a known #8883 compile signature; inspect ${XCODEBUILD_LOG}"
fi

if grep -E -q "fatal error: 'React/RCT(Convert|BridgeModule|EventEmitter)\\.h' file not found" "$XCODEBUILD_LOG" ||
   grep -E -q "React/RCT(Convert|BridgeModule|EventEmitter)\\.h' file not found" "$XCODEBUILD_LOG" ||
   grep -E -q 'error: include of non-modular header' "$XCODEBUILD_LOG"; then
  fail "xcodebuild passed but a #8883 compile signature remains in ${XCODEBUILD_LOG}"
fi
if grep -q '_OBJC_CLASS_$_RCTEventEmitter' "$XCODEBUILD_LOG"; then
  fail "xcodebuild passed but an Issue 2 RCTEventEmitter link signature remains; that is not this closer"
fi
if grep -q "duplicate symbol '_FIRFirebaseVersion'" "$XCODEBUILD_LOG"; then
  fail "xcodebuild passed but an Expo duplicate-Firebase signature remains; that is not this closer"
fi

log "PASS: vanilla RN CLI documented path compiles with prebuilt RNCore on, no RNFB static pre_install, SPM + dynamic, without #8883 compile signatures"
