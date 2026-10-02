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
# Optional CI probe (off by default): RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE=1
# links App through the local dynamic package at
# packages/app/ios/RNFBFirebase instead of direct firebase-ios-sdk.
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

# Default off: shipped path keeps spm_dependency on firebase-ios-sdk.
PROBE_DYNAMIC_FIREBASE="${RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE:-0}"
if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  BUILD_MODE="dynamic-firebase"
else
  BUILD_MODE="normal"
fi

POD_INSTALL_LOG="${RNFB_TEST_RN_BARE_POD_LOG:-/tmp/test-rn-bare-pod-install-${BUILD_MODE}.log}"
XCODEBUILD_LOG="${RNFB_TEST_RN_BARE_XCODEBUILD_LOG:-/tmp/test-rn-bare-xcodebuild-${BUILD_MODE}.log}"
DERIVED_DATA="${RNFB_TEST_RN_BARE_DERIVED_DATA:-/tmp/test-rn-bare-derived-data-${BUILD_MODE}}"
PODFILE="test-rn-bare/ios/Podfile"
PBXPROJ="test-rn-bare/ios/testrnbare.xcodeproj/project.pbxproj"
PODS_PBXPROJ="test-rn-bare/ios/Pods/Pods.xcodeproj/project.pbxproj"
PODFILE_LOCK="test-rn-bare/ios/Podfile.lock"
WORKSPACE="${RNFB_TEST_RN_BARE_WORKSPACE:-test-rn-bare/ios/testrnbare.xcworkspace}"
SCHEME="${RNFB_TEST_RN_BARE_SCHEME:-testrnbare}"

fail() {
  log "ERROR: $*"
  exit 1
}

# shellcheck source=lib/rn-bare-probe-assertions.sh
source ".github/workflows/scripts/lib/rn-bare-probe-assertions.sh"

assert_podfile_fail_closed() {
  log "--- Podfile fail-closed checks ---"
  local podfile_code
  if [[ ! -f "$PODFILE" ]]; then
    fail "missing ${PODFILE}"
  fi
  podfile_code="$(grep -E -v '^[[:space:]]*#' "$PODFILE")"

  if grep -E -q "ENV\[['\"]RCT_USE_PREBUILT_RNCORE['\"]\][[:space:]]*=[[:space:]]*['\"]0['\"]" <<<"$podfile_code"; then
    fail "Podfile sets RCT_USE_PREBUILT_RNCORE=0 (tests/ Issue 2 pin, not this closer)"
  fi
  if grep -E -q "ENV\[['\"]RCT_USE_RN_DEP['\"]\][[:space:]]*=[[:space:]]*['\"]0['\"]" <<<"$podfile_code"; then
    fail "Podfile sets RCT_USE_RN_DEP=0 (tests/ Issue 2 pin, not this closer)"
  fi
  if grep -q 'pre_install' <<<"$podfile_code" && grep -q 'Pod::BuildType.static_library' <<<"$podfile_code"; then
    fail "Podfile has a RNFB pre_install Pod::BuildType.static_library hook (the #8883 workaround, not the documented path)"
  fi
  if grep -E -q 'RNFirebaseDisableSPM[[:space:]]*=[[:space:]]*true' <<<"$podfile_code"; then
    fail "Podfile disables SPM (\$RNFirebaseDisableSPM = true); documented CLI path keeps SPM on"
  fi
  if ! grep -q 'use_frameworks! :linkage => :dynamic' <<<"$podfile_code"; then
    fail "Podfile is missing use_frameworks! :linkage => :dynamic"
  fi
  log "Podfile: prebuilt RNCore not forced off, no RNFB static pre_install, SPM + dynamic present"
}

assert_app_objc_import_boundary() {
  log "--- App native (.h/.m/.mm) Firebase/Swift import boundary check ---"
  ruby .github/workflows/scripts/check_rnfb_app_ios_objc_imports.rb packages/app/ios ||
    fail "packages/app iOS native sources (.h/.m/.mm) cross the Swift-owned Firebase import boundary"
}

assert_generated_graph() {
  log "--- generated graph checks ---"
  if ! grep -q 'React-Core-prebuilt' "$PODFILE_LOCK"; then
    fail "Podfile.lock has no React-Core-prebuilt (prebuilt RNCore is not on)"
  fi
  if ! grep -q 'Building from source: false' "$POD_INSTALL_LOG"; then
    fail "pod install log does not show 'Building from source: false' (prebuilt RNCore not engaged)"
  fi
  if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
    if ! grep -q 'Using local RNFBFirebase SPM probe' "$POD_INSTALL_LOG"; then
      fail "probe flag is on but pod install log is missing 'Using local RNFBFirebase SPM probe'"
    fi
    if grep -q 'Using SPM for Firebase dependency resolution (products:' "$POD_INSTALL_LOG"; then
      fail "probe flag is on but pod install still logged direct firebase-ios-sdk SPM products"
    fi
    if ! grep -q 'productName = RNFBFirebase' "$PBXPROJ"; then
      fail "probe app target does not own the RNFBFirebase package product"
    fi
    # RNFBApp must not own the package product (that injects Firebase module
    # maps). A sibling aggregate may hold a productRef so the facade builds
    # before RNFBApp Swift, and RNFBApp may depend on that aggregate only.
    if ! order_graph="$(
      cd test-rn-bare/ios
      bundle exec ruby - Pods/Pods.xcodeproj 2>&1 <<'RUBY'
require 'xcodeproj'

project = Xcodeproj::Project.open(ARGV.fetch(0))
app = project.targets.find { |target| target.name == 'RNFBApp' }
abort 'Pods project has no RNFBApp target' unless app

if app.package_product_dependencies.any? { |dep| dep.product_name == 'RNFBFirebase' }
  abort 'RNFBApp packageProductDependencies includes RNFBFirebase; transitive Firebase module maps will leak'
end
if app.dependencies.any? { |dep| dep.product_ref && dep.product_ref.product_name == 'RNFBFirebase' }
  abort 'RNFBApp target dependency productRef is RNFBFirebase; that attaches package module maps to the pod'
end

order = project.targets.find { |target| target.name == 'RNFBFirebaseProbeOrder' }
abort 'Pods project is missing RNFBFirebaseProbeOrder; RNFBApp Swift can compile before the facade exists' unless order
product_edge = order.dependencies.any? { |dep| dep.product_ref && dep.product_ref.product_name == 'RNFBFirebase' }
abort 'RNFBFirebaseProbeOrder has no RNFBFirebase productRef' unless product_edge
unless order.respond_to?(:package_product_dependencies) && order.package_product_dependencies.nil?
  if order.respond_to?(:package_product_dependencies) &&
     order.package_product_dependencies.any? { |dep| dep.product_name == 'RNFBFirebase' }
    abort 'RNFBFirebaseProbeOrder owns RNFBFirebase as a package product; use a productRef only'
  end
end
app_edge = app.dependencies.any? { |dep| dep.target && dep.target.name == 'RNFBFirebaseProbeOrder' }
abort 'RNFBApp does not depend on RNFBFirebaseProbeOrder' unless app_edge
RUBY
    )"; then
      fail "probe facade build order: ${order_graph}"
    fi
  else
    if ! grep -q 'Using SPM for Firebase dependency resolution' "$POD_INSTALL_LOG"; then
      fail "pod install log is missing 'Using SPM for Firebase dependency resolution'"
    fi
    if grep -q 'Using local RNFBFirebase SPM probe' "$POD_INSTALL_LOG"; then
      fail "probe flag is off but pod install logged the local RNFBFirebase probe path"
    fi
    if grep -q 'RNFBFirebaseProbeOrder' "$PODS_PBXPROJ"; then
      fail "non-probe Pods project contains RNFBFirebaseProbeOrder; shipped builds must not order the facade"
    fi
  fi
  if [[ -f "$PBXPROJ" ]] && grep -q 'packageProductDependencies' "$PBXPROJ"; then
    log "app pbxproj HAS packageProductDependencies (SPM products linked)"
  else
    log "app pbxproj packageProductDependencies not found (CocoaPods may keep them on the Pods project); SPM log line was present"
  fi
  log "generated graph: prebuilt RNCore on, Firebase SPM on (probe=${PROBE_DYNAMIC_FIREBASE})"
}

assert_dynamic_firebase_probe_graph() {
  local products_dir="${DERIVED_DATA}/Build/Products/Release-iphonesimulator"
  local umbrella_binary
  local app_binary
  local framework_binary

  log "--- dynamic RNFBFirebase probe graph checks ---"

  # The `find ... -print -quit` lookups below pick the first copy of each
  # binary only (the otool -L link checks need one representative). Duplicate
  # copies (PackageFrameworks/ vs testrnbare.app/Frameworks/) are covered by
  # the nm sweep in rnfb_probe_assert_single_firebase_copy, which scans every
  # framework binary under the products dir.
  umbrella_binary="$(find "$products_dir" -type f -path '*/RNFBFirebase.framework/RNFBFirebase' -print -quit)"
  [[ -n "$umbrella_binary" ]] || fail "RNFBFirebase dynamic framework binary was not produced"
  # Capture tool output before grep. `set -o pipefail` plus `grep -q` treats
  # SIGPIPE from the producer as failure even when the match is present.
  umbrella_kind="$(file -b "$umbrella_binary")"
  grep -q 'dynamically linked' <<<"$umbrella_kind" ||
    fail "RNFBFirebase product is not a dynamically linked framework"

  app_binary="$(find "$products_dir" -type f -path '*/testrnbare.app/testrnbare' -print -quit)"
  [[ -n "$app_binary" ]] || fail "testrnbare app binary was not found under ${products_dir}"
  app_links="$(otool -L "$app_binary")"
  grep -Fq '@rpath/RNFBFirebase.framework/RNFBFirebase' <<<"$app_links" ||
    fail "app binary does not link RNFBFirebase"

  framework_binary="$(find "$products_dir" -type f -path '*/RNFBApp.framework/RNFBApp' -print -quit)"
  [[ -n "$framework_binary" ]] || fail "RNFBApp framework binary was not found"
  [[ -r "$framework_binary" ]] || fail "RNFBApp framework binary is not readable: ${framework_binary}"
  framework_links="$(otool -L "$framework_binary")"
  grep -Fq '@rpath/RNFBFirebase.framework/RNFBFirebase' <<<"$framework_links" ||
    fail "RNFBApp does not link the RNFBFirebase probe package"
  # Single-copy claim: RNFBApp does not define FIRApp, RNFBFirebase does, and
  # no standalone FirebaseCore framework ships beside it, and no other framework
  # binary or the app executable (app_binary, the testrnbare.app/testrnbare
  # found above) defines it. Checks live in the sourced helper so tests can run
  # them against fixture products dirs.
  rnfb_probe_assert_single_firebase_copy \
    "$PROBE_DYNAMIC_FIREBASE" "$products_dir" "$umbrella_binary" "$framework_binary" "$app_binary"
  log "nm: FIRApp single-copy holds (RNFBApp none, RNFBFirebase defines it, no standalone FirebaseCore framework, no other framework binary or app executable defines it); RNFBFirebase linked"
}

assert_podfile_fail_closed
assert_app_objc_import_boundary

if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  export RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE=1
  log "probe mode ON (RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE=1)"
else
  unset RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE || true
  log "probe mode OFF (direct firebase-ios-sdk)"
fi

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

# A stable /tmp DerivedData path survives worktree changes. CI typechecks the
# client against the RNFBFirebase module produced in the same run, so a warm
# module from an earlier checkout is not evidence. Normal builds keep their
# DerivedData. The override path is cleared too.
if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  if [[ -z "$DERIVED_DATA" || "$DERIVED_DATA" == "/" ]]; then
    fail "refusing to delete DerivedData path '${DERIVED_DATA}'"
  fi
  rm -rf "$DERIVED_DATA"
  log "removed DerivedData at ${DERIVED_DATA} before xcodebuild: a stable /tmp path survives worktree changes, and CI compiles the client against the module from the same run"
fi

HOST_ARCH="$(uname -m)"
log "xcodebuild build (iOS Simulator, unsigned, Release, arch=${HOST_ARCH}) (log: ${XCODEBUILD_LOG})"
xcodebuild_args=(
  ARCHS="${HOST_ARCH}"
  VALID_ARCHS="${HOST_ARCH}"
  ONLY_ACTIVE_ARCH=YES
  CC=clang CPLUSPLUS=clang++
  -workspace "$WORKSPACE"
  -scheme "$SCHEME"
  -derivedDataPath "$DERIVED_DATA"
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

if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]] && grep -q 'ImplementationOnlyDeprecated' "$XCODEBUILD_LOG"; then
  fail "xcodebuild log contains ImplementationOnlyDeprecated; @_implementationOnly was not honored, so a green incremental compile is not evidence. inspect ${XCODEBUILD_LOG}"
fi

# A green probe that compiled RCTConvertFIRApp.swift's #else branch
# (`import FirebaseCore`) is not evidence. Empty DerivedData used to make
# canImport(RNFBFirebase) false, and a leftover module made it true.
if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  log "--- dynamic probe facade import check ---"
  if grep -F 'RCTConvertFIRApp.swift' "$XCODEBUILD_LOG" | grep -F "no such module 'FirebaseCore'" >/dev/null; then
    fail "RCTConvertFIRApp.swift hit no such module 'FirebaseCore' (compiled the #else branch before the facade existed). inspect ${XCODEBUILD_LOG}"
  fi
  if grep -F 'RCTConvertFIRApp.swift' "$XCODEBUILD_LOG" | grep -F 'import FirebaseCore' >/dev/null; then
    fail "RCTConvertFIRApp.swift log shows import FirebaseCore; the #else branch was compiled. inspect ${XCODEBUILD_LOG}"
  fi
  if [[ "$xcodebuild_status" -eq 0 ]]; then
    if ! swiftc_check="$(
      ruby - "$XCODEBUILD_LOG" 2>&1 <<'RUBY'
log = File.read(ARGV.fetch(0))
commands = log.each_line.select do |line|
  line.include?('swiftc ') && line.include?('-module-name RNFBApp')
end
abort 'RNFBApp swiftc command was not in the xcodebuild log' if commands.empty?

commands.each do |line|
  if line.include?('FirebaseCore.modulemap') || line.include?('FirebaseInstallations.modulemap')
    abort 'RNFBApp swiftc includes FirebaseCore.modulemap or FirebaseInstallations.modulemap'
  end
end
unless commands.any? { |line| line.include?('RNFBFirebase') }
  abort 'RNFBApp swiftc does not mention RNFBFirebase'
end

compiled_client = commands.any? do |line|
  next true if line.include?('RCTConvertFIRApp.swift')

  list_path = line[/\/\S+RNFBApp\.SwiftFileList/]
  list_path && File.file?(list_path) && File.read(list_path).include?('RCTConvertFIRApp.swift')
end
abort 'RNFBApp swiftc did not compile RCTConvertFIRApp.swift' unless compiled_client
RUBY
    )"; then
      fail "probe facade swiftc: ${swiftc_check}"
    fi
    log "RNFBApp swiftc mentions RNFBFirebase and has no FirebaseCore/FirebaseInstallations module map"
  fi
fi

log "--- compile/link diagnosis ---"
grep -n -E -m 80 "fatal error: 'React/RCT(Convert|BridgeModule|EventEmitter)\\.h' file not found|error: include of non-modular header|_OBJC_CLASS_\\\$_RCTEventEmitter|duplicate symbol '_FIRFirebaseVersion'|headers visible in RNFB dynamic probe|C\\+\\+ modules enabled in RNFB dynamic probe" "$XCODEBUILD_LOG" || true
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
  if grep -q 'FirebaseCore headers visible in RNFB dynamic probe' "$XCODEBUILD_LOG"; then
    fail "dynamic probe exposed FirebaseCore product headers to RNFBApp Objective-C++. inspect ${XCODEBUILD_LOG}"
  fi
  if grep -q 'FirebaseInstallations headers visible in RNFB dynamic probe' "$XCODEBUILD_LOG"; then
    fail "dynamic probe exposed FirebaseInstallations product headers to RNFBApp Objective-C++. inspect ${XCODEBUILD_LOG}"
  fi
  if grep -Fq 'C++ modules enabled in RNFB dynamic probe' "$XCODEBUILD_LOG"; then
    fail "dynamic probe compiled RNFBApp Objective-C++ with C++ modules enabled. inspect ${XCODEBUILD_LOG}"
  fi
  if grep -E -q 'CompileC|CompileSwift|fatal error:| error:' "$XCODEBUILD_LOG"; then
    first_compile_error="$(grep -E -m 1 'fatal error:| error:' "$XCODEBUILD_LOG" || true)"
    fail "xcodebuild failed during compilation: ${first_compile_error}. inspect ${XCODEBUILD_LOG}"
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

if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  assert_dynamic_firebase_probe_graph
  log "PASS: probe links App through local dynamic RNFBFirebase (FirebaseCore + FirebaseInstallations), nm single-copy FirebaseCore (frameworks and app executable)"
else
  log "PASS: vanilla RN CLI documented path compiles with prebuilt RNCore on, no RNFB static pre_install, SPM + dynamic, without #8883 compile signatures"
fi
