#!/bin/bash
# Configure tests/ios/Podfile for the CI dependency-resolution matrix leg (spm vs cocoapods).
# Shared by both "Configure Dependency Resolution Mode" steps in tests_e2e_ios.yml
# (the `ios` job and the `ios-release-archive` job) so the two legs can't drift apart.
#
# Usage: configure-ios-dep-resolution.sh <spm|cocoapods> [podfile-dir]
#   podfile-dir defaults to tests/ios, since every caller in tests_e2e_ios.yml runs
#   with the workflow's default working directory (the repo root).
#
# spm mode is a no-op: the checked-in Podfile already resolves Firebase via SPM
# (dynamic linkage, no $RNFirebaseDisableSPM flag -- see packages/app/firebase_spm.rb).
#
# cocoapods mode patches the Podfile to force static linkage and disable SPM
# resolution. Each patch is grep-verified immediately after being applied, so a future
# change to the Podfile's wording (e.g. reformatting `linkage = 'dynamic'`) fails this
# script loudly instead of silently leaving the "cocoapods" CI leg testing the SPM path
# a second time.
set -euo pipefail

log_dep_resolution() {
  echo "[dep-resolution] $*"
}

configure_cocoapods_mode() {
  local podfile_dir="$1"
  local podfile="${podfile_dir}/Podfile"

  log_dep_resolution "configuring CocoaPods-only mode (disabling SPM) in ${podfile}"

  sed -i '' "s/^linkage = 'dynamic'/linkage = 'static'/" "$podfile"
  grep -q "^linkage = 'static'" "$podfile" || {
    log_dep_resolution "ERROR: expected \"linkage = 'static'\" in ${podfile} after sed, but it was not found -- has the Podfile's linkage line wording changed?"
    exit 1
  }

  printf '%s\n' '$RNFirebaseDisableSPM = true' | cat - "$podfile" > "${podfile}.tmp" && mv "${podfile}.tmp" "$podfile"
  local first_line
  first_line="$(head -n 1 "$podfile")"
  [[ "$first_line" == '$RNFirebaseDisableSPM = true' ]] || {
    log_dep_resolution "ERROR: expected the first line of ${podfile} to be '\$RNFirebaseDisableSPM = true' after prepend, got: ${first_line}"
    exit 1
  }

  log_dep_resolution "Podfile configured for CocoaPods-only mode"
}

configure_spm_mode() {
  log_dep_resolution "using default SPM mode (dynamic linkage)"
}

MODE="${1:-}"
PODFILE_DIR="${2:-tests/ios}"

case "$MODE" in
  cocoapods)
    configure_cocoapods_mode "$PODFILE_DIR"
    ;;
  spm)
    configure_spm_mode
    ;;
  *)
    log_dep_resolution "ERROR: unrecognized dependency-resolution mode '${MODE}' (expected 'spm' or 'cocoapods')"
    exit 1
    ;;
esac
