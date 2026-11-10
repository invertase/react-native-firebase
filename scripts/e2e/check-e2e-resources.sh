#!/usr/bin/env bash
# Report whether e2e resources for the current env are busy.
# Uses standardized RNFB_* / JET_* / RCT_* env vars with fallback to serial defaults.
#
# Default ("host-clear") mode reports the contention-prone resources that matter before
# starting a run — Jet WebSocket, e2e apps, and simulators — and does NOT mark Metro or
# Firebase emulator ports as BUSY: those are normal, expected-to-be-running "services"
# (running-e2e.md § Services ready is a separate, opposite check from host-clear). Pass
# --services (alias --strict) to additionally treat Metro/emulator ports as BUSY, e.g.
# when you want a single command that also confirms nothing is bound on those ports.
#
# Default (no args, no slot env) = serial ports/devices only. --all-slots is the only
# leftover-slot wipe. Slot via env or --slot=N (re-applies slot N's env, as release
# does). BUSY lines carry owner=this-checkout (recorded; release frees it),
# owner=this-checkout-unrecorded (runs from this repo but unrecorded — including a
# Detox/harness cold-boot qemu on the identity AVD, which default release --devices
# stops; other categories print the exact --include-unrecorded command) or
# owner=unrecorded (another owner; never killed — a free slot is suggested). iOS: only
# the identity's exact simulator counts; other booted simulators are INFO.
#
# Exit 0 = all clear; exit 1 = something busy.
#
# Usage:
#   bash scripts/e2e/check-e2e-resources.sh
#   bash scripts/e2e/check-e2e-resources.sh --services            # also flag metro/emulator ports as BUSY
#   bash scripts/e2e/check-e2e-resources.sh --platform=android    # scope device probes to one platform
#   bash scripts/e2e/check-e2e-resources.sh --slot=1
#   bash scripts/e2e/check-e2e-resources.sh --all-slots
#   bash scripts/e2e/check-e2e-resources.sh --json
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/e2e-resource-env.sh
source "${SCRIPT_DIR}/lib/e2e-resource-env.sh"

JSON=0
SERVICES=0
E2E_ALL_SLOTS="${E2E_ALL_SLOTS:-0}"
E2E_SLOT_OVERRIDE="${E2E_SLOT_OVERRIDE:-}"
E2E_SLOT_SELECTOR_PRESENT=0
for arg in "$@"; do
  case "$arg" in
    --json)
      JSON=1
      ;;
    --services | --strict)
      SERVICES=1
      ;;
    --all-slots)
      E2E_ALL_SLOTS=1
      ;;
    --slot=*)
      E2E_SLOT_OVERRIDE="${arg#--slot=}"
      E2E_SLOT_SELECTOR_PRESENT=1
      ;;
    --platform=*)
      E2E_PLATFORM_OVERRIDE="${arg#--platform=}"
      ;;
    -h | --help)
      sed -n '2,27p' "$0"
      exit 0
      ;;
    *)
      echo "unknown arg: $arg" >&2
      exit 2
      ;;
  esac
done

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

e2e_collect_targets
e2e_lsof_cache_load
e2e_run_record_load

BUSY=0
UNRECORDED_BUSY=0
# release --only categories held by this checkout's own unrecorded processes.
LOCAL_UNRECORDED_CATEGORIES=""
REPORT_LINES=()

# Worst owner across pids: unrecorded (another owner) > this-checkout-unrecorded (cwd in
# this repo, not recorded) > this-checkout (recorded; release frees it).
pids_owner() {
  local pid owner worst=this-checkout
  for pid in "$@"; do
    owner="$(e2e_pid_owner "$pid")"
    case "$owner" in
      unrecorded)
        echo unrecorded
        return 0
        ;;
      this-checkout-unrecorded) worst=$owner ;;
    esac
  done
  echo "$worst"
}

device_owner() {
  e2e_device_owner "$1" "$2"
}

# Track a BUSY owner for the closing hint. Args: <owner> <release --only category>.
note_owner() {
  case "$1" in
    unrecorded) UNRECORDED_BUSY=1 ;;
    this-checkout-unrecorded)
      [[ ",${LOCAL_UNRECORDED_CATEGORIES}," == *",$2,"* ]] ||
        LOCAL_UNRECORDED_CATEGORIES="${LOCAL_UNRECORDED_CATEGORIES:+${LOCAL_UNRECORDED_CATEGORIES},}$2"
      ;;
  esac
}
ACTIVE_PLATFORMS="$(e2e_active_platforms | tr '\n' ' ')"

# platform_active: is this platform in scope for probing at all? "global" (the ambiguous
# fallback with no explicit platform intent — see e2e_active_platforms()) means "probe
# every platform's safe/specific checks" — it does NOT mean every platform's device is
# assumed to be actively running e2e (finding #3).
platform_active() {
  local p=$1
  [[ " $ACTIVE_PLATFORMS " == *" $p "* || " $ACTIVE_PLATFORMS " == *" global "* ]]
}

# platform_explicit: true only when platform intent was explicit (--platform,
# RNFB_E2E_PLATFORM, or a per-platform port env) — not the ambiguous "global"
# fallback. Used to decide whether an aggressive, false-positive-prone probe (e.g. "any
# booted iOS simulator") should escalate to BUSY or stay informational.
platform_explicit() {
  local p=$1
  [[ " $ACTIVE_PLATFORMS " == *" $p "* ]]
}

report() {
  local state=$1
  shift
  REPORT_LINES+=("$state $*")
  if [[ "$state" == "BUSY" ]]; then
    BUSY=1
  fi
  if [[ "$JSON" -eq 0 ]]; then
    printf '%-5s %s\n' "$state" "$*"
  fi
}

if [[ "$JSON" -eq 0 ]]; then
  echo "[check-e2e-resources] mode: $([[ "$SERVICES" -eq 1 ]] && echo "services (metro/emulator ports count as BUSY)" || echo "host-clear (default — metro/emulator ports are informational only)")"
  echo "[check-e2e-resources] platforms: ${ACTIVE_PLATFORMS}"
  echo "[check-e2e-resources] android serial=${E2E_ANDROID_SERIAL} avd=${E2E_ANDROID_AVD} ios_sim=${E2E_IOS_SIMULATOR}"
fi

i=0
for port in "${E2E_PORTS[@]}"; do
  label="${E2E_PORT_LABELS[$i]}"
  if e2e_port_listening "$port"; then
    # shellcheck disable=SC2046
    owner=$(pids_owner $(e2e_listener_pids "$port"))
    pids="$(e2e_listener_pids "$port" | tr '\n' ',' | sed 's/,$//') owner=${owner}"
    case "$label" in
      metro:*) category=metro ;;
      jet-control:*) category=jet-control ;;
      jet:*) category=jet ;;
      *) category=emulators ;;
    esac
    case "$label" in
      jet-control:*)
        # Control HTTP port may legitimately be open mid-run (running-e2e.md §Host-clear
        # probes check 8090 only) — report for visibility but never count as BUSY.
        report INFO "port :${port} (${label}) pids=${pids} — control port, open during a run is normal"
        ;;
      metro:* | emulator-*)
        # Finding #2: Metro/emulator ports are expected to be listening (running-e2e.md §
        # Services ready) — default host-clear mode must not fail solely on :8081/:8080.
        # Only escalate to BUSY when the caller explicitly asked for --services/--strict.
        if [[ "$SERVICES" -eq 1 ]]; then
          report BUSY "port :${port} (${label}) pids=${pids}"
          note_owner "$owner" "$category"
        else
          report INFO "port :${port} (${label}) pids=${pids} — services port, use --services to include as BUSY"
        fi
        ;;
      *)
        report BUSY "port :${port} (${label}) pids=${pids}"
        note_owner "$owner" "$category"
        ;;
    esac
  elif [[ "$label" == jet:* ]] && command -v lsof >/dev/null 2>&1 && e2e_port_accepts "$port"; then
    # lsof lists only this user's sockets; Jet cannot stop another user's server.
    report BUSY "port :${port} (${label}) accepts connections but has no listener lsof can attribute to this user owner=unrecorded (likely another user's process; release cannot stop it)"
    note_owner unrecorded jet
  else
    report CLEAR "port :${port} (${label})"
  fi
  i=$((i + 1))
done

if platform_active android; then
  if [[ -z "${E2E_ANDROID_SERIAL:-}" ]]; then
    report CLEAR "android serial unset (slotted AVD ${E2E_ANDROID_AVD} — skip adb app probes)"
  elif command -v adb >/dev/null 2>&1; then
    serial_owner="$(device_owner android "$E2E_ANDROID_SERIAL")"
    if e2e_android_app_running "$E2E_ANDROID_SERIAL" "$E2E_ANDROID_APP_ID"; then
      report BUSY "android app ${E2E_ANDROID_APP_ID} on ${E2E_ANDROID_SERIAL} owner=${serial_owner}"
      note_owner "$serial_owner" android-apps
    else
      report CLEAR "android app ${E2E_ANDROID_APP_ID} on ${E2E_ANDROID_SERIAL}"
    fi
    if e2e_android_app_running "$E2E_ANDROID_SERIAL" "$E2E_ANDROID_TEST_APP_ID"; then
      report BUSY "android test app ${E2E_ANDROID_TEST_APP_ID} on ${E2E_ANDROID_SERIAL} owner=${serial_owner}"
      note_owner "$serial_owner" android-apps
    else
      report CLEAR "android test app ${E2E_ANDROID_TEST_APP_ID} on ${E2E_ANDROID_SERIAL}"
    fi
  else
    report CLEAR "adb unavailable — skipped android app probes"
  fi
  if command -v adb >/dev/null 2>&1; then
    stray=""
    while IFS= read -r stray; do
      [[ -z "$stray" ]] && continue
      stray_owner="$(device_owner android "$stray")"
      # Strays are host-global, not tied to an identity: only one this checkout recorded
      # (or a recorded process spawned) is contention, and default release --devices
      # frees it. Another stray would fail every identity's check and no slot move
      # clears it, so it is INFO.
      if [[ "$stray_owner" == this-checkout ]]; then
        report BUSY "android stray emulator serial ${stray} (not allocated 5554 / 5556+2n — Detox FreePortFinder leftover) owner=this-checkout — free it with yarn tests:e2e:release --devices"
        continue
      fi
      stray_pid="$(e2e_device_instance_pid android "$stray")"
      stray_avd=""
      [[ -n "$stray_pid" ]] &&
        stray_avd="$(e2e_qemu_instances | awk -F'\t' -v p="$stray_pid" '$1 == p { print $3 }')"
      stray_detail="${stray_pid:+ qemu pid=${stray_pid} cwd=$(e2e_pid_cwd "$stray_pid")}${stray_avd:+ avd=${stray_avd}}"
      if [[ "$stray_owner" == this-checkout-unrecorded ]]; then
        stray_release="yarn tests:e2e:release --include-unrecorded --devices --only android-emulator"
        if [[ -n "$stray_avd" && " $(e2e_android_avd_names_for_release | tr '\n' ' ') " == *" ${stray_avd} "* ]]; then
          stray_hint="stop it from the shell that started it, or (manual) in this shell's slot env run: ${stray_release}${E2E_SLOT_OVERRIDE:+ --slot=${E2E_SLOT_OVERRIDE}}"
        else
          stray_hint="stop it from the shell that started it, or (manual) run ${stray_release} in the slot env of the identity whose AVD it runs"
        fi
        report INFO "android stray emulator serial ${stray} owner=this-checkout-unrecorded${stray_detail} — runs from this checkout but no run recorded it; ${stray_hint}"
      else
        report INFO "android stray emulator serial ${stray} owner=${stray_owner}${stray_detail} — not this checkout's; only the manual yarn tests:e2e:release --all-slots wipe stops it"
      fi
    done < <(e2e_adb_stray_emulator_serials)
  fi
  # An emulator on the identity's AVD at an allocated serial (strays are reported above)
  # that no run recorded: still contention when it traces to this checkout (Detox/harness
  # cold-boot respawn). Default release --devices stops it; BUSY so a soft-kill miss cannot
  # report CLEAR while TestingAVD-N / the slot serial stays up.
  identity_avds=" $(e2e_android_avd_names_for_release | tr '\n' ' ') "
  recorded_qemu=" $(e2e_run_record_live_devices android | cut -f5 | tr '\n' ' ') "
  while IFS=$'\t' read -r qpid qport qavd; do
    [[ -n "$qpid" && -n "$qavd" && "$identity_avds" == *" ${qavd} "* ]] || continue
    [[ "$recorded_qemu" == *" ${qpid} "* ]] && continue
    [[ -n "$qport" ]] && ! e2e_android_console_port_allocated "$qport" && continue
    e2e_pid_owned "$qpid" && continue
    qowner="$(e2e_pid_owner "$qpid")"
    qdetail="android emulator ${qport:+emulator-${qport} }avd=${qavd} qemu pid=${qpid} cwd=$(e2e_pid_cwd "$qpid") owner=${qowner}"
    if [[ "$qowner" == this-checkout-unrecorded ]]; then
      report BUSY "${qdetail} — no run recorded it (e.g. cold-boot respawn); free with yarn tests:e2e:release --devices${E2E_SLOT_OVERRIDE:+ --slot=${E2E_SLOT_OVERRIDE}}"
      note_owner "$qowner" android-emulator
    elif [[ "$qowner" == unrecorded && -n "$qport" && "$qport" == "${E2E_ANDROID_SERIAL#emulator-}" ]]; then
      # Another owner's emulator holds this identity's serial: this run's Detox would
      # attach to it, so it is contention. Never killed; the closing hint names a free slot.
      report BUSY "${qdetail} — another owner's emulator on this identity's serial ${E2E_ANDROID_SERIAL}; release leaves it running (free it from its owner, or move this run to a free slot)"
      note_owner "$qowner" android-emulator
    else
      report INFO "${qdetail} — not this checkout's; release leaves it running (free it from its owner, or move this run to a free slot)"
    fi
  done < <(e2e_qemu_instances)
fi

if platform_active macos; then
  busy_macos="$(e2e_macos_busy_process || true)"
  if [[ -n "${busy_macos}" ]]; then
    # shellcheck disable=SC2046
    owner=$(pids_owner $(pgrep -x "$busy_macos" 2>/dev/null || true))
    report BUSY "macos app process ${busy_macos} owner=${owner}"
    note_owner "$owner" macos-app
  else
    report CLEAR "macos app process ${E2E_MACOS_APP_PROCESS}"
  fi
fi

if platform_active ios; then
  if command -v xcrun >/dev/null 2>&1; then
    busy_ios_sim=""
    busy_ios_udid=""
    probed_ios_sims=()
    while IFS= read -r ios_sim_name; do
      [[ -z "$ios_sim_name" ]] && continue
      probed_ios_sims+=("$ios_sim_name")
      if busy_ios_udid="$(e2e_ios_booted_udid "$ios_sim_name")"; then
        busy_ios_sim="$ios_sim_name"
        break
      fi
    done < <(e2e_ios_simulator_names_for_release)
    # Only the identity's own exact device is contention; other booted simulators are
    # another owner's business and are reported for visibility only.
    while IFS=$'\t' read -r other_udid other_name; do
      [[ -n "$other_name" ]] || continue
      [[ " ${probed_ios_sims[*]+${probed_ios_sims[*]}} " == *" ${other_name} "* ]] && continue
      report INFO "ios simulator ${other_name} (${other_udid}) booted — not this identity's device"
    done < <(e2e_ios_booted_devices)
    if [[ -n "$busy_ios_sim" ]]; then
      ios_owner="$(device_owner ios-sim "$busy_ios_udid")"
      if platform_explicit ios; then
        report BUSY "ios simulator booted (${busy_ios_sim} ${busy_ios_udid}) owner=${ios_owner}"
        note_owner "$ios_owner" ios-sims
      else
        # Finding #3: "global" is an ambiguous fallback, not confirmed iOS intent — do not
        # fail the whole host-clear check on the serial simulator being up. Pass
        # --platform=ios (or set RNFB_E2E_PLATFORM=ios) to enforce.
        report INFO "ios simulator booted (${busy_ios_sim} ${busy_ios_udid}) owner=${ios_owner} — global mode does not fail on this; pass --platform=ios to enforce"
      fi
    else
      # Use the exact names probed (slot bases), not E2E_IOS_SIMULATOR — for --slot=N
      # without RNFB_IOS_SIMULATOR that resolve stays serial iPhone 17.
      if [[ ${#probed_ios_sims[@]} -gt 0 ]]; then
        probed_ios_label=$(IFS=', '; echo "${probed_ios_sims[*]}")
        report CLEAR "ios simulator (${probed_ios_label})"
      else
        report CLEAR "ios simulator (${E2E_IOS_SIMULATOR})"
      fi
    fi
  else
    report CLEAR "xcrun unavailable — skipped ios sim probes"
  fi
fi

if [[ "$JSON" -eq 1 ]]; then
  node -e "
    const lines = process.argv.slice(1);
    const items = lines.map(l => {
      const sp = l.indexOf(' ');
      return { state: l.slice(0, sp), detail: l.slice(sp + 1) };
    });
    console.log(JSON.stringify({ clear: items.every(i => i.state !== 'BUSY'), items }, null, 2));
  " "${REPORT_LINES[@]}"
fi

if [[ "$BUSY" -ne 0 ]]; then
  if [[ "$JSON" -eq 0 ]]; then
    if [[ -n "$LOCAL_UNRECORDED_CATEGORIES" ]]; then
      echo "[check-e2e-resources] owner=this-checkout-unrecorded: running from this checkout but no run recorded it (for example started outside yarn tests:*, before the run record existed, or by a step that does not record what it starts). Stop it, or in this shell's slot env run: yarn tests:e2e:release --include-unrecorded --only ${LOCAL_UNRECORDED_CATEGORIES}${E2E_SLOT_OVERRIDE:+ --slot=${E2E_SLOT_OVERRIDE}}" >&2
    fi
    if [[ "$UNRECORDED_BUSY" -eq 1 ]]; then
      free_slot="$(e2e_first_free_slot || true)"
      echo "[check-e2e-resources] owner=unrecorded: held by another owner — yarn tests:e2e:release will not kill it. Free it from its owner, or use another slot identity${free_slot:+ (first free slot: ${free_slot} — eval \"\$(yarn tests:e2e:export-slot-env <platform> ${free_slot})\")}." >&2
    fi
    echo "[check-e2e-resources] BUSY" >&2
  fi
  exit 1
fi
if [[ "$JSON" -eq 0 ]]; then
  echo "[check-e2e-resources] CLEAR"
fi
exit 0
