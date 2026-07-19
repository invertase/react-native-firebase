#!/usr/bin/env bash
# Slotted e2e port + device identity helpers (shared by export/run scripts).
#
# Port formula (proven): BASE=12000+slot*1000; android OFF=0, ios +100, macos +200.
# Within a platform block: firestore..logging = BLK+0..6, metro=+7, jet=+10, jet-control=+11.
# Firestore websocket / eventarc / tasks are derived in start-emulator-slotted.sh (FS+8/+9/+12).
#
# macOS: concurrent slots require distinct PRODUCT_NAME via RNFB_MACOS_PRODUCT_NAME
# (io.invertase.testing.s${SLOT}). Do not pass PRODUCT_NAME= on the xcodebuild CLI —
# yarn tests:macos:build derives RNFB_MACOS_PRODUCT_NAME_SUFFIX for pbxproj expansion.
#
# shellcheck shell=bash

e2e_slot_platform_offset() {
  case "$1" in
    android) echo 0 ;;
    ios) echo 100 ;;
    macos) echo 200 ;;
    *)
      echo "error: platform must be android|ios|macos (got $1)" >&2
      return 1
      ;;
  esac
}

e2e_slot_base() {
  local slot=$1
  echo $((12000 + slot * 1000))
}

# Export one platform's full RNFB_<PLATFORM>_* port block into the current shell.
e2e_slot_export_platform_block() {
  local plat=$1
  local off=$2
  local base=$3
  local up blk fs auth db fn st hub log metro jet jc
  up=$(echo "$plat" | tr '[:lower:]' '[:upper:]')
  blk=$((base + off))
  fs=$((blk + 0))
  auth=$((blk + 1))
  db=$((blk + 2))
  fn=$((blk + 3))
  st=$((blk + 4))
  hub=$((blk + 5))
  log=$((blk + 6))
  metro=$((blk + 7))
  jet=$((blk + 10))
  jc=$((blk + 11))
  export "RNFB_${up}_METRO_PORT=$metro"
  export "RNFB_${up}_JET_PORT=$jet"
  export "RNFB_${up}_JET_CONTROL_PORT=$jc"
  export "RNFB_${up}_EMULATOR_FIRESTORE_PORT=$fs"
  export "RNFB_${up}_EMULATOR_AUTH_PORT=$auth"
  export "RNFB_${up}_EMULATOR_DATABASE_PORT=$db"
  export "RNFB_${up}_EMULATOR_FUNCTIONS_PORT=$fn"
  export "RNFB_${up}_EMULATOR_STORAGE_PORT=$st"
  export "RNFB_${up}_EMULATOR_HUB_PORT=$hub"
  export "RNFB_${up}_EMULATOR_LOGGING_PORT=$log"
}

# Apply full multi-platform carry-in + process-local binds for the active platform/slot.
# Always exports android+ios+macos port blocks (babel inline + shared worktree).
e2e_slot_env_apply() {
  local platform=$1
  local slot=$2
  local base off blk metro jet jc

  base=$(e2e_slot_base "$slot")
  off=$(e2e_slot_platform_offset "$platform") || return 1
  blk=$((base + off))
  metro=$((blk + 7))
  jet=$((blk + 10))
  jc=$((blk + 11))

  e2e_slot_export_platform_block android 0 "$base"
  e2e_slot_export_platform_block ios 100 "$base"
  e2e_slot_export_platform_block macos 200 "$base"

  # Orchestration labels only — port selection uses Platform.* / Detox, not this.
  unset RNFB_E2E_PLATFORM RNFB_DETOX_ANDROID_CONFIG RNFB_DETOX_IOS_CONFIG
  unset RNFB_ANDROID_AVD RNFB_IOS_SIMULATOR SIMCTL_CHILD_RCT_METRO_PORT
  unset AVD_NAME ORG_GRADLE_PROJECT_reactNativeDevServerPort

  export RNFB_E2E_SLOT="$slot" RNFB_E2E_HOST_SLOT="$slot" RNFB_E2E_DEBUG="${RNFB_E2E_DEBUG:-1}"
  export RCT_METRO_PORT="$metro" RNFB_METRO_PORT="$metro" JET_METRO_PORT="$metro"
  export JET_REMOTE_PORT="$jet" RNFB_JET_CONTROL_PORT="$jc"

  case "$platform" in
    android)
      if [[ "$slot" == "0" ]]; then
        export RNFB_DETOX_ANDROID_CONFIG="android.emu.debug" RNFB_ANDROID_AVD="TestingAVD"
      else
        export RNFB_DETOX_ANDROID_CONFIG="android.emu.debug.slot${slot}" RNFB_ANDROID_AVD="TestingAVD-${slot}"
      fi
      export AVD_NAME="$RNFB_ANDROID_AVD" ORG_GRADLE_PROJECT_reactNativeDevServerPort="$metro"
      ;;
    ios)
      if [[ "$slot" == "0" ]]; then
        export RNFB_DETOX_IOS_CONFIG="ios.sim.debug" RNFB_IOS_SIMULATOR="iPhone 17"
      else
        export RNFB_DETOX_IOS_CONFIG="ios.sim.debug.slot${slot}" RNFB_IOS_SIMULATOR="RNFB E2E iOS slot-${slot}"
      fi
      export SIMCTL_CHILD_RCT_METRO_PORT="$metro"
      ;;
    macos)
      # Always derive from slot for slotted launchers. Ambient RNFB_MACOS_PRODUCT_NAME
      # from a prior shell must not stick to the wrong slot. Custom names: set
      # RNFB_MACOS_PRODUCT_NAME_OVERRIDE / RNFB_MACOS_BUNDLE_IDENTIFIER_OVERRIDE.
      export RNFB_MACOS_PRODUCT_NAME="${RNFB_MACOS_PRODUCT_NAME_OVERRIDE:-io.invertase.testing.s${slot}}"
      export RNFB_MACOS_BUNDLE_IDENTIFIER="${RNFB_MACOS_BUNDLE_IDENTIFIER_OVERRIDE:-org.reactjs.native.${RNFB_MACOS_PRODUCT_NAME//./-}}"
      ;;
  esac
}

# Print `export KEY=value` lines suitable for: eval "$(bash …/export-slot-env.sh macos 1)"
e2e_slot_env_print() {
  local platform=$1
  local slot=$2
  # Apply in a subshell-safe way: run apply then dump the relevant exports.
  e2e_slot_env_apply "$platform" "$slot" || return 1
  local keys=(
    RNFB_E2E_SLOT RNFB_E2E_HOST_SLOT RNFB_E2E_DEBUG
    RCT_METRO_PORT RNFB_METRO_PORT JET_METRO_PORT JET_REMOTE_PORT RNFB_JET_CONTROL_PORT
    RNFB_ANDROID_METRO_PORT RNFB_ANDROID_JET_PORT RNFB_ANDROID_JET_CONTROL_PORT
    RNFB_ANDROID_EMULATOR_FIRESTORE_PORT RNFB_ANDROID_EMULATOR_AUTH_PORT
    RNFB_ANDROID_EMULATOR_DATABASE_PORT RNFB_ANDROID_EMULATOR_FUNCTIONS_PORT
    RNFB_ANDROID_EMULATOR_STORAGE_PORT RNFB_ANDROID_EMULATOR_HUB_PORT
    RNFB_ANDROID_EMULATOR_LOGGING_PORT
    RNFB_IOS_METRO_PORT RNFB_IOS_JET_PORT RNFB_IOS_JET_CONTROL_PORT
    RNFB_IOS_EMULATOR_FIRESTORE_PORT RNFB_IOS_EMULATOR_AUTH_PORT
    RNFB_IOS_EMULATOR_DATABASE_PORT RNFB_IOS_EMULATOR_FUNCTIONS_PORT
    RNFB_IOS_EMULATOR_STORAGE_PORT RNFB_IOS_EMULATOR_HUB_PORT
    RNFB_IOS_EMULATOR_LOGGING_PORT
    RNFB_MACOS_METRO_PORT RNFB_MACOS_JET_PORT RNFB_MACOS_JET_CONTROL_PORT
    RNFB_MACOS_EMULATOR_FIRESTORE_PORT RNFB_MACOS_EMULATOR_AUTH_PORT
    RNFB_MACOS_EMULATOR_DATABASE_PORT RNFB_MACOS_EMULATOR_FUNCTIONS_PORT
    RNFB_MACOS_EMULATOR_STORAGE_PORT RNFB_MACOS_EMULATOR_HUB_PORT
    RNFB_MACOS_EMULATOR_LOGGING_PORT
    RNFB_DETOX_ANDROID_CONFIG RNFB_ANDROID_AVD AVD_NAME ORG_GRADLE_PROJECT_reactNativeDevServerPort
    RNFB_DETOX_IOS_CONFIG RNFB_IOS_SIMULATOR SIMCTL_CHILD_RCT_METRO_PORT
    RNFB_MACOS_PRODUCT_NAME RNFB_MACOS_BUNDLE_IDENTIFIER
  )
  local k
  for k in "${keys[@]}"; do
    if [[ -n "${!k:-}" ]]; then
      printf 'export %s=%q\n' "$k" "${!k}"
    fi
  done
  # Ensure orchestration label stays unset for multi-platform babel carry-in.
  printf 'unset RNFB_E2E_PLATFORM\n'
}
