#!/bin/bash
# Fails when any Objective-C class is defined in more than one binary that a
# built iOS .app loads in-process (main executable, Frameworks/*.framework,
# Frameworks/*.dylib, app-root *.dylib).
#
# Usage: check-duplicate-objc-classes.sh <path/to/App.app>
#
# The ObjC runtime registers every class in a loaded binary's
# __objc_classlist, whatever its symbol visibility (pure-Swift and hidden
# classes included), so compare classlists of every Mach-O the .app loads.
#
# RNFB_DYLD_INFO overrides the dyld_info path (used by the Jest harness).
set -euo pipefail

log() {
  echo "[check-duplicate-objc-classes] $*"
}

dup_check_fail() {
  log "ERROR: $*"
  log "--- end duplicate Objective-C class check ---"
  exit 1
}

log "--- duplicate Objective-C class check ---"

if [[ $# -ne 1 ]]; then
  dup_check_fail "usage: $0 <path/to/App.app>"
fi
APP_DIR="${1%/}"
if [[ ! -d "$APP_DIR" ]]; then
  dup_check_fail "app bundle not found: ${APP_DIR}"
fi

DYLD_INFO="${RNFB_DYLD_INFO:-/usr/bin/dyld_info}"
if [[ ! -x "$DYLD_INFO" ]]; then
  dup_check_fail "${DYLD_INFO} not found; it is required to read Objective-C classlists"
fi

bundle_executable() {
  local bundle="$1" name=""
  if [[ -f "${bundle}/Info.plist" ]]; then
    name="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "${bundle}/Info.plist" 2>/dev/null || true)"
  fi
  if [[ -z "$name" ]]; then
    name="$(basename "$bundle")"
    name="${name%.*}"
  fi
  echo "${bundle}/${name}"
}

dup_work_dir="$(mktemp -d)"
trap 'rm -rf "$dup_work_dir"' EXIT
binaries_file="${dup_work_dir}/binaries.txt"
class_owners_file="${dup_work_dir}/class-owners.txt"

bundle_executable "$APP_DIR" >"$binaries_file"
for fw_dir in "$APP_DIR"/Frameworks/*.framework; do
  if [[ -d "$fw_dir" ]]; then
    bundle_executable "$fw_dir" >>"$binaries_file"
  fi
done
for dylib in "$APP_DIR"/*.dylib "$APP_DIR"/Frameworks/*.dylib; do
  if [[ -f "$dylib" ]]; then
    echo "$dylib" >>"$binaries_file"
  fi
done

: >"$class_owners_file"
binary_count=0
rnfb_class_count=0
while IFS= read -r bin; do
  rel="${bin#"${APP_DIR}"/}"
  if [[ ! -f "$bin" ]]; then
    dup_check_fail "expected Mach-O binary missing: ${rel}"
  fi
  if ! bin_objc="$("$DYLD_INFO" -objc "$bin" 2>&1)"; then
    dup_check_fail "dyld_info could not read ${rel}: ${bin_objc}"
  fi
  if grep -qE '^[[:space:]]*warning:' <<<"$bin_objc"; then
    dup_check_fail "dyld_info warned on ${rel}: $(sed -n '/^[[:space:]]*warning:/p' <<<"$bin_objc")"
  fi
  binary_count=$((binary_count + 1))
  # Classes and categories as `dyld_info -objc` prints them:
  #   @interface RNFBAppModule : NSObject <NativeRNFBTurboAppSpec, RCTInvalidating>
  #   @interface _TtC15ExpoModulesCore32ExpoAppDelegateSubscriberManager : NSObject
  #   @interface UIFont(ExpoFont)
  # Keep the class name ($2) unless it is a category: `Name(Cat)`, or
  # `Name (Cat)` should the tool ever add a space. If a toolchain update changes
  # this format, compare a real line against these samples first.
  bin_classes="$(awk '$1 == "@interface" && $2 !~ /\(/ && $3 !~ /^\(/ { print $2 }' <<<"$bin_objc" | LC_ALL=C sort -u)"
  if [[ -z "$bin_classes" ]]; then
    continue
  fi
  awk -v owner="$rel" '{ print $0 "\t" owner }' <<<"$bin_classes" >>"$class_owners_file"
  case "$rel" in
    Frameworks/RNFB*.framework/*)
      rnfb_class_count=$((rnfb_class_count + $(wc -l <<<"$bin_classes")))
      ;;
  esac
done <"$binaries_file"

class_count="$(cut -f1 "$class_owners_file" | LC_ALL=C sort -u | wc -l | tr -d ' ')"
duplicates="$(LC_ALL=C sort "$class_owners_file" | awk -F'\t' '
  $1 == prev { owners = owners ", " $2; n++; next }
  { if (n > 1) print prev ": " owners; prev = $1; owners = $2; n = 1 }
  END { if (n > 1) print prev ": " owners }
')"
duplicate_count=0
if [[ -n "$duplicates" ]]; then
  duplicate_count="$(wc -l <<<"$duplicates" | tr -d ' ')"
fi

log "scanned ${binary_count} binaries in ${APP_DIR}: ${class_count} distinct classes (${rnfb_class_count} in RNFB* frameworks), ${duplicate_count} duplicated"
if [[ "$class_count" -eq 0 || "$rnfb_class_count" -eq 0 ]]; then
  dup_check_fail "found no classes overall or in any RNFB* framework; the scan is not trustworthy"
fi
if [[ "$duplicate_count" -ne 0 ]]; then
  while IFS= read -r line; do
    log "ERROR: duplicate class ${line}"
  done <<<"$duplicates"
  log "NOTE: a reused DerivedData can embed frameworks left over from an earlier build ([RNFB] Embed Firebase SPM Frameworks copies every dynamic framework in PackageFrameworks); re-check a local failure from an empty DerivedData"
  if [[ "$duplicate_count" -eq 1 ]]; then
    dup_check_fail "1 Objective-C class is defined in more than one binary"
  fi
  dup_check_fail "${duplicate_count} Objective-C classes are defined in more than one binary"
fi
canary_owner="$(awk -F'\t' '$1 == "GULNetwork" { print $2 }' "$class_owners_file")"
if [[ -z "$canary_owner" ]]; then
  dup_check_fail "GoogleUtilities canary GULNetwork not found in any scanned binary; test-expo/package.json must keep @react-native-firebase/analytics alongside messaging so the GoogleUtilities sharing graph is exercised"
fi
log "ok: GoogleUtilities canary GULNetwork defined once, in ${canary_owner}"
log "--- end duplicate Objective-C class check ---"

log "PASS: no Objective-C class is defined in more than one binary of the built app"
