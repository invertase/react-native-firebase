#!/bin/bash

# Boot the Detox iOS simulator, wait until it is fully ready for testing (including
# first-boot data migration on fresh simulators), then install the test app.
# Resolves or creates the simulator UDID on the pinned iOS 27 runtime (simctl backend).
set -euo pipefail

BOOT_POLL_INTERVAL_SECONDS="${BOOT_POLL_INTERVAL_SECONDS:-20}"
BOOT_PROBE_TIMEOUT_SECONDS="${BOOT_PROBE_TIMEOUT_SECONDS:-12}"
BOOT_MAX_WAIT_SECONDS="${BOOT_MAX_WAIT_SECONDS:-660}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../../scripts/e2e/lib/ios-simulator-helpers.sh
source "${SCRIPT_DIR}/../../../scripts/e2e/lib/ios-simulator-helpers.sh"

run_with_timeout() {
  local max="$1"
  shift
  "$@" &
  local cmd_pid=$!
  local waited=0
  while kill -0 "$cmd_pid" 2>/dev/null && (( waited < max )); do
    sleep 1
    waited=$((waited + 1))
  done
  if kill -0 "$cmd_pid" 2>/dev/null; then
    kill "$cmd_pid" 2>/dev/null
    wait "$cmd_pid" 2>/dev/null || true
    return 124
  fi
  wait "$cmd_pid"
}

log_boot_status() {
  echo "[boot-status] $*"
}

describe_booted_udid() {
  local udid="$1"
  xcrun simctl list devices booted 2>/dev/null \
    | grep -F "(${udid})" \
    | grep -v 'unavailable' \
    | head -1 \
    || true
}

kill_resolved_simulator() {
  local udid="$1"
  local name="${2:-}"

  if [[ -z "$udid" ]]; then
    log_boot_status "phase=kill_resolved udid=empty name=\"${name}\" not found, skipping"
    return 0
  fi

  log_boot_status "phase=kill_resolved udid=${udid} name=\"${name}\""
  rnfb_kill_foreground_simulator_ui
  xcrun simctl terminate "$udid" io.invertase.testing 2>/dev/null || true
  xcrun simctl shutdown "$udid" 2>/dev/null || true
}

log_migration_status() {
  local udid="$1"
  local migration_output probe_rc

  log_boot_status "probing data migration (bootstatus -d, up to ${BOOT_PROBE_TIMEOUT_SECONDS}s)..."
  set +e
  migration_output="$(run_with_timeout "$BOOT_PROBE_TIMEOUT_SECONDS" xcrun simctl bootstatus "$udid" -d 2>&1)"
  probe_rc=$?
  set -e

  if [[ "$probe_rc" -eq 124 ]]; then
    log_boot_status "  data migration / system bring-up still in progress"
    return 1
  fi

  if [[ -n "$migration_output" ]]; then
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      log_boot_status "  ${line}"
    done <<<"$migration_output"
  else
    log_boot_status "  no migration details reported"
  fi
  return 0
}

wait_for_simulator_ready() {
  local udid="$1"
  local name="${2:-}"
  local start=$SECONDS

  while (( SECONDS - start < BOOT_MAX_WAIT_SECONDS )); do
    local elapsed=$(( SECONDS - start ))
    local booted_line ready_rc

    log_boot_status "elapsed=${elapsed}s phase=wait_for_full_boot udid=${udid} name=\"${name}\""

    booted_line="$(describe_booted_udid "$udid")"
    if [[ -z "$booted_line" ]]; then
      log_boot_status "  simctl list: not in Booted state yet"
    else
      log_boot_status "  simctl list: ${booted_line}"
      log_migration_status "$udid" || true
    fi

    set +e
    run_with_timeout "$BOOT_PROBE_TIMEOUT_SECONDS" xcrun simctl bootstatus "$udid" >/dev/null 2>&1
    ready_rc=$?
    set -e

    if [[ "$ready_rc" -eq 0 ]]; then
      log_boot_status "bootstatus: simulator ready after ${elapsed}s"
      log_migration_status "$udid" || true
      return 0
    fi

    if [[ "$ready_rc" -eq 124 ]]; then
      log_boot_status "bootstatus: still booting (probe timed out after ${BOOT_PROBE_TIMEOUT_SECONDS}s)"
    else
      log_boot_status "bootstatus: probe exited with status ${ready_rc}"
    fi

    sleep "$BOOT_POLL_INTERVAL_SECONDS"
  done

  log_boot_status "ERROR: timed out after ${BOOT_MAX_WAIT_SECONDS}s waiting for simulator to become ready"
  return 1
}

BOOT_MODE="${RNFB_SIM_BOOT_MODE:-full}"

# shellcheck source=simulator-logging.sh
source "${SCRIPT_DIR}/simulator-logging.sh"

if [[ "$BOOT_MODE" == "logs" ]]; then
  restart_simulator_logging || true
  exit 0
fi

# shellcheck source=resolve-ios-simulator-name.sh
source "${SCRIPT_DIR}/resolve-ios-simulator-name.sh"
SIM="$(resolve_ios_simulator_name "${SCRIPT_DIR}/../../../tests/.detoxrc.js")"
if [[ -n "${RNFB_IOS_SIMULATOR:-}" ]]; then
  log_boot_status "phase=resolve_device name=\"${SIM}\" (from RNFB_IOS_SIMULATOR)"
else
  log_boot_status "phase=resolve_device name=\"${SIM}\" (from tests/.detoxrc.js)"
fi

SIM_UDID="$(rnfb_ensure_ios_simulator_udid "$SIM")"
export RNFB_IOS_SIMULATOR_UDID="$SIM_UDID"
log_boot_status "phase=resolve_udid udid=${SIM_UDID} runtime=$(rnfb_ios_sim_runtime_label)"

kill_resolved_simulator "$SIM_UDID" "$SIM"

log_boot_status "phase=boot_command starting simctl boot udid=${SIM_UDID}..."
set +e
boot_output="$(xcrun simctl boot "$SIM_UDID" 2>&1)"
boot_rc=$?
set -e
if [[ "$boot_rc" -ne 0 ]]; then
  log_boot_status "simctl boot exited ${boot_rc}: ${boot_output}"
else
  log_boot_status "simctl boot command returned (device may still be migrating data)"
fi

if [[ "${RNFB_SIM_UI_HEADLESS:-0}" != "1" ]]; then
  hub="$(rnfb_resolve_foreground_simulator_ui_app 2>/dev/null || true)"
  log_boot_status "phase=foreground_simulator opening ${hub:-DeviceHub} udid=${SIM_UDID}..."
  rnfb_open_device_hub_for_udid "$SIM_UDID"
fi

if ! wait_for_simulator_ready "$SIM_UDID" "$SIM"; then
  exit 1
fi

pushd "${SCRIPT_DIR}/../../../tests" >/dev/null || exit 1
BUILDDIR="$(find ios/build/Build/Products -type d -name 'testing.app' 2>/dev/null | head -1)"

if [[ -z "$BUILDDIR" || ! -d "$BUILDDIR" ]]; then
  log_boot_status "ERROR: could not find tests/ios/build/.../testing.app"
  popd >/dev/null || exit 1
  exit 1
fi

booted_line="$(describe_booted_udid "$SIM_UDID")"
if [[ -z "$booted_line" ]]; then
  log_boot_status "phase=wait_shutdown udid=${SIM_UDID} waiting for Shutdown before install..."
  shutdown_wait=0
  while (( shutdown_wait < 120 )); do
    booted_line="$(describe_booted_udid "$SIM_UDID")"
    if [[ -z "$booted_line" ]]; then
      log_boot_status "phase=wait_shutdown udid=${SIM_UDID} device not Booted after ${shutdown_wait}s"
      break
    fi
    sleep 2
    shutdown_wait=$((shutdown_wait + 2))
  done
  if [[ -n "$(describe_booted_udid "$SIM_UDID")" ]]; then
    log_boot_status "phase=wait_shutdown udid=${SIM_UDID} still Booted after ${shutdown_wait}s — proceeding with install anyway"
  fi
fi

log_boot_status "phase=install_app udid=${SIM_UDID} bundle=\"${BUILDDIR}\""
install_start=$SECONDS
xcrun simctl install "$SIM_UDID" "$BUILDDIR"
log_boot_status "install complete in $((SECONDS - install_start))s"
popd >/dev/null || exit 1

log_boot_status "phase=complete udid=${SIM_UDID} name=\"${SIM}\" ready with test app installed"

if [[ "${RNFB_START_SIM_LOGS:-1}" == "1" && "$BOOT_MODE" == "full" ]]; then
  restart_simulator_logging || true
fi
