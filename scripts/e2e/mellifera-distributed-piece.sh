#!/usr/bin/env bash
# Run one distributed-e2e piece on a synced remote checkout, from its repo root.
# Runbook: okf-bundle/testing/running-e2e-distributed.md § distributed e2e run.
#
# Usage (through exec on the synced tree):
#   yarn tests:mellifera:exec --session ID -w DIR -- bash scripts/e2e/mellifera-distributed-piece.sh <android|ios|macos> --placement=<slot|host> [SLOT]
#   bash scripts/e2e/mellifera-distributed-piece.sh <android|ios|macos> --placement=<slot|host> [SLOT] --dry-run
#
# --placement is the grant's `placement` from the reserve JSON and is required.
# `slot` (a desk slot) requires SLOT, the grant's slot; every release is
# `yarn tests:e2e:release --devices --slot=SLOT`, which frees only what slot
# SLOT's runs in this tree recorded. `host` (the whole guest) takes no SLOT and
# uses serial defaults; every release is `yarn tests:e2e:release --devices`,
# which frees only what this tree's serial runs recorded. Neither sweeps the
# machine: a recycled guest must arrive with no e2e holders, and leftovers
# from an earlier grant are reported and fail the piece.
# `pool` (a global grant whose reserve JSON names no slot index) is refused
# with exit 2: the piece cannot tell a desk slot from a whole guest, and
# guessing `host` on a desk would run on the desk's serial ports and devices.
# Every step is a canonical `yarn tests:*` command in one shell, so the
# emulator suite and Metro outlive the steps that start them. The first
# failing step's status is the exit status. The release always runs last.
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
# `leftovers` (spill teardown, on a synced tree with its sibling DIR.scratch)
# lists this user's processes whose working directory is in the tree or the
# scratch dir, never its own ancestors, and exits 1 when there are any; `--stop`
# sends them TERM, then KILL after RNFB_SPILL_STOP_WAIT_S (default 10) seconds
# to those still listed in the tree or the scratch dir.
# It exits 2 when it cannot list processes; the dirs must not be removed then.
# `git-baseline` (on a synced tree with its sibling DIR.scratch, right after
# sync) stages the tree into a fresh index of its own, so `git diff` drift
# checks such as `yarn codegen:verify` compare against the synced source. No
# commit is made. It exits 2 inside another repository's work tree.
# `node-check` (on a grant, before `yarn install`) exits 1 unless `node` on
# PATH is major RNFB_NODE_VERSION (default 24, as CI) or newer, `corepack` is
# on PATH, and `yarn --version` in the tree equals the root package.json
# `packageManager` yarn version; otherwise it tells the caller to stop and tear
# the grant down.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
USAGE="usage: mellifera-distributed-piece.sh <android|ios|macos> --placement=<slot|host> [SLOT] [--dry-run] | ensure-avd | leftovers [--stop] | git-baseline | node-check"
GUEST_REQUIREMENTS_DOC="okf-bundle/testing/running-e2e-distributed.md#guest-requirements"
NODE_CHECK_FAIL_DOC="okf-bundle/testing/running-e2e-distributed.md#node-check-failure"
BASE_AVD="TestingAVD"

PLATFORM=""
PLACEMENT=""
SLOT=""
DRY_RUN=0
STOP=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --stop) STOP=1 ;;
    --placement=slot | --placement=host | --placement=pool) PLACEMENT="${arg#--placement=}" ;;
    android | ios | macos | ensure-avd | leftovers | git-baseline | node-check)
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
if [[ "$STOP" -eq 1 && "$PLATFORM" != leftovers ]]; then
  echo "$USAGE" >&2
  exit 2
fi
if [[ "$PLATFORM" != ensure-avd && "$PLATFORM" != leftovers && "$PLATFORM" != git-baseline && "$PLATFORM" != node-check ]]; then
  case "$PLACEMENT" in
    slot)
      [[ -n "$SLOT" ]] || {
        echo "mellifera-distributed-piece: --placement=slot requires the grant's SLOT; refusing an unscoped release on a desk slot" >&2
        exit 2
      }
      RELEASE=(yarn tests:e2e:release --devices "--slot=${SLOT}")
      ;;
    host)
      [[ -z "$SLOT" ]] || {
        echo "mellifera-distributed-piece: --placement=host takes no SLOT (the whole guest is the grant)" >&2
        exit 2
      }
      RELEASE=(yarn tests:e2e:release --devices)
      ;;
    pool)
      echo "mellifera-distributed-piece: placement pool is a global grant whose reserve JSON names no slot index; refusing to run or release (--placement=host on a desk would run on its serial ports and devices). See okf-bundle/testing/running-e2e-distributed.md#global-grant-placement" >&2
      exit 2
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

# PID<TAB>CWD for this user's processes, from /proc on Linux and lsof
# elsewhere (RNFB_SPILL_LSOF overrides the lsof path). Each CWD is resolved to
# its physical path when it can be entered. Returns 2 when the listing fails
# or does not include this shell, so a caller never mistakes "could not look"
# for "nothing there".
process_cwds() {
  local dir cwd pid lsof raw seen=0
  if [[ -d /proc/self ]]; then
    for dir in /proc/[0-9]*; do
      [[ -O "$dir" ]] || continue
      cwd="$(readlink "$dir/cwd" 2>/dev/null)" || continue
      raw+="${dir#/proc/}"$'\t'"${cwd}"$'\n'
    done
  else
    lsof="${RNFB_SPILL_LSOF:-$(command -v lsof || echo /usr/sbin/lsof)}"
    if [[ ! -x "$lsof" ]]; then
      echo "mellifera-distributed-piece: lsof not found (${lsof}); cannot list working directories" >&2
      return 2
    fi
    raw="$("$lsof" -n -P -w -a -u "$(id -u)" -d cwd -Fpn 2>/dev/null)" || {
      echo "mellifera-distributed-piece: ${lsof} failed; cannot list working directories" >&2
      return 2
    }
    raw="$(awk '/^p/ { pid = substr($0, 2) } /^n/ { printf "%s\t%s\n", pid, substr($0, 2) }' <<<"$raw")"
  fi
  while IFS=$'\t' read -r pid cwd; do
    [[ -n "$pid" ]] || continue
    [[ "$pid" == "$$" ]] && seen=1
    if [[ "$cwd" == /* ]] && builtin cd -P -- "$cwd" 2>/dev/null; then
      cwd="$PWD"
    fi
    printf '%s\t%s\n' "$pid" "$cwd"
  done <<<"$raw"
  if [[ "$seen" -ne 1 ]]; then
    echo "mellifera-distributed-piece: the working-directory listing does not include this shell (pid $$); cannot check" >&2
    return 2
  fi
}

# PID<TAB>CWD<TAB>COMMAND for this user's processes whose working directory is
# ROOT, ROOT.scratch, or under either, for ROOT as LOGICAL and as PHYSICAL.
# Only the working directory counts: a process that merely names the path in
# its argv is not ours. This shell, its ancestors (the exec shell whose cwd is
# the tree) and its descendants are never listed. Returns 2 when a listing fails.
spill_processes() {
  local cwds procs
  cwds="$(process_cwds)" || return 2
  procs="$(ps -ww -U "$(id -u)" -o pid= -o ppid= -o command=)" || {
    echo "mellifera-distributed-piece: ps failed; cannot list processes" >&2
    return 2
  }
  CWDS="$cwds" PROCS="$procs" awk -v self="$$" -v r1="$1" -v r2="$2" '
    function under(p, d) { return d != "" && (p == d || index(p, d "/") == 1) }
    function ours(c) {
      return under(c, r1) || under(c, r2) || under(c, r1 ".scratch") || under(c, r2 ".scratch")
    }
    BEGIN {
      n = split(ENVIRON["CWDS"], lines, "\n")
      for (i = 1; i <= n; i++) {
        t = index(lines[i], "\t")
        if (t) cwd[substr(lines[i], 1, t - 1)] = substr(lines[i], t + 1)
      }
      m = split(ENVIRON["PROCS"], rows, "\n")
      for (i = 1; i <= m; i++) {
        row = rows[i]
        sub(/^[ \t]+/, "", row)
        if (row == "") continue
        split(row, f, /[ \t]+/)
        parent[f[1]] = f[2]
        cmd = row
        sub(/^[0-9]+[ \t]+[0-9]+[ \t]*/, "", cmd)
        command[f[1]] = cmd
        order[++k] = f[1]
      }
      for (p = self; p != "" && p + 0 > 1 && !(p in skip); p = parent[p]) skip[p] = 1
      for (i = 1; i <= k; i++) {
        pid = order[i]
        if (pid in skip) continue
        p = parent[pid]
        for (hops = 0; p != "" && p + 0 > 1 && p != self && hops < 256; hops++) p = parent[p]
        if (p == self) continue
        if ((pid in cwd) && ours(cwd[pid])) printf "%s\t%s\t%s\n", pid, cwd[pid], command[pid]
      }
    }
  '
}

run_leftovers() {
  local root physical found pids pid alive current stubborn waited=0
  local limit="${RNFB_SPILL_STOP_WAIT_S:-10}"
  physical="$(pwd -P)"
  if [[ ! -d "${physical}.scratch" ]]; then
    echo "mellifera-distributed-piece: leftovers runs on a synced spill tree; ${physical}.scratch is missing" >&2
    return 2
  fi
  if [[ ! "$limit" =~ ^[0-9]+$ ]]; then
    echo "mellifera-distributed-piece: RNFB_SPILL_STOP_WAIT_S must be a whole number of seconds, got ${limit}; using 10" >&2
    limit=10
  fi
  root="$physical"
  found="$(spill_processes "$REPO_ROOT" "$physical")" || {
    echo "mellifera-distributed-piece: leftovers could not check for processes; do not remove ${physical} or ${physical}.scratch" >&2
    return 2
  }
  if [[ -z "$found" ]]; then
    echo "mellifera-distributed-piece: no processes left in ${root} or ${root}.scratch" >&2
    return 0
  fi
  echo "mellifera-distributed-piece: processes left in ${root} or ${root}.scratch (pid, cwd, command):" >&2
  printf '%s\n' "$found"
  [[ "$STOP" -eq 1 ]] || return 1
  read -r -a pids <<<"$(cut -f1 <<<"$found" | tr '\n' ' ')"
  kill -TERM "${pids[@]}" 2>/dev/null
  while :; do
    alive=()
    for pid in "${pids[@]}"; do
      kill -0 "$pid" 2>/dev/null && alive+=("$pid")
    done
    [[ "${#alive[@]}" -gt 0 && "$waited" -lt "$limit" ]] || break
    sleep 1
    waited=$((waited + 1))
  done
  if [[ "${#alive[@]}" -gt 0 ]]; then
    found="$(spill_processes "$REPO_ROOT" "$physical")" || {
      echo "mellifera-distributed-piece: leftovers could not recheck before KILL; do not remove ${physical} or ${physical}.scratch" >&2
      return 2
    }
    current=" $(cut -f1 <<<"$found" | tr '\n' ' ') "
    stubborn=()
    for pid in "${alive[@]}"; do
      [[ "$current" == *" $pid "* ]] && stubborn+=("$pid")
    done
    [[ "${#stubborn[@]}" -eq 0 ]] || kill -KILL "${stubborn[@]}" 2>/dev/null
  fi
  sleep 1
  found="$(spill_processes "$REPO_ROOT" "$physical")" || {
    echo "mellifera-distributed-piece: leftovers could not recheck after --stop; do not remove ${physical} or ${physical}.scratch" >&2
    return 2
  }
  if [[ -n "$found" ]]; then
    echo "mellifera-distributed-piece: processes still left after --stop:" >&2
    printf '%s\n' "$found"
    return 1
  fi
  echo "mellifera-distributed-piece: stopped ${#pids[@]} process(es) left in ${root} or ${root}.scratch" >&2
  return 0
}

# The sync filter drops .git, and `git diff` outside a work tree is not a
# drift check (it exits 1 or 129). An index of the synced files is enough:
# `git diff` compares the work tree with the index, so no commit, identity or
# signing is needed. A later sync into the same DIR keeps this .git (the
# filter excludes it), and a rerun restages the tree.
run_git_baseline() {
  local physical top var
  physical="$(pwd -P)"
  if [[ ! -d "${physical}.scratch" ]]; then
    echo "mellifera-distributed-piece: git-baseline runs on a synced spill tree; ${physical}.scratch is missing" >&2
    return 2
  fi
  if ! command -v git >/dev/null 2>&1; then
    echo "mellifera-distributed-piece: git is not on PATH; the guest image must provide git" >&2
    return 1
  fi
  # A git hook or `git rebase --exec` exports GIT_DIR and friends. With them set,
  # git would stage into that repository instead of discovering from this tree.
  for var in $(git rev-parse --local-env-vars); do
    unset "$var"
  done
  top="$(git rev-parse --show-toplevel 2>/dev/null)" || top=""
  if [[ -n "$top" && "$(cd "$top" && pwd -P)" != "$physical" ]]; then
    echo "mellifera-distributed-piece: ${physical} is inside the git work tree ${top}; refusing to create a baseline there" >&2
    return 2
  fi
  [[ -n "$top" ]] || git init -q || return $?
  git add -A || return $?
  echo "mellifera-distributed-piece: git baseline staged in ${physical}" >&2
}

# The requester cannot fix a guest or donor desk, so a failure ends the grant's work.
node_check_fail() {
  echo "mellifera-distributed-piece: $1" >&2
  echo "mellifera-distributed-piece: stop: do not run yarn install or any later step on this grant; run spill teardown, then report the grant id and the line above to the federation operator (${NODE_CHECK_FAIL_DOC})" >&2
  return 1
}

# Yarn resolves the packageManager version through corepack; CI pins node 24.
run_node_check() {
  local want="${RNFB_NODE_VERSION:-24}" major
  if [[ ! "$want" =~ ^[0-9]+$ ]]; then
    echo "mellifera-distributed-piece: RNFB_NODE_VERSION must be a whole node major version, got ${want}" >&2
    return 1
  fi
  if ! command -v node >/dev/null 2>&1; then
    node_check_fail "node is not on PATH; the guest must provide node ${want} with corepack (${GUEST_REQUIREMENTS_DOC})"
    return 1
  fi
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)"
  if [[ ! "$major" =~ ^[0-9]+$ || "$major" -lt "$want" ]]; then
    node_check_fail "node ${major:-unknown} found; node ${want} or newer is required (CI uses node ${want}; ${GUEST_REQUIREMENTS_DOC})"
    return 1
  fi
  if ! command -v corepack >/dev/null 2>&1; then
    node_check_fail "corepack is not on PATH beside node ${major}; yarn cannot resolve the packageManager version (${GUEST_REQUIREMENTS_DOC})"
    return 1
  fi
  local want_yarn yarn_version yarn_err err_file
  want_yarn="$(sed -n 's/^[[:space:]]*"packageManager":[[:space:]]*"yarn@\([^"]*\)".*/\1/p' "${REPO_ROOT}/package.json")"
  # `yarn set version` pins yarn@X.Y.Z+sha512.<hash>; `yarn --version` prints only X.Y.Z.
  want_yarn="${want_yarn%%+*}"
  if [[ -z "$want_yarn" ]]; then
    echo "mellifera-distributed-piece: ${REPO_ROOT}/package.json has no yarn packageManager" >&2
    return 1
  fi
  if ! command -v yarn >/dev/null 2>&1; then
    node_check_fail "yarn is not on PATH beside node ${major} and corepack; the login must have corepack enabled so yarn resolves yarn@${want_yarn} (${GUEST_REQUIREMENTS_DOC})"
    return 1
  fi
  # RNFB never runs `corepack enable` on a guest; enabling it is the image's or the donor's setup.
  err_file="$(mktemp "${TMPDIR:-/tmp}/rnfb-node-check-yarn.XXXXXX")" || return 1
  yarn_version="$(cd "$REPO_ROOT" && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn --version </dev/null 2>"$err_file" | head -n 1)"
  yarn_err="$(head -n 2 "$err_file" | tr '\n' ' ')"
  rm -f -- "$err_file"
  yarn_err="${yarn_err% }"
  if [[ "$yarn_version" != "$want_yarn" ]]; then
    node_check_fail "yarn --version printed '${yarn_version}'${yarn_err:+ (stderr: ${yarn_err})}; the root package.json packageManager is yarn@${want_yarn}; the login must have corepack enabled so yarn resolves that version (${GUEST_REQUIREMENTS_DOC})"
    return 1
  fi
  echo "mellifera-distributed-piece: node ${major}, corepack and yarn ${yarn_version} found" >&2
}

if [[ "$PLATFORM" == node-check ]]; then
  run_node_check
  exit $?
fi

if [[ "$PLATFORM" == leftovers ]]; then
  run_leftovers
  exit $?
fi

if [[ "$PLATFORM" == git-baseline ]]; then
  run_git_baseline
  exit $?
fi

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
