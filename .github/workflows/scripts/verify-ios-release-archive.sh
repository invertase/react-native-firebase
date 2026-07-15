#!/bin/bash
# Archive the iOS test app for a real device destination (unsigned) and verify
# the app bundle it produces is actually runnable, i.e. every dynamic
# framework any embedded binary depends on is present in Frameworks/.
#
# Why this exists: the CI matrix in tests_e2e_ios.yml only ever runs
# `xcodebuild build -sdk iphonesimulator`. The "Archive" action is materially
# different -- Xcode forces ONLY_ACTIVE_ARCH=NO and DEPLOYMENT_POSTPROCESSING=YES
# (full stripping / install-style processing) for Archive regardless of what
# the project/Podfile sets, and it targets a real device SDK, not the
# simulator SDK. That is precisely the difference between "works when Xcode
# installs it on a real device or in Simulator" and "crashes only from a
# TestFlight/Fastlane archive" reported against this PR:
# https://github.com/invertase/react-native-firebase/pull/8933#issuecomment-4308578826
# and the release+SPM dyld launch failure fixed by
# packages/app/firebase_spm.rb's embed phase (see
# okf-bundle/ios-spm-native-imports.md "Release launch dyld failure"), which
# was itself only ever validated against a Release-iphonesimulator build.
#
# This script does not require a signing identity or provisioning profile --
# it produces an unsigned .xcarchive purely to exercise the real Archive
# build settings and inspect the resulting app bundle. It is not a substitute
# for an actual signed TestFlight/device install, but it catches the same
# class of "framework built, but never embedded / stripped at archive time"
# regression automatically, on every PR, without needing device hardware or
# Apple signing credentials in CI.
set -euo pipefail

WORKSPACE="${RNFB_ARCHIVE_WORKSPACE:-testing.xcworkspace}"
SCHEME="${RNFB_ARCHIVE_SCHEME:-testing}"
CONFIGURATION="${RNFB_ARCHIVE_CONFIGURATION:-Release}"
ARCHIVE_PATH="${RNFB_ARCHIVE_PATH:-build/testing.xcarchive}"

log() {
  echo "[ios-release-archive] $*"
}

rm -rf "$ARCHIVE_PATH"

log "archiving scheme=${SCHEME} configuration=${CONFIGURATION} destination=generic/platform=iOS (unsigned) -> ${ARCHIVE_PATH}"

set -o pipefail
xcodebuild archive \
  CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++ \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGN_ENTITLEMENTS="" \
  | xcbeautify

APP_DIR="$(find "${ARCHIVE_PATH}/Products/Applications" -maxdepth 1 -name '*.app' 2>/dev/null | head -1)"
if [[ -z "$APP_DIR" || ! -d "$APP_DIR" ]]; then
  log "ERROR: no .app product found under ${ARCHIVE_PATH}/Products/Applications"
  exit 1
fi

APP_NAME="$(basename "$APP_DIR" .app)"
MAIN_BINARY="${APP_DIR}/${APP_NAME}"
FRAMEWORKS_DIR="${APP_DIR}/Frameworks"

log "app product: ${APP_DIR}"
lipo -info "$MAIN_BINARY" 2>&1 | sed 's/^/[ios-release-archive]   /' || true

if [[ -d "$FRAMEWORKS_DIR" ]]; then
  log "embedded frameworks in ${FRAMEWORKS_DIR}:"
  ls -1 "$FRAMEWORKS_DIR" | sed 's/^/[ios-release-archive]   /'
else
  log "no ${FRAMEWORKS_DIR} directory (expected for static-linkage/CocoaPods-only configs; continuing)"
fi

# Every *.framework a binary loads via @rpath must actually be embedded --
# this is the exact regression class fixed by packages/app/firebase_spm.rb's
# embed phase (missing FirebaseAppCheckInterop.framework /
# FirebaseAuthInterop.framework), re-checked here at real Archive-action
# fidelity rather than a plain simulator build.
missing=0

check_binary() {
  local binary="$1"
  local label="$2"
  local dep fw_name

  while IFS= read -r dep; do
    [[ -z "$dep" ]] && continue
    case "$dep" in
      /System/*|/usr/lib/*) continue ;;
    esac
    fw_name="$(echo "$dep" | sed -E 's#.*/([^/]+\.framework)/.*#\1#')"
    # Not a @rpath/Foo.framework/Foo style dependency -- nothing to check.
    [[ "$fw_name" == "$dep" ]] && continue
    if [[ ! -e "${FRAMEWORKS_DIR}/${fw_name}" ]]; then
      log "MISSING: ${label} depends on ${fw_name} but it is not embedded in ${FRAMEWORKS_DIR}"
      missing=$((missing + 1))
    fi
  done < <(otool -L "$binary" 2>/dev/null | tail -n +2 | awk '{print $1}')
}

check_binary "$MAIN_BINARY" "${APP_NAME} (main app binary)"

if [[ -d "$FRAMEWORKS_DIR" ]]; then
  for fw_bundle in "$FRAMEWORKS_DIR"/*.framework; do
    [[ -d "$fw_bundle" ]] || continue
    fw_binary_name="$(basename "$fw_bundle" .framework)"
    fw_binary="${fw_bundle}/${fw_binary_name}"
    [[ -f "$fw_binary" ]] && check_binary "$fw_binary" "${fw_binary_name}.framework"
  done
fi

if [[ "$missing" -gt 0 ]]; then
  log "FAILED: ${missing} missing framework dependency(ies) found in the real device archive -- see MISSING lines above"
  exit 1
fi

log "OK: every embedded binary's @rpath framework dependencies are present in the archived app bundle"
