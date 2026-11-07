#!/usr/bin/env bash
# Clear e2e resources using standardized env vars (fallback to serial defaults).
# Soft kill first, then forceful if check-e2e-resources.sh still reports BUSY.
# Default release frees only what e2e runs from this checkout recorded for the
# identity (serial or slot-N; scripts/e2e/lib/e2e-run-record.sh): listeners on the
# identity's ports, the macOS app pid, test apps on recorded serials, and with
# --devices the recorded emulator (qemu pid) / simulator (launchd_sim pid) instance, or
# an emulator a recorded process spawned — never a device that was since rebooted by
# someone else. Unrecorded holders are another
# owner's: reported, never killed, and the recheck fails. Use --only to limit scope,
# e.g. --only jet,android-apps to leave Metro/emulators up.
#
# Manual recovery only, at explicit user direction (never from scripts or CI):
#   --include-unrecorded  also kill unrecorded holders of this identity's ports and app
#                         names; with --devices, also this checkout's unrecorded emulator
#                         running the identity's AVD (qemu cwd in this repo). Another
#                         owner's device is reported and left running.
#   --all-slots           whole-machine wipe: every slot + serial + stray emulator-* serials
#
# Usage:
#   bash scripts/e2e/release-e2e-resources.sh
#   bash scripts/e2e/release-e2e-resources.sh --only metro,jet,android-apps
#   bash scripts/e2e/release-e2e-resources.sh --devices   # also stop AVD / shutdown sims
#   bash scripts/e2e/release-e2e-resources.sh --platform=android  # mid-wave: one platform only
#   bash scripts/e2e/release-e2e-resources.sh --slot=1
#   bash scripts/e2e/release-e2e-resources.sh --all-slots --devices   # manual only
#
# --slot=N re-applies slot N's env (ports, TestingAVD-N / emulator-<5556+2N>,
# RN E2E iOS slot-N, io.invertase.testing.sN) and fails (exit 2) when a different
# slot's env is loaded.
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
E2E_SLOT_SELECTOR_PRESENT=0
INCLUDE_UNRECORDED=0

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
    --include-unrecorded)
      INCLUDE_UNRECORDED=1
      shift
      ;;
    --slot=*)
      E2E_SLOT_OVERRIDE="${1#--slot=}"
      E2E_SLOT_SELECTOR_PRESENT=1
      shift
      ;;
    -h|--help)
      sed -n '2,37p' "$0"
      exit 0
      ;;
    *)
      echo "unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

[[ "$E2E_ALL_SLOTS" == "1" ]] && INCLUDE_UNRECORDED=1
export E2E_ALL_SLOTS E2E_SLOT_OVERRIDE
[[ -n "${E2E_PLATFORM_OVERRIDE:-}" ]] && export E2E_PLATFORM_OVERRIDE
if [[ -n "${E2E_SLOT_OVERRIDE:-}" || "$E2E_SLOT_SELECTOR_PRESENT" -eq 1 ]]; then
  e2e_validate_slot "$E2E_SLOT_OVERRIDE"
fi
[[ -n "${E2E_PLATFORM_OVERRIDE:-}" ]] && e2e_validate_platform_name "$E2E_PLATFORM_OVERRIDE"
[[ -n "${RNFB_E2E_PLATFORM:-}" ]] && e2e_validate_platform_name "$RNFB_E2E_PLATFORM"
if [[ "$E2E_SLOT_SELECTOR_PRESENT" -eq 1 && "$E2E_ALL_SLOTS" != "1" ]]; then
  e2e_reapply_selected_slot "$E2E_SLOT_OVERRIDE" || exit $?
fi

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
echo "[release-e2e-resources] identity: $(e2e_run_identity) record=$(e2e_run_record_dir) scope=$([[ "$INCLUDE_UNRECORDED" -eq 1 ]] && echo "include-unrecorded (manual)" || echo "recorded only")"
echo "[release-e2e-resources] soft clear..."
e2e_lsof_cache_load
e2e_run_record_load

# Kill listener pids on a port that this checkout's runs recorded (or every listener with
# --include-unrecorded / --all-slots). Unrecorded holders are reported and left running.
kill_port() {
  local mode=$1 port=$2
  local pids pid owned=""
  pids=$(e2e_listener_pids "$port")
  [[ -n "$pids" ]] || return 0
  for pid in $pids; do
    if [[ "$INCLUDE_UNRECORDED" -eq 1 ]] || e2e_pid_owned "$pid"; then
      owned="${owned} ${pid}"
    elif [[ "$mode" == soft ]]; then
      local owner category
      owner="$(e2e_pid_owner "$pid")"
      category="$(port_category "$port")"
      echo "[release] :${port} $(e2e_pid_describe "$pid") owner=${owner} — not recorded by this checkout's runs, left running: $(e2e_foreign_holder_hint "$owner" "$category")" >&2
    fi
  done
  [[ -n "$owned" ]] || return 0
  if [[ "$mode" == soft ]]; then
    echo "[release] SIGTERM :${port} pids=${owned# }"
    # shellcheck disable=SC2086
    kill $owned 2>/dev/null || true
  else
    echo "[release] SIGKILL :${port} pids=${owned# }"
    # shellcheck disable=SC2086
    kill -9 $owned 2>/dev/null || true
  fi
}

# release --only category for a target port (fail-fast hints).
port_category() {
  local want=$1 i=0 port
  for port in "${E2E_PORTS[@]}"; do
    if [[ "$port" == "$want" ]]; then
      case "${E2E_PORT_LABELS[$i]}" in
        metro:*) echo metro ;;
        jet-control:*) echo jet-control ;;
        jet:*) echo jet ;;
        emulator-*) echo emulators ;;
        *) echo metro,jet,emulators ;;
      esac
      return 0
    fi
    i=$((i + 1))
  done
  echo metro,jet,emulators
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
    kill_port "$mode" "$port"
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
  local serial owner
  local -a serials=()
  while IFS=$'\t' read -r _ _ serial _; do
    [[ -n "$serial" ]] && serials+=("$serial")
  done < <(e2e_run_record_live_devices android)
  # --include-unrecorded: also the configured serial, but only when that emulator traces
  # to this checkout (same test as the device stop). Empty serial = slotted AVD without
  # a known adb id — skip (do not guess emulator-5554). --all-slots stays by serial.
  if [[ "$INCLUDE_UNRECORDED" -eq 1 && -n "${E2E_ANDROID_SERIAL:-}" &&
    " ${serials[*]+${serials[*]}} " != *" ${E2E_ANDROID_SERIAL} "* ]]; then
    owner="$(e2e_device_owner android "$E2E_ANDROID_SERIAL")"
    if [[ "${E2E_ALL_SLOTS:-0}" == "1" || "$owner" == this-checkout || "$owner" == this-checkout-unrecorded ]]; then
      serials+=("$E2E_ANDROID_SERIAL")
    else
      echo "[release] adb force-stop skipped on ${E2E_ANDROID_SERIAL}: its emulator was not traced to this checkout (owner=${owner}; a qemu without -port cannot be traced); its apps are left running" >&2
    fi
  fi
  for serial in "${serials[@]+"${serials[@]}"}"; do
    echo "[release] adb force-stop on ${serial}"
    adb -s "$serial" shell am force-stop "$E2E_ANDROID_APP_ID" 2>/dev/null || true
    adb -s "$serial" shell am force-stop "$E2E_ANDROID_TEST_APP_ID" 2>/dev/null || true
  done
}

# Recorded macOS app pids (or every process by name with --include-unrecorded).
clear_macos_app() {
  local sig=$1 # TERM|KILL
  want macos-app || return 0
  platform_active macos || return 0
  local name pid
  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    if [[ "$INCLUDE_UNRECORDED" -eq 1 ]]; then
      if pgrep -x "$name" >/dev/null 2>&1; then
        echo "[release] killall -${sig} ${name}"
        killall "-${sig}" "$name" 2>/dev/null || true
      fi
      continue
    fi
    while IFS= read -r pid; do
      [[ -z "$pid" ]] && continue
      echo "[release] kill -${sig} macOS app ${name} pid=${pid}"
      kill "-${sig}" "$pid" 2>/dev/null || true
    done < <(e2e_run_record_pids_with_label "macos-app:${name}")
  done < <(e2e_macos_process_names_for_probe)
}

clear_ios_sims() {
  local mode=${1:-soft}
  want ios-sims || return 0
  platform_active ios || return 0
  command -v xcrun >/dev/null 2>&1 || return 0
  local name udid owner recorded=" "
  if [[ "${E2E_ALL_SLOTS:-0}" == "1" ]]; then
    while IFS= read -r name; do
      [[ -z "$name" ]] && continue
      echo "[release] simctl shutdown ${name}"
      xcrun simctl shutdown "$name" 2>/dev/null || true
    done < <(e2e_ios_simulator_names_for_release)
    return 0
  fi
  # Only the recorded launchd_sim instance; the entry is pruned once it is gone.
  while IFS=$'\t' read -r _ _ udid name _; do
    [[ -n "$udid" ]] || continue
    recorded="${recorded}${udid} "
    echo "[release] simctl shutdown ${udid} (${name}, recorded instance)"
    xcrun simctl shutdown "$udid" 2>/dev/null || true
  done < <(e2e_run_record_live_devices ios-sim)
  [[ "$INCLUDE_UNRECORDED" -eq 1 ]] || return 0
  # --include-unrecorded: the identity's booted simulator, only when it traces to this
  # checkout. launchd_sim runs from /, so an unrecorded one never does.
  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    udid="$(e2e_ios_booted_udid "$name")" || continue
    [[ "$recorded" == *" ${udid} "* ]] && continue
    owner="$(e2e_device_owner ios-sim "$udid")"
    case "$owner" in
      this-checkout | this-checkout-unrecorded)
        echo "[release] simctl shutdown ${udid} (${name}, owner=${owner})"
        xcrun simctl shutdown "$udid" 2>/dev/null || true
        ;;
      *)
        [[ "$mode" == soft ]] &&
          echo "[release] ios simulator ${name} (${udid}) owner=${owner} — not traceable to this checkout, left running; shut it down yourself if it is yours, or use the manual --all-slots wipe" >&2
        ;;
    esac
  done < <(e2e_ios_simulator_names_for_release)
}

# Stop one emulator instance: emu kill only when its console answers with the expected
# AVD (a reused or fallback serial is never trusted), then signal the exact qemu pid.
stop_qemu_instance() {
  local mode=$1 serial=$2 avd=$3 qpid=$4
  if [[ "$mode" == soft ]]; then
    if [[ -n "$serial" ]] && command -v adb >/dev/null 2>&1 &&
      [[ "$(adb -s "$serial" emu avd name 2>/dev/null | head -n 1 | tr -d '\r')" == "$avd" ]]; then
      adb -s "$serial" emu kill 2>/dev/null || true
    fi
    kill -TERM "$qpid" 2>/dev/null || true
  else
    kill -KILL "$qpid" 2>/dev/null || true
  fi
}

# Every stray emulator-* serial, whoever owns it: the manual --all-slots wipe only. A stray
# this checkout recorded or spawned (or, with --include-unrecorded, its unrecorded qemu
# on the identity's AVD) is stopped by clear_android_emulator instead.
clear_android_stray_emulators() {
  [[ "${E2E_ALL_SLOTS:-0}" == "1" ]] || return 0
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
  local mode=${1:-soft}
  want android-emulator || return 0
  platform_active android || return 0
  if [[ "${E2E_ALL_SLOTS:-0}" != "1" ]]; then
    # The recorded qemu instance (pid + start time), including a recorded
    # FreePortFinder serial; the entry is pruned once that instance is gone.
    local serial avd qpid port owner identity_avds recorded=" "
    while IFS=$'\t' read -r _ _ serial avd qpid _; do
      [[ -n "$serial" ]] || continue
      recorded="${recorded}${qpid} "
      echo "[release] android emulator stop serial=${serial} avd=${avd} qemu=${qpid} (recorded instance)"
      stop_qemu_instance "$mode" "$serial" "$avd" "$qpid"
    done < <(e2e_run_record_live_devices android)
    identity_avds=" $(e2e_android_avd_names_for_release | tr '\n' ' ') "
    # Any other qemu: one a recorded process spawned is this checkout's (as for ports).
    # With --include-unrecorded, also this checkout's unrecorded qemu on the identity's
    # AVD. Another owner's is never touched. Any unrecorded qemu left on the identity's
    # AVD is named, so a leak is never silent.
    while IFS=$'\t' read -r qpid port avd; do
      [[ -n "$qpid" && "$recorded" != *" ${qpid} "* ]] || continue
      serial="${port:+emulator-${port}}"
      if e2e_pid_owned "$qpid"; then
        echo "[release] android emulator stop serial=${serial:-unknown} avd=${avd:-unknown} qemu=${qpid} (child of a recorded process)"
        stop_qemu_instance "$mode" "$serial" "$avd" "$qpid"
        continue
      fi
      if [[ -z "$avd" ]]; then
        [[ "$INCLUDE_UNRECORDED" -eq 1 && "$mode" == soft ]] &&
          echo "[release] qemu pid=${qpid} serial=${serial:-unknown}: no @<avd> / -avd argument, cannot match it to this identity — left running" >&2
        continue
      fi
      [[ "$identity_avds" == *" ${avd} "* ]] || continue
      owner="$(e2e_pid_owner "$qpid")"
      if [[ "$INCLUDE_UNRECORDED" -eq 1 && "$owner" == this-checkout-unrecorded ]]; then
        echo "[release] android emulator stop serial=${serial:-unknown} avd=${avd} qemu=${qpid} (owner=${owner})"
        stop_qemu_instance "$mode" "$serial" "$avd" "$qpid"
      elif [[ "$mode" == soft && "$owner" == this-checkout-unrecorded ]]; then
        echo "[release] android emulator serial=${serial:-unknown} avd=${avd} $(e2e_pid_describe "$qpid") owner=${owner} — runs from this checkout but no run recorded it, left running. Stop it, or (manual) yarn tests:e2e:release --include-unrecorded --devices --only android-emulator${E2E_SLOT_OVERRIDE:+ --slot=${E2E_SLOT_OVERRIDE}}" >&2
      elif [[ "$mode" == soft ]]; then
        echo "[release] android emulator serial=${serial:-unknown} avd=${avd} $(e2e_pid_describe "$qpid") owner=${owner} — not this checkout's, left running: free it from its owner or use another slot" >&2
      fi
    done < <(e2e_qemu_instances)
    return 0
  fi
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
    local i serial max
    max="$(e2e_effective_slot_max)"
    for ((i = 0; i <= max; i++)); do
      serial="emulator-$(e2e_slot_android_console_port "$i")"
      adb -s "$serial" emu kill 2>/dev/null || true
    done
  fi
}

CHECK_OUT="$(mktemp "$(e2e_tmp_root)/rnfb-check-e2e-resources.XXXXXX")"
trap 'rm -f "$CHECK_OUT"' EXIT

clear_ports_matching soft
clear_android_apps
clear_macos_app TERM
clear_ios_sims
clear_android_stray_emulators
clear_android_emulator
sleep 2

round=0
while [[ $round -lt $MAX_FORCE_ROUNDS ]]; do
  if run_check >"$CHECK_OUT" 2>&1; then
    echo "[release-e2e-resources] CLEAR after soft/force round ${round}"
    cat "$CHECK_OUT"
    e2e_run_record_load
    exit 0
  fi
  echo "[release-e2e-resources] still BUSY — forceful round $((round + 1))"
  cat "$CHECK_OUT" >&2 || true
  e2e_lsof_cache_load
  e2e_run_record_load
  clear_ports_matching hard
  clear_macos_app KILL
  clear_android_apps
  clear_ios_sims hard
  clear_android_stray_emulators
  clear_android_emulator hard
  sleep 2
  round=$((round + 1))
done

e2e_run_record_load
if run_check; then
  echo "[release-e2e-resources] CLEAR"
  exit 0
fi

echo "[release-e2e-resources] FAILED — resources still busy after forceful clear" >&2
if [[ "$INCLUDE_UNRECORDED" -eq 0 ]]; then
  echo "[release-e2e-resources] Holders not recorded by this checkout's runs are another owner's and are never killed by default. Free them from their owner, or move this run to a free slot (see check output). Manual recovery only, at explicit user direction: --include-unrecorded (this identity) or --all-slots --devices (whole machine)." >&2
fi
exit 1
