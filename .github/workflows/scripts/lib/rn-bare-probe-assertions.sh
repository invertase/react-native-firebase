#!/bin/bash
# Sourced by test-rn-bare-ios-build.sh. Binary and product-dir assertions for
# the dynamic RNFBFirebase probe (RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE=1).
#
# The single-copy claim: FirebaseCore (FIRApp) is linked once, into
# RNFBFirebase.framework. The shipped path has two copies: RNFBApp.framework
# defines _OBJC_CLASS_$_FIRApp itself (it statically links FirebaseCore), and
# FirebaseCore also exists as a standalone package-product framework
# (FirebaseCore_<hash>_PackageProduct.framework). The probe has FIRApp defined
# once, in RNFBFirebase.framework, with none in RNFBApp and no standalone
# FirebaseCore framework. These assertions check that:
#   - RNFBApp.framework does not define _OBJC_CLASS_$_FIRApp
#   - RNFBFirebase.framework does define _OBJC_CLASS_$_FIRApp
#   - no standalone FirebaseCore framework exists under the products dir
#     (FirebaseCore.framework, or the SPM package-product framework
#     FirebaseCore_<hash>_PackageProduct.framework that the shipped path
#     produces)
#   - a sweep of every framework's main binary under the products dir
#     (PackageFrameworks/ and testrnbare.app/Frameworks/ copies included,
#     .dSYM contents excluded) plus the app executable: every binary that
#     defines _OBJC_CLASS_$_FIRApp (or the metaclass) lives in an
#     RNFBFirebase.framework. The app executable (testrnbare.app/testrnbare)
#     is not RNFBFirebase and must not define FIRApp at all. This catches a
#     second statically linked FirebaseCore copy in a framework whose name
#     does not mention FirebaseCore, or in the app executable itself. Every
#     `*.framework` directory must be accounted for (one log line each); a
#     directory whose main binary cannot be resolved fails the sweep.
#
# The caller must define `log` and `fail` (fail must exit). Functions here set
# RNFB_PROBE_DEFINED_SYMBOLS rather than printing, so `fail` runs in the
# caller's shell and not in a command substitution subshell.

RNFB_PROBE_FIRAPP_CLASS_REGEX='[[:space:]]_OBJC_CLASS_\$_FIRApp$'
RNFB_PROBE_FIRAPP_ANY_REGEX='[[:space:]]_OBJC_CLASS_\$_FIRApp$|[[:space:]]_OBJC_METACLASS_\$_FIRApp$'

# rnfb_probe_read_defined_symbols <framework-binary> <label> [allow-empty]
# Sets RNFB_PROBE_DEFINED_SYMBOLS to `nm -gU` output. Fails on an unreadable
# binary, an nm error, or empty output (unless allow-empty is 1), so an
# unreadable binary is never mistaken for a clean one.
rnfb_probe_read_defined_symbols() {
  local binary="$1"
  local label="$2"
  local allow_empty="${3:-0}"

  RNFB_PROBE_DEFINED_SYMBOLS=""
  [[ -f "$binary" ]] || fail "${label} binary was not found: ${binary}"
  [[ -r "$binary" ]] || fail "${label} binary is not readable: ${binary}"
  # Capture before grep: `set -o pipefail` plus `grep -q` treats SIGPIPE from
  # the producer as failure even when the match is present.
  if ! RNFB_PROBE_DEFINED_SYMBOLS="$(nm -gU "$binary" 2>&1)"; then
    log "nm failed while reading ${label}:"
    printf '%s\n' "$RNFB_PROBE_DEFINED_SYMBOLS"
    fail "could not validate ${label} symbols with nm (${binary})"
  fi
  if [[ -z "$RNFB_PROBE_DEFINED_SYMBOLS" && "$allow_empty" != "1" ]]; then
    fail "nm returned no global defined symbols for ${label} (${binary}); refusing to treat the graph as clean"
  fi
}

# rnfb_probe_assert_rnfbapp_without_firapp <RNFBApp.framework/RNFBApp>
# Match the ObjC class symbol for Firebase's FIRApp only, not Swift mangled
# names that merely contain "FIRApp" (RNFBFIRAppLifecycle, RCTConvertFIRApp, ...).
rnfb_probe_assert_rnfbapp_without_firapp() {
  local binary="$1"

  rnfb_probe_read_defined_symbols "$binary" "RNFBApp.framework"
  if grep -E -q "$RNFB_PROBE_FIRAPP_ANY_REGEX" <<<"$RNFB_PROBE_DEFINED_SYMBOLS"; then
    log "RNFBApp still defines FIRApp class symbols:"
    grep -E "$RNFB_PROBE_FIRAPP_ANY_REGEX" <<<"$RNFB_PROBE_DEFINED_SYMBOLS"
    fail "nm found FIRApp defined inside RNFBApp.framework (${binary})"
  fi
  log "nm: no _OBJC_CLASS_\$_FIRApp in RNFBApp.framework"
}

# rnfb_probe_assert_umbrella_defines_firapp <RNFBFirebase.framework/RNFBFirebase>
rnfb_probe_assert_umbrella_defines_firapp() {
  local binary="$1"
  local firapp_lines

  rnfb_probe_read_defined_symbols "$binary" "RNFBFirebase.framework"
  if ! firapp_lines="$(grep -E "$RNFB_PROBE_FIRAPP_CLASS_REGEX" <<<"$RNFB_PROBE_DEFINED_SYMBOLS")"; then
    fail "nm found no _OBJC_CLASS_\$_FIRApp defined in RNFBFirebase.framework (${binary}); FirebaseCore is not linked into the probe facade, so the single-copy claim does not hold"
  fi
  log "nm: RNFBFirebase.framework defines FIRApp:"
  printf '%s\n' "$firapp_lines"
}

# rnfb_probe_assert_no_standalone_firebasecore <products-dir>
# On the shipped path FirebaseCore is its own framework, named
# FirebaseCore_<hash>_PackageProduct.framework (SPM package product).
# The probe folds it into RNFBFirebase.framework, so none may be present in
# the products. FirebaseCore.framework is matched too for non-SPM layouts.
rnfb_probe_assert_no_standalone_firebasecore() {
  local products_dir="$1"
  local standalone

  [[ -d "$products_dir" ]] || fail "products dir was not found: ${products_dir}"
  if ! standalone="$(find "$products_dir" \( -name 'FirebaseCore.framework' -o -name 'FirebaseCore_*_PackageProduct.framework' \) -print 2>&1)"; then
    log "find failed while scanning ${products_dir}:"
    printf '%s\n' "$standalone"
    fail "could not scan ${products_dir} for a standalone FirebaseCore framework"
  fi
  if [[ -n "$standalone" ]]; then
    log "standalone FirebaseCore framework found:"
    printf '%s\n' "$standalone"
    fail "standalone FirebaseCore framework exists under ${products_dir}; FirebaseCore must only live inside RNFBFirebase.framework in the probe"
  fi
  log "no standalone FirebaseCore framework under ${products_dir}"
}

# rnfb_probe_resolve_framework_binary <framework-dir>
# Sets RNFB_PROBE_RESOLVED_BINARY (and RNFB_PROBE_RESOLVED_VIA) to the main
# binary of <Name>.framework, or returns 1 with RNFB_PROBE_RESOLVE_ERROR set.
# Resolution order:
#   1. <dir>/<Name>. Also covers the macOS Versions/A layout, where that path
#      is a symlink into Versions/Current (-f follows it).
#   2. CFBundleExecutable from Info.plist (<dir>/, <dir>/Resources/, or
#      <dir>/Versions/Current/Resources/), read with plutil when it is on PATH.
#   3. The single non-symlink Mach-O or static archive anywhere in the dir
#      (.dSYM and _CodeSignature excluded). Zero or several is unresolved.
rnfb_probe_resolve_framework_binary() {
  local fw_dir="$1"
  local name="${fw_dir##*/}"
  local plist exec_name entries entry kind
  local found=""
  local count=0

  name="${name%.framework}"
  RNFB_PROBE_RESOLVED_BINARY=""
  RNFB_PROBE_RESOLVED_VIA=""
  RNFB_PROBE_RESOLVE_ERROR=""

  if [[ -f "$fw_dir/$name" ]]; then
    RNFB_PROBE_RESOLVED_BINARY="$fw_dir/$name"
    RNFB_PROBE_RESOLVED_VIA="directory name"
    return 0
  fi

  if command -v plutil >/dev/null 2>&1; then
    for plist in "$fw_dir/Info.plist" "$fw_dir/Resources/Info.plist" "$fw_dir/Versions/Current/Resources/Info.plist"; do
      [[ -f "$plist" ]] || continue
      if exec_name="$(plutil -extract CFBundleExecutable raw -o - "$plist" 2>/dev/null)" &&
        [[ -n "$exec_name" && "$exec_name" != */* && -f "$fw_dir/$exec_name" ]]; then
        RNFB_PROBE_RESOLVED_BINARY="$fw_dir/$exec_name"
        RNFB_PROBE_RESOLVED_VIA="CFBundleExecutable"
        return 0
      fi
    done
  fi

  if ! entries="$(find "$fw_dir" -type f -not -path '*.dSYM/*' -not -path '*/_CodeSignature/*' 2>&1)"; then
    RNFB_PROBE_RESOLVE_ERROR="find failed: ${entries}"
    return 1
  fi
  entries="$(LC_ALL=C sort <<<"$entries")"
  while IFS= read -r entry; do
    [[ -n "$entry" ]] || continue
    if ! kind="$(file -b "$entry" 2>&1)"; then
      RNFB_PROBE_RESOLVE_ERROR="file failed on ${entry}: ${kind}"
      return 1
    fi
    if [[ "$kind" == *Mach-O* || "$kind" == *"ar archive"* ]]; then
      count=$((count + 1))
      found="$entry"
    fi
  done <<<"$entries"
  if [[ "$count" -eq 1 ]]; then
    RNFB_PROBE_RESOLVED_BINARY="$found"
    RNFB_PROBE_RESOLVED_VIA="only Mach-O in directory"
    return 0
  fi
  RNFB_PROBE_RESOLVE_ERROR="no ${name} binary, no usable CFBundleExecutable, and ${count} Mach-O candidates (need exactly 1)"
  return 1
}

# rnfb_probe_assert_firapp_only_in_umbrella <products-dir> [app-executable ...]
# Sweeps the main binary of every `*.framework` directory under the products
# dir, in any location (PackageFrameworks/, testrnbare.app/Frameworks/, pod
# product dirs), and requires that every binary defining FIRApp lives in an
# RNFBFirebase.framework directory. Each app executable argument (the
# testrnbare.app/testrnbare binary) must be a Mach-O that does not define
# FIRApp at all. This is the content-based counterpart of the name-based
# standalone FirebaseCore check: it also catches FirebaseCore statically linked
# into some other framework or into the app executable.
# One log line per scanned binary. Every framework directory is accounted for:
# the main binary is scanned, or it is a non-Mach-O resource file (logged and
# skipped), or the directory fails the sweep naming the directory. .dSYM
# contents are excluded. A Mach-O that nm cannot read fails. An nm result with
# no symbols is accepted for frameworks (a Mach-O with no exports cannot define
# FIRApp) but not for the app executable.
rnfb_probe_assert_firapp_only_in_umbrella() {
  local products_dir="$1"
  shift
  local fw_dirs fw_dir fw_name binary kind extra
  local total=0
  local scanned=0
  local skipped=0
  local extras_scanned=0
  local allowed=""
  local offenders=""

  [[ -d "$products_dir" ]] || fail "products dir was not found: ${products_dir}"
  # Capture before looping so a find failure is not hidden by a pipeline.
  if ! fw_dirs="$(find "$products_dir" -type d -name '*.framework' -not -path '*.dSYM/*' 2>&1)"; then
    log "find failed while scanning ${products_dir}:"
    printf '%s\n' "$fw_dirs"
    fail "could not scan ${products_dir} for framework directories"
  fi
  fw_dirs="$(LC_ALL=C sort <<<"$fw_dirs")"

  while IFS= read -r fw_dir; do
    [[ -n "$fw_dir" ]] || continue
    total=$((total + 1))
    fw_name="${fw_dir##*/}"

    if ! rnfb_probe_resolve_framework_binary "$fw_dir"; then
      fail "nm sweep could not resolve the main binary of ${fw_dir}: ${RNFB_PROBE_RESOLVE_ERROR}"
    fi
    binary="$RNFB_PROBE_RESOLVED_BINARY"

    # -L: a Versions/Current symlink layout reports the target, not "symbolic link".
    if ! kind="$(file -b -L "$binary" 2>&1)"; then
      log "file failed while identifying ${binary}:"
      printf '%s\n' "$kind"
      fail "could not identify framework binary type (${binary})"
    fi
    if [[ "$kind" != *Mach-O* && "$kind" != *"ar archive"* ]]; then
      skipped=$((skipped + 1))
      log "nm sweep: ${binary}: skipped, not Mach-O or archive (${kind})"
      continue
    fi

    scanned=$((scanned + 1))
    rnfb_probe_read_defined_symbols "$binary" "framework binary ${binary}" 1
    if grep -E -q "$RNFB_PROBE_FIRAPP_ANY_REGEX" <<<"$RNFB_PROBE_DEFINED_SYMBOLS"; then
      if [[ "$fw_name" == "RNFBFirebase.framework" ]]; then
        log "nm sweep: ${binary}: defines FIRApp (allowed, RNFBFirebase.framework)"
        allowed+="${binary}"$'\n'
      else
        log "nm sweep: ${binary}: defines FIRApp (NOT allowed)"
        offenders+="${binary}"$'\n'
      fi
    else
      log "nm sweep: ${binary}: no FIRApp"
    fi
  done <<<"$fw_dirs"

  if [[ $((scanned + skipped)) -ne "$total" ]]; then
    fail "nm sweep accounted for $((scanned + skipped)) of ${total} framework directories under ${products_dir}"
  fi
  if [[ "$scanned" -eq 0 ]]; then
    fail "nm sweep found no Mach-O framework binaries under ${products_dir}; refusing to treat the graph as clean"
  fi

  for extra in "$@"; do
    [[ -f "$extra" ]] || fail "app executable was not found: ${extra}"
    if ! kind="$(file -b -L "$extra" 2>&1)"; then
      log "file failed while identifying ${extra}:"
      printf '%s\n' "$kind"
      fail "could not identify app executable type (${extra})"
    fi
    if [[ "$kind" != *Mach-O* ]]; then
      fail "app executable is not a Mach-O (${extra}): ${kind}"
    fi
    extras_scanned=$((extras_scanned + 1))
    rnfb_probe_read_defined_symbols "$extra" "app executable ${extra}"
    if grep -E -q "$RNFB_PROBE_FIRAPP_ANY_REGEX" <<<"$RNFB_PROBE_DEFINED_SYMBOLS"; then
      log "nm sweep: ${extra}: defines FIRApp (NOT allowed, app executable)"
      offenders+="${extra}"$'\n'
    else
      log "nm sweep: ${extra}: no FIRApp (app executable)"
    fi
  done

  if [[ -n "$offenders" ]]; then
    log "binaries outside RNFBFirebase.framework that define FIRApp:"
    printf '%s' "$offenders"
    fail "nm sweep found FIRApp defined outside RNFBFirebase.framework; FirebaseCore must be linked once. Offending binaries: ${offenders//$'\n'/ }"
  fi
  log "nm sweep: ${total} framework directories, scanned ${scanned} framework binaries (${skipped} non-Mach-O skipped) plus ${extras_scanned} app executable(s); FIRApp defined only in:"
  printf '%s' "$allowed"
}

# rnfb_probe_assert_single_firebase_copy <probe-flag> <products-dir> <umbrella-binary> <rnfbapp-binary> <app-executable>
# No-op unless probe-flag is 1: the shipped path has no RNFBFirebase facade;
# FIRApp is defined in RNFBApp.framework and in a standalone FirebaseCore
# package-product framework. The app executable is required (flag 1 fails
# without it) so the sweep always covers it.
rnfb_probe_assert_single_firebase_copy() {
  local probe_flag="$1"
  local products_dir="$2"
  local umbrella_binary="$3"
  local rnfbapp_binary="$4"
  local app_binary="${5:-}"

  if [[ "$probe_flag" != "1" ]]; then
    return 0
  fi
  log "--- dynamic probe single-copy FirebaseCore checks ---"
  [[ -n "$app_binary" ]] || fail "single-copy check was called without the app executable path"
  rnfb_probe_assert_rnfbapp_without_firapp "$rnfbapp_binary"
  rnfb_probe_assert_umbrella_defines_firapp "$umbrella_binary"
  rnfb_probe_assert_no_standalone_firebasecore "$products_dir"
  rnfb_probe_assert_firapp_only_in_umbrella "$products_dir" "$app_binary"
}
