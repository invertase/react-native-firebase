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
# leftover-slot wipe. Slot via env or --slot=N.
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
      ;;
    --platform=*)
      E2E_PLATFORM_OVERRIDE="${arg#--platform=}"
      ;;
    -h | --help)
      sed -n '2,22p' "$0"
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
[[ -n "${E2E_PLATFORM_OVERRIDE:-}" ]] && e2e_validate_platform_name "$E2E_PLATFORM_OVERRIDE"
[[ -n "${RNFB_E2E_PLATFORM:-}" ]] && e2e_validate_platform_name "$RNFB_E2E_PLATFORM"

e2e_collect_targets
e2e_lsof_cache_load

BUSY=0
REPORT_LINES=()
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
    pids=$(e2e_listener_pids "$port" | tr '\n' ',' | sed 's/,$//')
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
        else
          report INFO "port :${port} (${label}) pids=${pids} — services port, use --services to include as BUSY"
        fi
        ;;
      *)
        report BUSY "port :${port} (${label}) pids=${pids}"
        ;;
    esac
  else
    report CLEAR "port :${port} (${label})"
  fi
  i=$((i + 1))
done

if platform_active android; then
  if [[ -z "${E2E_ANDROID_SERIAL:-}" ]]; then
    report CLEAR "android serial unset (slotted AVD ${E2E_ANDROID_AVD} — skip adb app probes)"
  elif command -v adb >/dev/null 2>&1; then
    if e2e_android_app_running "$E2E_ANDROID_SERIAL" "$E2E_ANDROID_APP_ID"; then
      report BUSY "android app ${E2E_ANDROID_APP_ID} on ${E2E_ANDROID_SERIAL}"
    else
      report CLEAR "android app ${E2E_ANDROID_APP_ID} on ${E2E_ANDROID_SERIAL}"
    fi
    if e2e_android_app_running "$E2E_ANDROID_SERIAL" "$E2E_ANDROID_TEST_APP_ID"; then
      report BUSY "android test app ${E2E_ANDROID_TEST_APP_ID} on ${E2E_ANDROID_SERIAL}"
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
      report BUSY "android stray emulator serial ${stray} (not allocated 5554 / 5556+2n — Detox FreePortFinder leftover)"
    done < <(e2e_adb_stray_emulator_serials)
  fi
fi

if platform_active macos; then
  busy_macos="$(e2e_macos_busy_process || true)"
  if [[ -n "${busy_macos}" ]]; then
    report BUSY "macos app process ${busy_macos}"
  else
    report CLEAR "macos app process ${E2E_MACOS_APP_PROCESS}"
  fi
fi

if platform_active ios; then
  if command -v xcrun >/dev/null 2>&1; then
    if e2e_ios_sim_booted "$E2E_IOS_SIMULATOR"; then
      if platform_explicit ios; then
        report BUSY "ios simulator booted (${E2E_IOS_SIMULATOR} or any booted for default)"
      else
        # Finding #3: "global" is an ambiguous fallback, not confirmed iOS intent — do not
        # fail the whole host-clear check just because an unrelated simulator happens to
        # be booted. Pass --platform=ios (or set RNFB_E2E_PLATFORM=ios) to enforce.
        report INFO "ios simulator booted (${E2E_IOS_SIMULATOR} or another) — global mode does not fail on this; pass --platform=ios to enforce"
      fi
    else
      report CLEAR "ios simulator (${E2E_IOS_SIMULATOR})"
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
    echo "[check-e2e-resources] BUSY" >&2
  fi
  exit 1
fi
if [[ "$JSON" -eq 0 ]]; then
  echo "[check-e2e-resources] CLEAR"
fi
exit 0
