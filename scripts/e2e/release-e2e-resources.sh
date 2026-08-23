#!/usr/bin/env bash
# Clear e2e resources using standardized env vars (fallback to serial defaults).
# Soft kill first, then forceful if check-e2e-resources.sh still reports BUSY.
# Default release behaviour is a full wipe (ports + apps, including Metro/emulators) —
# use --only to limit scope, e.g. --only jet,android-apps to leave Metro/emulators up.
#
# Usage:
#   bash scripts/e2e/release-e2e-resources.sh
#   bash scripts/e2e/release-e2e-resources.sh --only metro,jet,android-apps
#   bash scripts/e2e/release-e2e-resources.sh --devices   # also stop AVD / shutdown sims
#   bash scripts/e2e/release-e2e-resources.sh --platform=android  # mid-wave: one platform only
#   bash scripts/e2e/release-e2e-resources.sh --slot=1
#   bash scripts/e2e/release-e2e-resources.sh --all-slots --devices
#
# After export-slot-env (full carry-in), default release clears all three platform port
# blocks for that slot (ports+apps only — not AVD/sims). End-of-slot / final free so
# check --platform=ios is CLEAR: pass --devices. Mid-wave early free of one platform
# must pass --platform=<done> (devices may stay up). --platform= never selects a slot;
# load export-slot-env first.
#
# Categories for --only (comma-separated):
#   metro | jet | jet-control | emulators | android-apps | macos-app | ios-sims | android-emulator
# Default: all categories except android-emulator and ios-sims (use --devices to include those).
# `jet` also releases jet-control (paired lifecycle); `--only jet-control` alone works too.
# Unknown categories in --only are a hard error (exit 2) before any resource is touched.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/e2e-resource-env.sh
source "${SCRIPT_DIR}/lib/e2e-resource-env.sh"

ONLY=""
DEVICES=0
MAX_FORCE_ROUNDS=2
E2E_ALL_SLOTS="${E2E_ALL_SLOTS:-0}"
E2E_SLOT_OVERRIDE="${E2E_SLOT_OVERRIDE:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --only)
      ONLY=${2:-}
      shift 2
      ;;
    --only=*)
      ONLY=${1#--only=}
      shift
      ;;
    --devices)
      DEVICES=1
      shift
      ;;
    --platform=*)
      E2E_PLATFORM_OVERRIDE="${1#--platform=}"
      shift
      ;;
    --all-slots)
      E2E_ALL_SLOTS=1
      shift
      ;;
    --slot=*)
      E2E_SLOT_OVERRIDE="${1#--slot=}"
      shift
      ;;
    -h|--help)
      sed -n '2,24p' "$0"
      exit 0
      ;;
    *)
      echo "unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

export E2E_ALL_SLOTS E2E_SLOT_OVERRIDE
[[ -n "${E2E_PLATFORM_OVERRIDE:-}" ]] && export E2E_PLATFORM_OVERRIDE
[[ -n "${E2E_PLATFORM_OVERRIDE:-}" ]] && e2e_validate_platform_name "$E2E_PLATFORM_OVERRIDE"
[[ -n "${RNFB_E2E_PLATFORM:-}" ]] && e2e_validate_platform_name "$RNFB_E2E_PLATFORM"

E2E_KNOWN_CATEGORIES=(metro jet jet-control emulators android-apps macos-app ios-sims android-emulator)

if [[ -n "$ONLY" ]]; then
  IFS=',' read -ra requested_cats <<<"$ONLY"
  for rc in "${requested_cats[@]}"; do
    [[ -z "$rc" ]] && continue
    known=0
    for kc in "${E2E_KNOWN_CATEGORIES[@]}"; do
      if [[ "$rc" == "$kc" ]]; then
        known=1
        break
      fi
    done
    if [[ "$known" -eq 0 ]]; then
      echo "[release-e2e-resources] unknown --only category: '${rc}'" >&2
      echo "[release-e2e-resources] known categories: ${E2E_KNOWN_CATEGORIES[*]}" >&2
      exit 2
    fi
  done
fi

want() {
  local cat=$1
  if [[ -z "$ONLY" ]]; then
    case "$cat" in
      android-emulator|ios-sims)
        [[ "$DEVICES" -eq 1 ]]
        return $?
        ;;
      *)
        return 0
        ;;
    esac
  fi
  [[ ",${ONLY}," == *",${cat},"* ]]
}

# Finding A: the recheck below must escalate Metro/emulator ports to BUSY (--services)
# whenever release's own clear scope includes them — otherwise a soft-kill failure on
# Metro/emulators never surfaces and the recheck can report CLEAR while a listener is
# still alive (check-e2e-resources.sh defaults to host-clear mode, which treats those
# ports as informational only). Forward --platform= / --slot= / --all-slots explicitly.
CHECK_ARGS=()
if want metro || want emulators; then
  CHECK_ARGS+=(--services)
fi
if [[ -n "${E2E_PLATFORM_OVERRIDE:-}" ]]; then
  CHECK_ARGS+=("--platform=${E2E_PLATFORM_OVERRIDE}")
fi
if [[ -n "${E2E_SLOT_OVERRIDE:-}" ]]; then
  CHECK_ARGS+=("--slot=${E2E_SLOT_OVERRIDE}")
fi
if [[ "${E2E_ALL_SLOTS:-0}" == "1" ]]; then
  CHECK_ARGS+=(--all-slots)
fi

run_check() {
  # Bash 3.2 (macOS default /bin/bash) throws "unbound variable" under `set -u` when
  # expanding "${arr[@]}" on a zero-element array — guard with the +alt form instead of
  # expanding CHECK_ARGS directly.
  bash "${SCRIPT_DIR}/check-e2e-resources.sh" "${CHECK_ARGS[@]+"${CHECK_ARGS[@]}"}" "$@"
}

e2e_collect_targets

echo "[release-e2e-resources] platforms: $(e2e_active_platforms | tr '\n' ' ')"
echo "[release-e2e-resources] soft clear..."
e2e_lsof_cache_load

kill_port_soft() {
  local port=$1
  local pids
  pids=$(e2e_listener_pids "$port")
  if [[ -n "$pids" ]]; then
    echo "[release] SIGTERM :${port} pids=$(echo "$pids" | tr '\n' ' ')"
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
  fi
}

kill_port_hard() {
  local port=$1
  local pids
  pids=$(e2e_listener_pids "$port")
  if [[ -n "$pids" ]]; then
    echo "[release] SIGKILL :${port} pids=$(echo "$pids" | tr '\n' ' ')"
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
}

clear_ports_matching() {
  local mode=$1 # soft|hard
  local i=0 label port
  for port in "${E2E_PORTS[@]}"; do
    label="${E2E_PORT_LABELS[$i]}"
    i=$((i + 1))
    case "$label" in
      metro:*)
        want metro || continue
        ;;
      jet:*)
        want jet || continue
        ;;
      jet-control:*)
        # jet-control shares lifecycle with jet — release it whenever either the
        # jet or jet-control category is requested (see running-e2e.md § Jet ports).
        want jet-control || want jet || continue
        ;;
      emulator-*)
        want emulators || continue
        ;;
      *)
        continue
        ;;
    esac
    if [[ "$mode" == soft ]]; then
      kill_port_soft "$port"
    else
      kill_port_hard "$port"
    fi
  done
}

ACTIVE_PLATFORMS="$(e2e_active_platforms | tr '\n' ' ')"
platform_active() {
  local p=$1
  [[ " $ACTIVE_PLATFORMS " == *" $p "* || " $ACTIVE_PLATFORMS " == *" global "* ]]
}

clear_android_apps() {
  want android-apps || return 0
  platform_active android || return 0
  command -v adb >/dev/null 2>&1 || return 0
  # Empty serial = slotted AVD without known adb id — skip force-stop (pkill by AVD
  # in clear_android_emulator covers the qemu; do not guess emulator-5554).
  [[ -n "${E2E_ANDROID_SERIAL:-}" ]] || return 0
  echo "[release] adb force-stop on ${E2E_ANDROID_SERIAL}"
  adb -s "$E2E_ANDROID_SERIAL" shell am force-stop "$E2E_ANDROID_APP_ID" 2>/dev/null || true
  adb -s "$E2E_ANDROID_SERIAL" shell am force-stop "$E2E_ANDROID_TEST_APP_ID" 2>/dev/null || true
}

clear_macos_app() {
  want macos-app || return 0
  platform_active macos || return 0
  local name
  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    if pgrep -x "$name" >/dev/null 2>&1; then
      echo "[release] killall ${name}"
      killall "$name" 2>/dev/null || true
    fi
  done < <(e2e_macos_process_names_for_probe)
}

clear_macos_app_hard() {
  want macos-app || return 0
  platform_active macos || return 0
  local name
  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    if pgrep -x "$name" >/dev/null 2>&1; then
      echo "[release] killall -9 ${name}"
      killall -9 "$name" 2>/dev/null || true
    fi
  done < <(e2e_macos_process_names_for_probe)
}

clear_ios_sims() {
  want ios-sims || return 0
  platform_active ios || return 0
  command -v xcrun >/dev/null 2>&1 || return 0
  local name
  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    echo "[release] simctl shutdown ${name}"
    xcrun simctl shutdown "$name" 2>/dev/null || true
  done < <(e2e_ios_simulator_names_for_release)
}

# Leftover Detox FreePortFinder guests (emulator-16xxx) poison the next Detox
# telnet attach. Always emu-kill those serials when android is in scope — not
# only --devices — so check BUSY on strays can recover without a device wipe.
clear_android_stray_emulators() {
  platform_active android || return 0
  command -v adb >/dev/null 2>&1 || return 0
  local serial
  while IFS= read -r serial; do
    [[ -z "$serial" ]] && continue
    echo "[release] adb emu kill stray serial=${serial}"
    adb -s "$serial" emu kill 2>/dev/null || true
  done < <(e2e_adb_stray_emulator_serials)
}

clear_android_emulator() {
  want android-emulator || return 0
  platform_active android || return 0
  echo "[release] android emulator kill serial=${E2E_ANDROID_SERIAL:-unset} avd=${E2E_ANDROID_AVD}"
  if [[ -n "${E2E_ANDROID_SERIAL:-}" ]] && command -v adb >/dev/null 2>&1; then
    adb -s "$E2E_ANDROID_SERIAL" emu kill 2>/dev/null || true
  fi
  local avd
  while IFS= read -r avd; do
    [[ -z "$avd" ]] && continue
    echo "[release] pkill qemu complete-avd=${avd}"
    e2e_pkill_qemu_for_avd "$avd"
  done < <(e2e_android_avd_names_for_release)
  # Unscoped --all-slots: also emu-kill known slotted adb serials (5556+2*slot).
  if [[ "${E2E_ALL_SLOTS:-0}" == "1" ]] &&
    [[ -z "${RNFB_ANDROID_AVD:-}${RNFB_ANDROID_AVD_NAME:-}" && -z "${RNFB_E2E_SLOT:-${RNFB_E2E_HOST_SLOT:-}${E2E_SLOT_OVERRIDE:-}}" ]] &&
    command -v adb >/dev/null 2>&1; then
    local i serial
    for ((i = 0; i <= E2E_SLOTTED_MAX; i++)); do
      serial="emulator-$(e2e_slot_android_console_port "$i")"
      adb -s "$serial" emu kill 2>/dev/null || true
    done
  fi
}

clear_ports_matching soft
clear_android_apps
clear_macos_app
clear_ios_sims
clear_android_stray_emulators
clear_android_emulator
sleep 2

round=0
while [[ $round -lt $MAX_FORCE_ROUNDS ]]; do
  if run_check >/tmp/rnfb-check-e2e-resources.out 2>&1; then
    echo "[release-e2e-resources] CLEAR after soft/force round ${round}"
    cat /tmp/rnfb-check-e2e-resources.out
    exit 0
  fi
  echo "[release-e2e-resources] still BUSY — forceful round $((round + 1))"
  cat /tmp/rnfb-check-e2e-resources.out >&2 || true
  e2e_lsof_cache_load
  clear_ports_matching hard
  clear_macos_app_hard
  clear_android_apps
  clear_ios_sims
  clear_android_stray_emulators
  clear_android_emulator
  sleep 2
  round=$((round + 1))
done

if run_check; then
  echo "[release-e2e-resources] CLEAR"
  exit 0
fi

echo "[release-e2e-resources] FAILED — resources still busy after forceful clear" >&2
exit 1
