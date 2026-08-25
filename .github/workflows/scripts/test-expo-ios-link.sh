#!/bin/bash
# Documented-path Expo iOS *link* closer for GitHub #9158: a minimal Expo
# SDK 57 fixture (test-expo/) with SPM on, useFrameworks: "dynamic",
# prebuilt RNCore on (no RCT_USE_PREBUILT_RNCORE=0, no disableSPM, no
# forceStaticLinking, no buildReactNativeFromSource). Must finish green
# past undefined `_OBJC_CLASS_$_FIRApp` (missing app-target FirebaseCore).
#
# This is a *different* bug from two other RNCore issues tracked elsewhere
# in this repo -- do not "fix" this script by touching their owning docs:
#   - compile-time / RNFB podspecs / non-modular includes:
#     okf-bundle/ios-rncore-podspec.md (GitHub #9200 / CPRN-237)
#   - link-time / tests/ only / third-party pods (react-native-device-info,
#     @invertase/react-native-apple-authentication):
#     okf-bundle/testing/test-app-dependency-pins.md (tests/ios/Podfile's
#     RCT_USE_PREBUILT_RNCORE=0 / RCT_USE_RN_DEP=0 pin)
#   - duplicate `_FIRFirebaseVersion` after FIRApp resolves:
#     GitHub #9202 / CPRN-321 (out of scope until past FIRApp)
#
# Historical #9158 signature to stay past: undefined `_OBJC_CLASS_$_FIRApp`
# (and/or missing app-target FirebaseCore / packageProductDependencies) --
# not a compile error, not "undefined RCTEventEmitter", not #9202 duplicate
# `_FIRFirebaseVersion`.
set -euo pipefail

cd "$(dirname "$0")/../../.."
cd test-expo

log() {
  echo "[test-expo-ios-link] $*"
}

PREBUILD_LOG="${RNFB_TEST_EXPO_PREBUILD_LOG:-/tmp/test-expo-prebuild.log}"
XCODEBUILD_LOG="${RNFB_TEST_EXPO_XCODEBUILD_LOG:-/tmp/test-expo-xcodebuild.log}"
PBXPROJ="ios/testexpo.xcodeproj/project.pbxproj"

# Expo silences `pod install` stdout unless EXPO_DEBUG or CI is set
# (see @expo/cli cocoapods.js `silent: !(EXPO_DEBUG || CI)`). Keep the
# documented `expo prebuild` command; un-silence CocoaPods so we can see
# whether firebase_spm.rb / rnfirebase_add_spm_core_to_app_target ran.
log "expo prebuild --platform ios --clean (log: ${PREBUILD_LOG})"
set -o pipefail
EXPO_DEBUG=1 npx expo prebuild --platform ios --clean 2>&1 | tee "$PREBUILD_LOG"

WORKSPACE="${RNFB_TEST_EXPO_WORKSPACE:-ios/testexpo.xcworkspace}"
SCHEME="${RNFB_TEST_EXPO_SCHEME:-testexpo}"

if [[ ! -d "$WORKSPACE" ]]; then
  log "ERROR: expected workspace not found at ${WORKSPACE} -- listing ios/ for triage"
  ls -la ios || true
  exit 1
fi

# Diagnosis: did #9164's rnfirebase_add_spm_core_to_app_target run during
# Expo CNG `pod install`, and did the resulting pbxproj keep FirebaseCore on
# the app target? Do not "fix" a wipe by hand-editing pbxproj or adding a
# custom Podfile post_integrate -- that is not the documented Expo path.
log "--- SPM helper / pbxproj diagnosis ---"
if grep -E '\[react-native-firebase\]' "$PREBUILD_LOG" >/dev/null 2>&1; then
  log "pod/prebuild lines matching [react-native-firebase]:"
  grep -E '\[react-native-firebase\]' "$PREBUILD_LOG" || true
else
  log "NO [react-native-firebase] lines in prebuild log (firebase_spm.rb may not have evaluated)"
fi
if grep -E 'Linking FirebaseCore|Repairing FirebaseCore|Couldn.t link FirebaseCore|Couldn.t hook CocoaPods|SPM not available|SPM disabled' "$PREBUILD_LOG" >/dev/null 2>&1; then
  log "helper-specific lines:"
  grep -E 'Linking FirebaseCore|Repairing FirebaseCore|Couldn.t link FirebaseCore|Couldn.t hook CocoaPods|SPM not available|SPM disabled|Using SPM' "$PREBUILD_LOG" || true
else
  log "NO rnfirebase_add_spm_core_to_app_target success/warn lines in prebuild log"
fi
if [[ -f "$PBXPROJ" ]]; then
  if grep -q 'packageProductDependencies' "$PBXPROJ"; then
    log "pbxproj HAS packageProductDependencies"
    grep -n 'packageProductDependencies\|XCSwiftPackageProductDependency\|productName = FirebaseCore\|XCRemoteSwiftPackageReference' "$PBXPROJ" | head -80 || true
  else
    log "pbxproj HAS NO packageProductDependencies (helper did not stick, or never ran)"
  fi
  if grep -q '\[CP\] Embed Pods Frameworks' "$PBXPROJ"; then
    log "pbxproj HAS [CP] Embed Pods Frameworks (helper target filter)"
  else
    log "pbxproj HAS NO [CP] Embed Pods Frameworks -- helper would skip every native target"
  fi
  if grep -q '\[RNFB\] Embed Firebase SPM Frameworks' "$PBXPROJ"; then
    log "pbxproj HAS [RNFB] Embed Firebase SPM Frameworks (post_integrate hook did mutate app project)"
  else
    log "pbxproj HAS NO [RNFB] Embed Firebase SPM Frameworks"
  fi
  if grep -E 'FirebaseCore.*PBXBuildFile|productName = FirebaseCore' "$PBXPROJ" >/dev/null 2>&1; then
    log "pbxproj HAS FirebaseCore productName / PBXBuildFile hits:"
    grep -n 'productName = FirebaseCore\|FirebaseCore.framework in Frameworks' "$PBXPROJ" | head -40 || true
  else
    log "pbxproj HAS NO FirebaseCore PBXBuildFile / productName (app target never got FirebaseCore)"
  fi
else
  log "ERROR: missing ${PBXPROJ}"
fi
log "--- end diagnosis ---"

export SKIP_BUNDLING=1
export RCT_NO_LAUNCH_PACKAGER=1

# Keep Release as the documented-path closer. Debug historically surfaces
# undefined `_OBJC_CLASS_$_FIRApp` from AppDelegate.o (the #9158 signature)
# while Release can later hit #9202 duplicate `_FIRFirebaseVersion` once
# FIRApp resolves -- do not treat #9202 as this fixture's expected red.
# Prefer a simulator destination over bare -sdk iphonesimulator so xcodebuild
# does not default to a foreign arch (x86_64 on Apple Silicon).
HOST_ARCH="$(uname -m)"
log "xcodebuild build (iOS Simulator, unsigned, Release, arch=${HOST_ARCH}) (log: ${XCODEBUILD_LOG})"
set -o pipefail
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
if command -v xcbeautify >/dev/null 2>&1; then
  xcodebuild "${xcodebuild_args[@]}" 2>&1 | tee "$XCODEBUILD_LOG" | xcbeautify
else
  xcodebuild "${xcodebuild_args[@]}" 2>&1 | tee "$XCODEBUILD_LOG"
fi
