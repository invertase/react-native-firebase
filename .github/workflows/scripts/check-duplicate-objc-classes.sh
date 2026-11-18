#!/bin/bash
# Fails when any Objective-C class is defined in more than one binary that a
# built iOS .app loads in-process (main executable, Frameworks/*.framework,
# Frameworks/*.dylib, app-root *.dylib).
#
# Usage: check-duplicate-objc-classes.sh <path/to/App.app>
#          [--expect-duplicates N | --report-only] [--canary-hint TEXT]
#
# The ObjC runtime registers every class in a loaded binary's
# __objc_classlist, whatever its symbol visibility (pure-Swift and hidden
# classes included), so compare classlists of every Mach-O the .app loads.
#
# --expect-duplicates N passes only when exactly N classes are duplicated
# (default 0). Every other guard still applies, so a control run cannot pass
# on an empty or unreadable scan. GULNetwork is a canary for the
# GoogleUtilities sharing graph this check exists for: with 0 expected
# duplicates it must be defined by exactly one binary; with N > 0 it must be
# one of the duplicated classes, so a control run proves it hit that graph.
#
# --report-only lists every duplicate, the GULNetwork and FIRApp owners, and
# exits 0 unless a scan guard (dyld_info, missing binary, empty scan) fails.
#
# --canary-hint TEXT is appended to the error when GULNetwork is missing.
# Usage and flag errors exit 2.
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

USAGE="usage: $0 <path/to/App.app> [--expect-duplicates N | --report-only] [--canary-hint TEXT]"

usage_error() {
  log "ERROR: $*"
  log "$USAGE"
  exit 2
}

log "--- duplicate Objective-C class check ---"

if [[ $# -lt 1 ]]; then
  usage_error "missing app bundle path"
fi
APP_DIR="${1%/}"
shift
EXPECT_DUPLICATES=0
EXPECT_SET=0
REPORT_ONLY=0
CANARY_HINT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --expect-duplicates)
      [[ $# -ge 2 ]] || usage_error "$1 needs a value"
      EXPECT_DUPLICATES="$2"
      EXPECT_SET=1
      shift 2
      ;;
    --report-only)
      REPORT_ONLY=1
      shift
      ;;
    --canary-hint)
      [[ $# -ge 2 ]] || usage_error "$1 needs a value"
      CANARY_HINT="$2"
      shift 2
      ;;
    *)
      usage_error "unknown argument: $1"
      ;;
  esac
done
if [[ ! "$EXPECT_DUPLICATES" =~ ^(0|[1-9][0-9]*)$ ]]; then
  usage_error "--expect-duplicates must be a non-negative integer, got '${EXPECT_DUPLICATES}'"
fi
if [[ "$REPORT_ONLY" -eq 1 && "$EXPECT_SET" -eq 1 ]]; then
  usage_error "--report-only and --expect-duplicates are mutually exclusive"
fi

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
dup_level="ERROR"
if [[ "$REPORT_ONLY" -eq 1 ]]; then
  dup_level="report-only"
elif [[ "$EXPECT_DUPLICATES" -ne 0 ]]; then
  dup_level="expected-mode"
fi
if [[ "$duplicate_count" -ne 0 ]]; then
  while IFS= read -r line; do
    log "${dup_level}: duplicate class ${line}"
  done <<<"$duplicates"
fi

class_owner_list() {
  awk -F'\t' -v cls="$1" '$1 == cls { print $2 }' "$class_owners_file"
}

if [[ "$REPORT_ONLY" -eq 1 ]]; then
  for cls in GULNetwork FIRApp; do
    owners="$(class_owner_list "$cls")"
    if [[ -z "$owners" ]]; then
      log "report-only: ${cls} absent"
    else
      log "report-only: ${cls} defined in $(wc -l <<<"$owners" | tr -d ' ') binaries: $(paste -sd ',' - <<<"$owners")"
    fi
  done
  log "--- end duplicate Objective-C class check ---"
  log "REPORT: ${duplicate_count} Objective-C classes are defined in more than one binary (report-only, not enforced)"
  exit 0
fi

if [[ "$duplicate_count" -ne "$EXPECT_DUPLICATES" ]]; then
  log "NOTE: when a direct caller reuses a DerivedData, it can embed frameworks left over from an earlier build ([RNFB] Embed Firebase SPM Frameworks copies every dynamic framework in PackageFrameworks); re-check such a failure from an empty DerivedData"
  if [[ "$EXPECT_DUPLICATES" -ne 0 ]]; then
    dup_check_fail "expected exactly ${EXPECT_DUPLICATES} duplicated Objective-C classes, found ${duplicate_count}"
  fi
  if [[ "$duplicate_count" -eq 1 ]]; then
    dup_check_fail "1 Objective-C class is defined in more than one binary"
  fi
  dup_check_fail "${duplicate_count} Objective-C classes are defined in more than one binary"
fi
canary_owners="$(class_owner_list GULNetwork)"
canary_owner_count=0
if [[ -n "$canary_owners" ]]; then
  canary_owner_count="$(wc -l <<<"$canary_owners" | tr -d ' ')"
fi
if [[ "$canary_owner_count" -eq 0 ]]; then
  dup_check_fail "GoogleUtilities canary GULNetwork not found in any scanned binary${CANARY_HINT:+; ${CANARY_HINT}}"
fi
if [[ "$EXPECT_DUPLICATES" -eq 0 ]]; then
  log "ok: GoogleUtilities canary GULNetwork defined once, in ${canary_owners}"
else
  if ! grep -q '^GULNetwork: ' <<<"$duplicates"; then
    dup_check_fail "GoogleUtilities canary GULNetwork is not among the ${EXPECT_DUPLICATES} duplicated classes (owners: $(paste -sd ',' - <<<"$canary_owners")); the control did not exercise the GoogleUtilities sharing graph"
  fi
  log "ok: GoogleUtilities canary GULNetwork is duplicated, in ${canary_owner_count} binaries: $(paste -sd ',' - <<<"$canary_owners")"
fi
log "--- end duplicate Objective-C class check ---"

if [[ "$EXPECT_DUPLICATES" -ne 0 ]]; then
  log "PASS: exactly ${EXPECT_DUPLICATES} Objective-C classes are defined in more than one binary, as expected"
else
  log "PASS: no Objective-C class is defined in more than one binary of the built app"
fi
