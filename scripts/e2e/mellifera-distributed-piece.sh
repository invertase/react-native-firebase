#!/usr/bin/env bash
# Run one distributed-e2e piece on a synced remote checkout, from its repo root.
# Runbook: okf-bundle/testing/running-e2e-distributed.md § distributed e2e run.
#
# Usage (through exec on the synced tree):
#   yarn tests:mellifera:exec --session ID -w DIR -- bash scripts/e2e/mellifera-distributed-piece.sh <android|ios|macos> [SLOT]
#   bash scripts/e2e/mellifera-distributed-piece.sh <android|ios|macos> [SLOT] --dry-run
#
# SLOT is the grant's slot when placement is "slot"; omit it when placement is
# "host" (the whole guest, serial defaults). Every step is a canonical
# `yarn tests:*` command in one shell, so the emulator suite and Metro outlive
# the steps that start them. The first failing step's status is the exit
# status. Scoped `yarn tests:e2e:release --devices` always runs last.
# --dry-run prints the steps, one per line, and runs nothing.
#
# The android piece first creates the serial base AVD (TestingAVD) when it is
# missing, matching CI: system image android-36 google_apis, no device profile.
# The ABI follows the host (x86_64, or arm64-v8a on arm64). Override with
# RNFB_ANDROID_AVD_API / RNFB_ANDROID_AVD_TARGET / RNFB_ANDROID_AVD_ABI.
# `ensure-avd` runs only that step.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
USAGE="usage: mellifera-distributed-piece.sh <android|ios|macos|ensure-avd> [SLOT] [--dry-run]"
BASE_AVD="TestingAVD"

PLATFORM=""
SLOT=""
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    android | ios | macos | ensure-avd)
      [[ -z "$PLATFORM" ]] || { echo "$USAGE" >&2; exit 2; }
      PLATFORM="$arg"
      ;;
    *)
      if [[ "$arg" =~ ^[0-9]+$ && -z "$SLOT" ]]; then
        SLOT="$arg"
      else
        echo "$USAGE" >&2
        exit 2
      fi
      ;;
  esac
done
[[ -n "$PLATFORM" ]] || { echo "$USAGE" >&2; exit 2; }

cd "$REPO_ROOT" || exit 1

step() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "$*"
    return 0
  fi
  echo "mellifera-distributed-piece: $*" >&2
  "$@"
}

metro_running() {
  local port="${RCT_METRO_PORT:-${RNFB_METRO_PORT:-8081}}"
  curl -sf "http://127.0.0.1:${port}/status" | grep -q 'packager-status:running'
}

# ANDROID_HOME, else ANDROID_SDK_ROOT, else the platform default: the macOS
# Android Studio path, or on Linux the GitHub-hosted runner path CI uses.
resolve_android_home() {
  local sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
  if [[ -z "$sdk" ]]; then
    case "$(uname -s)" in
      Darwin) sdk="$HOME/Library/Android/sdk" ;;
      Linux) sdk="/usr/local/lib/android/sdk" ;;
    esac
  fi
  if [[ -z "$sdk" || ! -d "$sdk" ]]; then
    echo "mellifera-distributed-piece: Android SDK not found${sdk:+ at $sdk}; set ANDROID_HOME" >&2
    return 1
  fi
  export ANDROID_HOME="$sdk" ANDROID_SDK_ROOT="$sdk"
}

ensure_testing_avd() {
  resolve_android_home || return $?
  local sdk="$ANDROID_HOME"
  local emu="${sdk}/emulator/emulator"
  local tools="${sdk}/cmdline-tools/latest/bin"
  local api="${RNFB_ANDROID_AVD_API:-36}"
  local target="${RNFB_ANDROID_AVD_TARGET:-google_apis}"
  local abi="${RNFB_ANDROID_AVD_ABI:-}"
  if [[ -z "$abi" ]]; then
    case "$(uname -m)" in
      arm64 | aarch64) abi=arm64-v8a ;;
      *) abi=x86_64 ;;
    esac
  fi
  local pkg="system-images;android-${api};${target};${abi}"
  if [[ ! -x "$emu" || ! -x "${tools}/sdkmanager" || ! -x "${tools}/avdmanager" ]]; then
    echo "mellifera-distributed-piece: emulator or cmdline-tools missing under ${sdk} (set ANDROID_HOME)" >&2
    return 1
  fi
  if "$emu" -list-avds 2>/dev/null | grep -qx "$BASE_AVD"; then
    echo "mellifera-distributed-piece: ${BASE_AVD} already exists" >&2
    return 0
  fi
  echo "mellifera-distributed-piece: creating ${BASE_AVD} from ${pkg}" >&2
  yes 2>/dev/null | "${tools}/sdkmanager" --licenses >/dev/null
  "${tools}/sdkmanager" --install "$pkg" "emulator" "platform-tools" || return $?
  echo no | "${tools}/avdmanager" create avd --force -n "$BASE_AVD" --abi "${target}/${abi}" --package "$pkg" || return $?
  "$emu" -list-avds | grep -qx "$BASE_AVD"
}

# CI installs these from the vendored tap (install-homebrew-rnfb.sh).
ensure_brew_utilities() {
  local missing=()
  local tool
  for tool in "$@"; do
    command -v "$tool" >/dev/null 2>&1 || missing+=("$tool")
  done
  [[ ${#missing[@]} -eq 0 ]] && return 0
  if ! command -v brew >/dev/null 2>&1; then
    echo "mellifera-distributed-piece: missing ${missing[*]} and Homebrew is not installed; install brew or those tools" >&2
    return 1
  fi
  bash .github/workflows/scripts/install-homebrew-rnfb.sh "${missing[@]}"
}

# Checks only; never downloads Xcode or simulator runtimes.
check_apple_toolchain() {
  if ! xcodebuild -version >/dev/null 2>&1; then
    echo "mellifera-distributed-piece: Xcode not found (xcodebuild -version failed); select Xcode ${RNFB_XCODE_VERSION:-27.0}" >&2
    return 1
  fi
  [[ "$1" == ios ]] || return 0
  local runtime="${RNFB_IOS_SIM_RUNTIME:-iOS 27.0}"
  local device="${RNFB_IOS_BASE_SIMULATOR:-iPhone 17}"
  if ! xcrun simctl list runtimes 2>/dev/null | grep -F "$runtime " | grep -qv unavailable; then
    echo "mellifera-distributed-piece: simulator runtime \"$runtime\" is not installed (RNFB_IOS_SIM_RUNTIME)" >&2
    return 1
  fi
  if ! xcrun simctl list devicetypes 2>/dev/null | grep -qF "$device ("; then
    echo "mellifera-distributed-piece: simulator device type \"$device\" is not available in this Xcode" >&2
    return 1
  fi
}

load_env() {
  if [[ -n "$SLOT" ]]; then
    [[ "$DRY_RUN" -eq 1 ]] && { echo "eval export-slot-env ${PLATFORM} ${SLOT}"; return 0; }
    eval "$(bash "${SCRIPT_DIR}/export-slot-env.sh" "$PLATFORM" "$SLOT")"
  else
    [[ "$DRY_RUN" -eq 1 ]] && { echo "eval clear-slot-env"; return 0; }
    eval "$(bash "${SCRIPT_DIR}/clear-slot-env.sh")"
  fi
}

services() {
  local packager="$1"
  step yarn tests:e2e:check "--platform=${PLATFORM}" || return $?
  step yarn tests:emulator:start || return $?
  step yarn "$packager" || return $?
  step metro_running || return $?
}

# CI boots TestingAVD through android-emulator-runner v2.38.0 with these
# default emulator-options; here Detox boots it, so they go through the
# .detoxrc.js boot-args env. -no-snapshot covers both snapshot load and save.
CI_EMULATOR_OPTIONS="-no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim"

check_kvm() {
  [[ "$(uname -s)" == Linux ]] || return 0
  if [[ ! -e /dev/kvm ]]; then
    echo "mellifera-distributed-piece: /dev/kvm is missing; this guest has no KVM (nested virtualization off)" >&2
    return 1
  fi
  if [[ ! -r /dev/kvm || ! -w /dev/kvm ]]; then
    echo "mellifera-distributed-piece: /dev/kvm is not read/write for $(id -un); grant kvm group access" >&2
    return 1
  fi
}

headless_emulator() {
  if [[ -n "${RNFB_ANDROID_EMULATOR_BOOT_ARGS:-}" ]]; then
    [[ "$DRY_RUN" -eq 1 ]] && echo "keep RNFB_ANDROID_EMULATOR_BOOT_ARGS"
    return 0
  fi
  [[ "$DRY_RUN" -eq 1 ]] && echo "export RNFB_ANDROID_EMULATOR_BOOT_ARGS=$CI_EMULATOR_OPTIONS"
  export RNFB_ANDROID_EMULATOR_BOOT_ARGS="$CI_EMULATOR_OPTIONS"
}

piece_android() {
  step check_kvm || return $?
  headless_emulator
  step ensure_testing_avd || return $?
  step yarn tests:e2e:release --devices || return $?
  [[ -z "$SLOT" ]] || step yarn tests:e2e:setup-android-avds "$((SLOT + 1))" || return $?
  step yarn tests:android:unit || return $?
  step yarn tests:android:build || return $?
  services tests:packager:jet || return $?
  after_e2e tests:android:post-e2e-coverage yarn tests:android:test-cover
}

# CI shape: coverage runs after the suite even when it failed; the suite exit
# wins, and a coverage failure fails only an otherwise green run.
after_e2e() {
  local coverage="$1"
  shift
  local test_ec=0 cov_ec=0
  step "$@" || test_ec=$?
  step yarn "$coverage" || cov_ec=$?
  [[ "$test_ec" -ne 0 ]] && return "$test_ec"
  return "$cov_ec"
}

piece_ios() {
  step check_apple_toolchain ios || return $?
  step ensure_brew_utilities applesimutils xcbeautify || return $?
  step yarn ruby:install || return $?
  step yarn tests:ios:ruby || return $?
  step yarn tests:ios:unit || return $?
  step yarn tests:ios:pod:install || return $?
  step env SKIP_BUNDLING=1 RCT_NO_LAUNCH_PACKAGER=1 yarn tests:ios:build || return $?
  [[ -z "$SLOT" ]] || step yarn tests:e2e:setup-ios-sims "$((SLOT + 1))" || return $?
  services tests:packager:jet || return $?
  after_e2e tests:ios:test:process-coverage yarn tests:ios:test-cover
}

piece_macos() {
  step check_apple_toolchain macos || return $?
  step ensure_brew_utilities xcbeautify || return $?
  step yarn ruby:install || return $?
  step yarn tests:macos:pod:install || return $?
  step env SKIP_BUNDLING=1 RCT_NO_LAUNCH_PACKAGER=1 yarn tests:macos:build || return $?
  services tests:macos:packager:jet || return $?
  step yarn tests:macos:test-cover
}

if [[ "$PLATFORM" == ensure-avd ]]; then
  step ensure_testing_avd
  exit $?
fi

load_env || exit $?
ec=0
"piece_${PLATFORM}" || ec=$?
step yarn tests:e2e:release --devices
release_ec=$?
if [[ "$ec" -eq 0 ]]; then
  ec="$release_ec"
fi
exit "$ec"
