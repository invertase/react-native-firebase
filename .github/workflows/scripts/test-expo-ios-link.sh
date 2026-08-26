#!/bin/bash
# Documented-path Expo iOS *link* closer for GitHub #9158 and #9202: a
# minimal Expo SDK 57 fixture (test-expo/) with SPM on, useFrameworks: "dynamic",
# prebuilt RNCore on (no RCT_USE_PREBUILT_RNCORE=0, no disableSPM, no
# forceStaticLinking, no buildReactNativeFromSource). The fixture first
# covered the missing app-target FirebaseCore link; it now also locks the
# duplicate-Firebase-symbol graph emitted by Expo's prebuilt-RNCore path.
#
# This is a *different* bug from two other RNCore issues tracked elsewhere
# in this repo -- do not "fix" this script by touching their owning docs:
#   - compile-time / RNFB podspecs / non-modular includes:
#     okf-bundle/ios-rncore-podspec.md (GitHub #9200 / CPRN-237)
#   - link-time / tests/ only / third-party pods (react-native-device-info,
#     @invertase/react-native-apple-authentication):
#     okf-bundle/testing/test-app-dependency-pins.md (tests/ios/Podfile's
#     RCT_USE_PREBUILT_RNCORE=0 / RCT_USE_RN_DEP=0 pin)
# Historical #9158 signature to stay past: undefined `_OBJC_CLASS_$_FIRApp`
# (and/or missing app-target FirebaseCore / packageProductDependencies).
# Regression #9202 signature: duplicate `_FIRFirebaseVersion` from both
# libRNFBApp.a(FirebaseCore.o) and libRNFBMessaging.a(FirebaseCore.o). The
# green graph must produce RNFB frameworks and link them with `-framework`.
set -euo pipefail

cd "$(dirname "$0")/../../.."
cd test-expo

log() {
  echo "[test-expo-ios-link] $*"
}

PREBUILD_LOG="${RNFB_TEST_EXPO_PREBUILD_LOG:-/tmp/test-expo-prebuild.log}"
XCODEBUILD_LOG="${RNFB_TEST_EXPO_XCODEBUILD_LOG:-/tmp/test-expo-xcodebuild.log}"
PBXPROJ="ios/testexpo.xcodeproj/project.pbxproj"
PODS_PBXPROJ="ios/Pods/Pods.xcodeproj/project.pbxproj"
PODS_XCCONFIG="ios/Pods/Target Support Files/Pods-testexpo/Pods-testexpo.release.xcconfig"
PODFILE="ios/Podfile"

# Expo silences `pod install` stdout unless EXPO_DEBUG or CI is set
# (see @expo/cli cocoapods.js `silent: !(EXPO_DEBUG || CI)`). Keep the
# documented `expo prebuild` command; un-silence CocoaPods so we can see
# whether firebase_spm.rb / rnfirebase_add_spm_core_to_app_target ran.
log "expo prebuild --platform ios --clean (log: ${PREBUILD_LOG})"
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

log "--- generated linkage diagnosis ---"
if [[ -f "$PODFILE" ]]; then
  log "Podfile linkage / prebuilt-RNCore settings:"
  grep -n -E 'use_frameworks|RCT_USE_PREBUILT_RNCORE|buildReactNativeFromSource|RNFirebaseDisableSPM|forceStaticLinking' "$PODFILE" || true
fi
if grep -E -i 'downgrad|prebuilt|build type|static librar|RNFB(App|Messaging)' "$PREBUILD_LOG" >/dev/null 2>&1; then
  log "Expo/CocoaPods prebuilt and build-type lines:"
  grep -n -E -i -m 120 'downgrad|prebuilt|build type|static librar|RNFB(App|Messaging)' "$PREBUILD_LOG" || true
else
  log "NO Expo/CocoaPods downgrade or RNFB build-type lines in prebuild log"
fi
if [[ -f "$PODS_PBXPROJ" ]]; then
  log "Pods product references / product types for RNFBApp and RNFBMessaging:"
  grep -n -E -m 120 'RNFB(App|Messaging)|productType = "com.apple.product-type.(framework|library.static)"' "$PODS_PBXPROJ" || true
else
  log "ERROR: missing ${PODS_PBXPROJ}"
fi
if [[ -f "$PODS_XCCONFIG" ]]; then
  log "app target CocoaPods link inputs:"
  grep -n -E -m 20 'OTHER_LDFLAGS|RNFB(App|Messaging)' "$PODS_XCCONFIG" || true
else
  log "ERROR: missing ${PODS_XCCONFIG}"
fi
log "--- end generated linkage diagnosis ---"

pod_target_product_type() {
  local target_name="$1"
  awk -v target_name="$target_name" '
    /\/\* Begin PBXNativeTarget section \*\// { in_native_targets = 1; next }
    /\/\* End PBXNativeTarget section \*\// { in_native_targets = 0 }
    in_native_targets && $0 ~ "/\\* " target_name " \\*/ = \\{" { in_target = 1 }
    in_target && /productType = / {
      value = $0
      sub(/^.*productType = /, "", value)
      sub(/;.*$/, "", value)
      gsub(/"/, "", value)
      print value
      exit
    }
    in_target && /^[[:space:]]*};[[:space:]]*$/ { in_target = 0 }
  ' "$PODS_PBXPROJ"
}

for rnfb_target in RNFBApp RNFBMessaging; do
  product_type="$(pod_target_product_type "$rnfb_target")"
  if [[ "$product_type" != "com.apple.product-type.framework" ]]; then
    log "ERROR: ${rnfb_target} generated with wrong product type '${product_type:-missing}' (expected dynamic framework)"
    exit 1
  fi
  if ! grep -E -q "/\\* ${rnfb_target} \\*/ = \\{isa = PBXFileReference; explicitFileType = wrapper\\.framework;.*path = ${rnfb_target}\\.framework;" "$PODS_PBXPROJ"; then
    log "ERROR: ${rnfb_target} framework product reference is missing from Pods.xcodeproj"
    exit 1
  fi
done

app_ldflags="$(grep '^OTHER_LDFLAGS = ' "$PODS_XCCONFIG" || true)"
for rnfb_target in RNFBApp RNFBMessaging; do
  if grep -Fq -- "-l\"${rnfb_target}\"" <<<"$app_ldflags"; then
    log "ERROR: app link inputs still use static library -l\"${rnfb_target}\""
    exit 1
  fi
  if ! grep -Fq -- "-framework \"${rnfb_target}\"" <<<"$app_ldflags"; then
    log "ERROR: app link inputs are missing -framework \"${rnfb_target}\""
    exit 1
  fi
done
log "generated RNFB products/link inputs are dynamic frameworks"

export SKIP_BUNDLING=1
export RCT_NO_LAUNCH_PACKAGER=1

# Keep Release as the documented-path closer. Debug historically surfaces
# undefined `_OBJC_CLASS_$_FIRApp` from AppDelegate.o (the #9158 signature);
# Release reaches the #9202 duplicate `_FIRFirebaseVersion` graph.
# Prefer a simulator destination over bare -sdk iphonesimulator so xcodebuild
# does not default to a foreign arch (x86_64 on Apple Silicon).
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

log "--- app link-result diagnosis ---"
grep -n -E -m 120 'libRNFB(App|Messaging)\.a|RNFB(App|Messaging)\.framework|_FIRFirebaseVersion|FirebaseCore\.o' "$XCODEBUILD_LOG" || true
log "--- end app link-result diagnosis ---"

if [[ "$xcodebuild_status" -ne 0 ]]; then
  if grep -q "duplicate symbol '_FIRFirebaseVersion'" "$XCODEBUILD_LOG"; then
    log "ERROR: #9202 duplicate _FIRFirebaseVersion signature remains"
  elif grep -q '_OBJC_CLASS_\$_FIRApp' "$XCODEBUILD_LOG"; then
    log "ERROR: #9158 FIRApp app-target link failure returned"
  elif grep -q '_OBJC_CLASS_\$_RCTEventEmitter' "$XCODEBUILD_LOG"; then
    log "ERROR: RCTEventEmitter link failure returned"
  elif grep -E -q 'CompileC|CompileSwift|fatal error:| error:' "$XCODEBUILD_LOG"; then
    log "ERROR: xcodebuild failed during compilation; inspect ${XCODEBUILD_LOG}"
  else
    log "ERROR: xcodebuild failed without a known RNFB link signature; inspect ${XCODEBUILD_LOG}"
  fi
  exit "$xcodebuild_status"
fi

if grep -q "duplicate symbol '_FIRFirebaseVersion'" "$XCODEBUILD_LOG" ||
   grep -q 'libRNFBApp\.a.*FirebaseCore\.o' "$XCODEBUILD_LOG" ||
   grep -q 'libRNFBMessaging\.a.*FirebaseCore\.o' "$XCODEBUILD_LOG"; then
  log "ERROR: xcodebuild passed but the #9202 static-archive signature remains in its log"
  exit 1
fi

log "PASS: Expo documented path links RNFBApp/RNFBMessaging as frameworks without duplicate Firebase symbols"
