#!/usr/bin/env bash
# Run one distributed-e2e piece on a synced remote checkout, from its repo root.
# Runbook: okf-bundle/testing/running-e2e-distributed.md § distributed e2e run.
#
# Usage (through exec on the synced tree):
#   yarn tests:mellifera:exec --session ID -w DIR -- bash scripts/e2e/mellifera-distributed-piece.sh <android|ios|macos> --placement=<slot|host> [SLOT]
#   bash scripts/e2e/mellifera-distributed-piece.sh <android|ios|macos> --placement=<slot|host> [SLOT] --dry-run
#
# --placement is the grant's `placement` from the reserve JSON and is required.
# `slot` (a desk slot) requires SLOT, the grant's slot; every release re-applies
# that slot's env and stops only its resources. `host` (the whole guest) takes
# no SLOT and uses serial defaults; its releases wipe the whole machine.
# Every step is a canonical `yarn tests:*` command in one shell, so the
# emulator suite and Metro outlive the steps that start them. The first
# failing step's status is the exit status. `yarn tests:e2e:release --devices`
# with the placement always runs last.
# --dry-run prints the steps, one per line, and runs nothing.
#
# The android piece first creates the serial base AVD (TestingAVD) when it is
# missing, matching CI: system image android-36 google_apis, no device profile.
# The ABI follows the host (x86_64, or arm64-v8a on arm64). Override with
# RNFB_ANDROID_AVD_API / RNFB_ANDROID_AVD_TARGET / RNFB_ANDROID_AVD_ABI. A new AVD,
# or an existing one under --placement=host, gets its userdata image created by one
# short headless launch before the build. Under --placement=host the build's
# Gradle daemons are stopped before the emulator boots; a failed suite saves
# the emulator's logcat. `ensure-avd` runs only the AVD step.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
USAGE="usage: mellifera-distributed-piece.sh <android|ios|macos> --placement=<slot|host> [SLOT] [--dry-run] | ensure-avd"
BASE_AVD="TestingAVD"

PLATFORM=""
PLACEMENT=""
SLOT=""
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --placement=slot | --placement=host) PLACEMENT="${arg#--placement=}" ;;
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
if [[ "$PLATFORM" != ensure-avd ]]; then
  case "$PLACEMENT" in
    slot)
      [[ -n "$SLOT" ]] || {
        echo "mellifera-distributed-piece: --placement=slot requires the grant's SLOT; refusing an unscoped release on a desk slot" >&2
        exit 2
      }
      RELEASE=(yarn tests:e2e:release --devices --placement=slot "--slot=${SLOT}")
      ;;
    host)
      [[ -z "$SLOT" ]] || {
        echo "mellifera-distributed-piece: --placement=host takes no SLOT (the whole guest is the grant)" >&2
        exit 2
      }
      RELEASE=(yarn tests:e2e:release --devices --placement=host)
      ;;
    *)
      echo "mellifera-distributed-piece: --placement=slot|host from the reserve JSON is required" >&2
      echo "$USAGE" >&2
      exit 2
      ;;
  esac
fi

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
    # A desk's TestingAVD belongs to its developer; only a whole guest is prepared.
    [[ "$PLACEMENT" == host ]] || return 0
  else
    echo "mellifera-distributed-piece: creating ${BASE_AVD} from ${pkg}" >&2
    yes 2>/dev/null | "${tools}/sdkmanager" --licenses >/dev/null
    "${tools}/sdkmanager" --install "$pkg" "emulator" "platform-tools" || return $?
    echo no | "${tools}/avdmanager" create avd --force -n "$BASE_AVD" --abi "${target}/${abi}" --package "$pkg" || return $?
    "$emu" -list-avds | grep -qx "$BASE_AVD" || return 1
  fi
  prewarm_avd_userdata "$emu"
}

# On first boot the emulator raises an API 24+ data partition to at least 6 GiB and
# refuses to start unless 1.2x that is free, though the image is sparse. CI's AVD
# home is a separate 74 GB volume; a guest holds the build and the AVD on one root
# disk, so create the image now, before the build fills it. The check only runs
# while userdata-qemu.img is missing, and Detox never passes -wipe-data. A partial
# image from a failed attempt is removed so the next attempt starts clean.
base_avd_dir() {
  echo "${ANDROID_AVD_HOME:-$HOME/.android/avd}/${BASE_AVD}.avd"
}

prewarm_avd_userdata() {
  local emu="$1" dir
  dir="$(base_avd_dir)"
  local timeout_s="${RNFB_ANDROID_AVD_PREWARM_TIMEOUT_S:-180}" pid waited=0 why=""
  local img="${dir}/userdata-qemu.img" port=5584
  # Only this launch: qemu gets the same argv, and no other TestingAVD uses this port.
  local pat="-avd ${BASE_AVD} .*-port ${port}( |$)"
  # The qcow2 overlay appears once qemu has opened the finished raw image.
  [[ -f "$img" && -f "${img}.qcow2" ]] && return 0
  rm -f "$img" "${img}.qcow2"
  echo "mellifera-distributed-piece: creating ${BASE_AVD} userdata before the build" >&2
  # shellcheck disable=SC2086 # CI_EMULATOR_OPTIONS is a word list
  "$emu" -avd "$BASE_AVD" $CI_EMULATOR_OPTIONS -crash-report-mode never -port "$port" >"${dir}/prewarm.log" 2>&1 &
  pid=$!
  while [[ ! -f "${img}.qcow2" ]] && (( waited < timeout_s )); do
    kill -0 "$pid" 2>/dev/null || { why="the emulator exited before creating it"; break; }
    sleep 1
    waited=$(( waited + 1 ))
  done
  [[ -f "${img}.qcow2" ]] || why="${why:-not created within ${timeout_s}s}"
  # Stop it so it does not hold RAM through the build or show up in adb.
  pkill -TERM -P "$pid" 2>/dev/null
  kill -TERM "$pid" 2>/dev/null
  waited=0
  while { kill -0 "$pid" 2>/dev/null || pgrep -f -- "$pat" >/dev/null; } && (( waited < 30 )); do
    sleep 1
    waited=$(( waited + 1 ))
  done
  pkill -KILL -P "$pid" 2>/dev/null
  kill -KILL "$pid" 2>/dev/null
  pkill -KILL -f -- "$pat" 2>/dev/null
  wait "$pid" 2>/dev/null
  if [[ -n "$why" || ! -f "$img" ]]; then
    rm -f "$img" "${img}.qcow2"
    echo "mellifera-distributed-piece: ${BASE_AVD} userdata ${why:-missing}; last emulator output:" >&2
    tail -5 "${dir}/prewarm.log" >&2
    return 1
  fi
  echo "mellifera-distributed-piece: ${BASE_AVD} userdata ready" >&2
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

# Gradle needs javac and the Firebase emulators refuse Java older than 21.
# CI uses Temurin 21 (actions/setup-java) on every platform. Gradle compiles with $JAVA_HOME when set; the emulators run `java` from PATH.
check_java() {
  local want="${RNFB_JAVA_VERSION:-21}" javac="${JAVA_HOME:+$JAVA_HOME/bin/}javac" major
  if ! "$javac" -version >/dev/null 2>&1; then
    echo "mellifera-distributed-piece: no Java compiler (${javac} -version failed); install a JDK ${want} (CI uses Temurin ${want})" >&2
    return 1
  fi
  # Skip JVM "Picked up JAVA_TOOL_OPTIONS" lines; 1.8 reports as 8.
  major="$("$javac" -version 2>&1 | awk '$1=="javac"{n=split($2,v,/[^0-9]+/); print (v[1]=="1" && n>1) ? v[2] : v[1]; exit}')"
  if [[ ! "$major" =~ ^[0-9]+$ || "$major" -lt "$want" ]]; then
    echo "mellifera-distributed-piece: ${javac} ${major:-unknown} found; JDK ${want} or newer is required (CI uses Temurin ${want})" >&2
    return 1
  fi
  major="$(java -version 2>&1 | awk -F'"' '/version "/{n=split($2,v,/[^0-9]+/); print (v[1]=="1" && n>1) ? v[2] : v[1]; exit}')"
  if [[ ! "$major" =~ ^[0-9]+$ || "$major" -lt "$want" ]]; then
    echo "mellifera-distributed-piece: java on PATH is ${major:-missing}; Java ${want} or newer is required for the Firebase emulators" >&2
    return 1
  fi
}

# The Gradle daemon heap alone is org.gradle.jvmargs -Xmx; Kotlin, D8, lint,
# CMake and then the emulator need room beside it.
check_memory() {
  local props="tests/android/gradle.properties" xmx heap_mb total_mb
  local headroom_mb="${RNFB_ANDROID_MEMORY_HEADROOM_MB:-4096}"
  if [[ ! "$headroom_mb" =~ ^[0-9]+$ ]]; then
    echo "mellifera-distributed-piece: RNFB_ANDROID_MEMORY_HEADROOM_MB must be a whole number of MB, got ${headroom_mb}" >&2
    return 1
  fi
  xmx="$(sed -n 's/^org\.gradle\.jvmargs=.*-Xmx\([0-9][0-9]*[mMgG]\).*/\1/p' "$props" | head -1)"
  case "$xmx" in
    *[gG]) heap_mb=$(( 10#${xmx%?} * 1024 )) ;;
    *[mM]) heap_mb=$(( 10#${xmx%?} )) ;;
    *)
      echo "mellifera-distributed-piece: no -Xmx in org.gradle.jvmargs (${props})" >&2
      return 1
      ;;
  esac
  case "$(uname -s)" in
    Linux) total_mb=$(( $(awk '/^MemTotal:/{print $2}' /proc/meminfo) / 1024 )) ;;
    Darwin) total_mb=$(( $(sysctl -n hw.memsize) / 1048576 )) ;;
    *) return 0 ;;
  esac
  if (( total_mb < heap_mb + headroom_mb )); then
    echo "mellifera-distributed-piece: ${total_mb} MB RAM; the Android build needs ${heap_mb} MB Gradle heap (${props}) plus ${headroom_mb} MB (RNFB_ANDROID_MEMORY_HEADROOM_MB)" >&2
    return 1
  fi
}

# df_free DIR: "<free MB> <filesystem> <mount point>" for the filesystem holding
# DIR, or its nearest existing parent.
df_free() {
  local dir="$1"
  while [[ ! -d "$dir" ]]; do dir="$(dirname "$dir")"; done
  df -Pk "$dir" | awk 'NR==2{kb=$4; fs=$1; $1=$2=$3=$4=$5=""; sub(/^ +/, ""); print int(kb/1024), fs, $0}'
}

# An Android guest grows about 27 GiB from checkout to emulator boot. A desk
# test:full of all three platforms peaks near 40 GiB, so the two Apple builds
# take about 13 GiB together. While TestingAVD has no userdata image, the
# emulator also wants 1.2 x its 6 GiB data partition free in the AVD home.
check_disk() {
  local platform="$1" base_mb avd_mb=0 need_mb have_mb fs mnt avd_dir a_have a_fs a_mnt why ec=0
  case "$platform" in
    android) base_mb=30720 ;;
    *) base_mb=15360 ;;
  esac
  base_mb="${RNFB_E2E_MIN_FREE_DISK_MB:-$base_mb}"
  if [[ ! "$base_mb" =~ ^[0-9]+$ ]]; then
    echo "mellifera-distributed-piece: RNFB_E2E_MIN_FREE_DISK_MB must be a whole number of MB, got ${base_mb}" >&2
    return 1
  fi
  read -r have_mb fs mnt < <(df_free "$REPO_ROOT")
  if [[ ! "$have_mb" =~ ^[0-9]+$ ]]; then
    echo "mellifera-distributed-piece: could not read free disk space for ${REPO_ROOT} (df -Pk)" >&2
    return 1
  fi
  need_mb="$base_mb"
  why="${base_mb} MB for install, build and devices (RNFB_E2E_MIN_FREE_DISK_MB)"
  if [[ "$platform" == android ]]; then
    avd_dir="$(base_avd_dir)"
    if [[ ! -f "${avd_dir}/userdata-qemu.img" || ! -f "${avd_dir}/userdata-qemu.img.qcow2" ]]; then
      avd_mb=7373
      read -r a_have a_fs a_mnt < <(df_free "$avd_dir")
      if [[ "$a_fs $a_mnt" == "$fs $mnt" ]]; then
        need_mb=$((need_mb + avd_mb))
        why="${why} plus ${avd_mb} MB for the ${BASE_AVD} userdata image (1.2 x 6 GiB while it is missing)"
      elif [[ ! "$a_have" =~ ^[0-9]+$ ]]; then
        echo "mellifera-distributed-piece: could not read free disk space for ${avd_dir} (df -Pk)" >&2
        ec=1
      elif (( a_have < avd_mb )); then
        echo "mellifera-distributed-piece: ${a_have} MB free on ${a_mnt} (AVD home); the ${BASE_AVD} userdata image needs ${avd_mb} MB there (1.2 x 6 GiB while it is missing)" >&2
        ec=1
      fi
    fi
  fi
  if (( have_mb < need_mb )); then
    echo "mellifera-distributed-piece: ${have_mb} MB free on ${mnt} (checkout); the ${platform} piece needs ${need_mb} MB: ${why}" >&2
    ec=1
  fi
  return "$ec"
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
  step check_java || return $?
  step check_memory || return $?
  step check_disk android || return $?
  headless_emulator
  step ensure_testing_avd || return $?
  step "${RELEASE[@]}" || return $?
  [[ -z "$SLOT" ]] || step yarn tests:e2e:setup-android-avds "$((SLOT + 1))" || return $?
  step yarn tests:android:unit || return $?
  step yarn tests:android:build || return $?
  [[ "$PLACEMENT" != host ]] || step stop_gradle_daemons || return $?
  services tests:packager:jet || return $?
  ON_E2E_FAILURE=save_android_logcat after_e2e tests:android:post-e2e-coverage yarn tests:android:test-cover
}

# The build's idle daemons keep their heap (and on a small guest, the swap)
# while the emulator boots beside them. `--stop` stops every daemon of this
# Gradle version for the user, so a desk slot, which may share the user with
# other slots' builds, keeps them.
stop_gradle_daemons() {
  (cd tests/android && ./gradlew --stop)
}

# run_bounded SECONDS CMD...: CMD's status, or 124 when it outlives SECONDS
# (macOS has no timeout(1)).
run_bounded() {
  local limit="$1" pid waited=0
  shift
  "$@" &
  pid=$!
  while kill -0 "$pid" 2>/dev/null && (( waited < limit )); do
    sleep 1
    waited=$((waited + 1))
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null
    sleep 1
    kill -0 "$pid" 2>/dev/null && kill -KILL "$pid" 2>/dev/null
    wait "$pid" 2>/dev/null
    return 124
  fi
  wait "$pid"
}

save_android_logcat() {
  local out="${RNFB_ANDROID_LOGCAT_FILE:-${TMPDIR:-/tmp}/rnfb-e2e-logcat-android${SLOT:+-slot$SLOT}.txt}"
  local adb="${ANDROID_HOME:+$ANDROID_HOME/platform-tools/}adb"
  # Under host the serial pin lives only inside test-cover's own env.
  local serial="${ANDROID_SERIAL:-emulator-5554}" state ec
  local timeout_s="${RNFB_ANDROID_LOGCAT_TIMEOUT_S:-60}"
  if [[ ! "$timeout_s" =~ ^[1-9][0-9]*$ ]]; then
    echo "mellifera-distributed-piece: RNFB_ANDROID_LOGCAT_TIMEOUT_S must be a positive whole number of seconds, got ${timeout_s}; using 60" >&2
    timeout_s=60
  fi
  # logcat waits for a device that never came up; get-state does not, but
  # either can block on a wedged adb server.
  # A file, not a pipe: an adb server started here would hold a pipe open.
  run_bounded "$timeout_s" "$adb" -s "$serial" get-state >"$out" 2>/dev/null
  state="$(tail -n 1 "$out")"
  if [[ "$state" != device ]]; then
    echo "mellifera-distributed-piece: no logcat: adb get-state on ${serial} reported ${state:-nothing (no such device, or adb did not answer)}" >&2
    return 0
  fi
  ec=0
  run_bounded "$timeout_s" "$adb" -s "$serial" logcat -d -b main,system,crash >"$out" 2>&1 || ec=$?
  if [[ "$ec" -eq 124 ]]; then
    echo "mellifera-distributed-piece: adb logcat on ${serial} did not finish within ${timeout_s}s; partial log in ${out}" >&2
    return 0
  fi
  if [[ "$ec" -ne 0 ]]; then
    echo "mellifera-distributed-piece: adb logcat on ${serial} failed:" >&2
    head -n 5 "$out" >&2
    return 0
  fi
  echo "mellifera-distributed-piece: logcat saved to ${out}; system_server, package manager, low-memory, crash and ANR lines:" >&2
  grep -E 'system_server|PackageManager|lowmemorykiller|lmkd|FATAL|ANR in' "$out" | tail -n 200 >&2
  return 0
}

# CI shape: coverage runs after the suite even when it failed; the suite exit
# wins, and a coverage failure fails only an otherwise green run.
# ON_E2E_FAILURE names a step that runs right after a failed suite, while its
# devices are still up.
after_e2e() {
  local coverage="$1"
  shift
  local test_ec=0 cov_ec=0
  step "$@" || {
    test_ec=$?
    [[ -z "${ON_E2E_FAILURE:-}" ]] || step "$ON_E2E_FAILURE"
  }
  step yarn "$coverage" || cov_ec=$?
  [[ "$test_ec" -ne 0 ]] && return "$test_ec"
  return "$cov_ec"
}

piece_ios() {
  step check_apple_toolchain ios || return $?
  step check_java || return $?
  step check_disk ios || return $?
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
  step check_java || return $?
  step check_disk macos || return $?
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
step "${RELEASE[@]}"
release_ec=$?
if [[ "$ec" -eq 0 ]]; then
  ec="$release_ec"
fi
exit "$ec"
