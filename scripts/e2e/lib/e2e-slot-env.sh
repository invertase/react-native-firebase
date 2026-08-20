#!/usr/bin/env bash
# Slotted e2e port + device identity helpers (shared by export/run scripts).
#
# Port formula (proven): BASE=12000+slot*1000; android OFF=0, ios +100, macos +200.
# Within a platform block: firestore..logging = BLK+0..6, metro=+7, jet=+10, jet-control=+11.
# Firestore websocket / eventarc / tasks = FS+8/+9/+12 (same as start-emulator-slotted.sh).
#
# Unscoped host wipe (no slot env) clears leftover ports/devices for slots 0..E2E_SLOTTED_MAX.
E2E_SLOTTED_MAX="${E2E_SLOTTED_MAX:-${E2E_MACOS_SLOTTED_MAX:-7}}"
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

# Platform block origin: BASE + android|ios|macos offset.
e2e_slot_blk() {
  local plat=$1
  local slot=$2
  local base off
  off=$(e2e_slot_platform_offset "$plat") || return 1
  base=$(e2e_slot_base "$slot")
  echo $((base + off))
}

# Print "label port" lines for one platform×slot (emulator suite + metro/jet + aux).
e2e_slot_block_port_lines() {
  local plat=$1
  local slot=$2
  local blk tag
  blk=$(e2e_slot_blk "$plat" "$slot") || return 1
  tag="${plat}-slot${slot}"
  printf 'emulator-firestore:%s %s\n' "$tag" "$((blk + 0))"
  printf 'emulator-auth:%s %s\n' "$tag" "$((blk + 1))"
  printf 'emulator-database:%s %s\n' "$tag" "$((blk + 2))"
  printf 'emulator-functions:%s %s\n' "$tag" "$((blk + 3))"
  printf 'emulator-storage:%s %s\n' "$tag" "$((blk + 4))"
  printf 'emulator-hub:%s %s\n' "$tag" "$((blk + 5))"
  printf 'emulator-logging:%s %s\n' "$tag" "$((blk + 6))"
  printf 'metro:%s %s\n' "$tag" "$((blk + 7))"
  printf 'emulator-firestore-websocket:%s %s\n' "$tag" "$((blk + 8))"
  printf 'emulator-eventarc:%s %s\n' "$tag" "$((blk + 9))"
  printf 'jet:%s %s\n' "$tag" "$((blk + 10))"
  printf 'jet-control:%s %s\n' "$tag" "$((blk + 11))"
  printf 'emulator-tasks:%s %s\n' "$tag" "$((blk + 12))"
}

# Even emulator console port in adb's safe range [5554, 5584].
# Do not use 5554 for slotted slot 0 — that serial (TestingAVD / emulator-5554)
# must be able to coexist. Formula: 5556 + 2*slot → 0=5556, 1=5558, 2=5560.
e2e_slot_android_console_port() {
  local slot=$1
  echo $((5556 + 2 * slot))
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
# Always exports android+ios+macos port blocks (babel inline + shared worktree) AND
# slot device identities for all three platforms so check/release stay slot-scoped
# even when the active platform is only android or ios (not macos).
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

  # Orchestration label must stay unset (babel carry-in). Clear process-local device
  # binds that belong only to the active platform process; slot identities below.
  unset RNFB_E2E_PLATFORM
  unset SIMCTL_CHILD_RCT_METRO_PORT AVD_NAME ORG_GRADLE_PROJECT_reactNativeDevServerPort

  export RNFB_E2E_SLOT="$slot" RNFB_E2E_HOST_SLOT="$slot" RNFB_E2E_DEBUG="${RNFB_E2E_DEBUG:-1}"
  export RCT_METRO_PORT="$metro" RNFB_METRO_PORT="$metro" JET_METRO_PORT="$metro"
  export JET_REMOTE_PORT="$jet" RNFB_JET_CONTROL_PORT="$jc"

  # Slot-owned device / process identity for every platform in this worktree wave.
  # Slotted slot 0 uses TestingAVD-0 / RNFB E2E iOS slot-0 (not serial TestingAVD /
  # iPhone 17) so a slotted wave can run beside an unslotted serial run safely.
  # check/release use these so a slot-N env never falls back to serial defaults
  # that would hit other slots or wipe-all .s0..sN.
  export RNFB_DETOX_ANDROID_CONFIG="android.emu.debug.slot${slot}"
  export RNFB_ANDROID_AVD="TestingAVD-${slot}" RNFB_ANDROID_AVD_NAME="TestingAVD-${slot}"
  # Pin qemu -port / adb serial so Detox does not pick FreePortFinder 10000–20000
  # (outside adb's emulator console range). check/release need ANDROID_SERIAL.
  export RNFB_ANDROID_CONSOLE_PORT="$(e2e_slot_android_console_port "$slot")"
  export ANDROID_SERIAL="emulator-${RNFB_ANDROID_CONSOLE_PORT}"
  export RNFB_DETOX_IOS_CONFIG="ios.sim.debug.slot${slot}"
  export RNFB_IOS_SIMULATOR="RNFB E2E iOS slot-${slot}"
  export RNFB_MACOS_PRODUCT_NAME="${RNFB_MACOS_PRODUCT_NAME_OVERRIDE:-io.invertase.testing.s${slot}}"
  export RNFB_MACOS_BUNDLE_IDENTIFIER="${RNFB_MACOS_BUNDLE_IDENTIFIER_OVERRIDE:-org.reactjs.native.${RNFB_MACOS_PRODUCT_NAME//./-}}"

  case "$platform" in
    android)
      export AVD_NAME="$RNFB_ANDROID_AVD" ORG_GRADLE_PROJECT_reactNativeDevServerPort="$metro"
      ;;
    ios)
      export SIMCTL_CHILD_RCT_METRO_PORT="$metro"
      ;;
    macos)
      ;;
  esac
}

# Print `export KEY=value` / `unset KEY` lines suitable for:
#   eval "$(bash …/export-slot-env.sh macos 1)"
# Must emit unset for process-local leftovers that e2e_slot_env_apply clears —
# otherwise a dirty parent shell (stale AVD_NAME, etc.) keeps poisoning
# check/release after eval. ANDROID_SERIAL / RNFB_ANDROID_CONSOLE_PORT are
# pinned for the slot (emulator-$((5556+2*slot))) and must be exported.
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
    RNFB_DETOX_ANDROID_CONFIG RNFB_ANDROID_AVD RNFB_ANDROID_AVD_NAME
    RNFB_ANDROID_CONSOLE_PORT ANDROID_SERIAL
    RNFB_DETOX_IOS_CONFIG RNFB_IOS_SIMULATOR
    RNFB_MACOS_PRODUCT_NAME RNFB_MACOS_BUNDLE_IDENTIFIER
  )
  local k
  for k in "${keys[@]}"; do
    if [[ -n "${!k:-}" ]]; then
      printf 'export %s=%q\n' "$k" "${!k}"
    fi
  done
  # Process-local / orchestration leftovers apply() clears — export if re-set for
  # this active platform, otherwise unset so parent leftovers cannot stick.
  local clear_keys=(
    RNFB_E2E_PLATFORM
    AVD_NAME
    SIMCTL_CHILD_RCT_METRO_PORT
    ORG_GRADLE_PROJECT_reactNativeDevServerPort
  )
  for k in "${clear_keys[@]}"; do
    if [[ -n "${!k:-}" ]]; then
      printf 'export %s=%q\n' "$k" "${!k}"
    else
      printf 'unset %s\n' "$k"
    fi
  done
}
