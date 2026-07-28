#!/usr/bin/env bash
# Boot Detox iOS simulator and install the test app (Tart copy; uses RNFB_REPO_ROOT).
set -euo pipefail

BOOT_POLL_INTERVAL_SECONDS="${BOOT_POLL_INTERVAL_SECONDS:-20}"
BOOT_PROBE_TIMEOUT_SECONDS="${BOOT_PROBE_TIMEOUT_SECONDS:-12}"
BOOT_MAX_WAIT_SECONDS="${BOOT_MAX_WAIT_SECONDS:-660}"

REPO_ROOT="${RNFB_REPO_ROOT:?RNFB_REPO_ROOT must point at the mounted worktree}"

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

# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

log_boot_status() {
  rnfb_tart_log "[boot-status] $*"
}

rnfb_tart_open_simulator_app() {
  if [[ "${RNFB_HEADLESS_SIMULATOR:-1}" == "1" ]]; then
    log_boot_status "phase=foreground_simulator skipping Simulator.app (headless Tart VM)"
    return 0
  fi

  local sim_app=""
  for candidate in \
    "$(xcode-select -p 2>/dev/null)/Applications/Simulator.app" \
    "/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app" \
    "/Applications/Xcode_26.5.app/Contents/Developer/Applications/Simulator.app"; do
    if [[ -d "$candidate" ]]; then
      sim_app="$candidate"
      break
    fi
  done

  if [[ -z "$sim_app" ]]; then
    log_boot_status "phase=foreground_simulator Simulator.app not installed — continuing via simctl"
    return 0
  fi

  log_boot_status "phase=foreground_simulator opening ${sim_app}..."
  open -a "$sim_app" || log_boot_status "open Simulator returned non-zero — continuing via simctl"
}

describe_booted_device() {
  local device="$1"
  xcrun simctl list devices booted 2>/dev/null \
    | grep -i "${device} (" \
    | grep -v 'Phone:' \
    | grep -v 'unavailable' \
    | grep -v CoreSimulator \
    | head -1 \
    || true
}

resolve_device_udid() {
  local device="$1"
  local udid

  udid="$(
    xcrun simctl list devices booted 2>/dev/null \
      | grep -F "${device} (" \
      | grep -v 'unavailable' \
      | head -1 \
      | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/' \
      || true
  )"
  if [[ -n "$udid" ]]; then
    echo "$udid"
    return 0
  fi

  udid="$(
    xcrun simctl list devices available 2>/dev/null \
      | grep -F "${device} (" \
      | grep -v 'unavailable' \
      | head -1 \
      | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/' \
      || true
  )"
  echo "$udid"
}

kill_resolved_simulator() {
  local device="$1"
  local udid

  udid="$(resolve_device_udid "$device")"
  if [[ -z "$udid" ]]; then
    log_boot_status "phase=kill_resolved device=\"${device}\" not found, skipping"
    return 0
  fi

  log_boot_status "phase=kill_resolved udid=${udid} device=\"${device}\""
  killall Simulator 2>/dev/null || true
  xcrun simctl terminate "$udid" com.invertase.testing 2>/dev/null || true
  xcrun simctl shutdown "$udid" 2>/dev/null || true
  xcrun simctl shutdown "$device" 2>/dev/null || true
}

log_migration_status() {
  local device="$1"
  local migration_output probe_rc

  log_boot_status "probing data migration (bootstatus -d, up to ${BOOT_PROBE_TIMEOUT_SECONDS}s)..."
  set +e
  migration_output="$(run_with_timeout "$BOOT_PROBE_TIMEOUT_SECONDS" xcrun simctl bootstatus "$device" -d 2>&1)"
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
  local device="$1"
  local start=$SECONDS

  while (( SECONDS - start < BOOT_MAX_WAIT_SECONDS )); do
    local elapsed=$(( SECONDS - start ))
    local booted_line ready_rc

    log_boot_status "elapsed=${elapsed}s phase=wait_for_full_boot device=\"${device}\""

    booted_line="$(describe_booted_device "$device")"
    if [[ -z "$booted_line" ]]; then
      log_boot_status "  simctl list: not in Booted state yet"
    else
      log_boot_status "  simctl list: ${booted_line}"
      log_migration_status "$device" || true
    fi

    set +e
    run_with_timeout "$BOOT_PROBE_TIMEOUT_SECONDS" xcrun simctl bootstatus "$device" >/dev/null 2>&1
    ready_rc=$?
    set -e

    if [[ "$ready_rc" -eq 0 ]]; then
      log_boot_status "bootstatus: simulator ready after ${elapsed}s"
      log_migration_status "$device" || true
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

pushd "${REPO_ROOT}/tests" >/dev/null || exit 1
SIM="$(grep iPhone .detoxrc.js | head -1 | cut -d"'" -f2)"
popd >/dev/null || exit 1

BOOT_MODE="${RNFB_SIM_BOOT_MODE:-full}"
# shellcheck source=../../../../.github/workflows/scripts/simulator-logging.sh
source "${REPO_ROOT}/.github/workflows/scripts/simulator-logging.sh"

if [[ "$BOOT_MODE" == "logs" ]]; then
  restart_simulator_logging || true
  exit 0
fi

log_boot_status "phase=resolve_device name=\"${SIM}\" (from tests/.detoxrc.js)"

kill_resolved_simulator "$SIM"

log_boot_status "phase=boot_command starting simctl boot..."
set +e
boot_output="$(xcrun simctl boot "$SIM" 2>&1)"
boot_rc=$?
set -e
if [[ "$boot_rc" -ne 0 ]]; then
  log_boot_status "simctl boot exited ${boot_rc}: ${boot_output}"
else
  log_boot_status "simctl boot command returned (device may still be migrating data)"
fi

rnfb_tart_open_simulator_app

if ! wait_for_simulator_ready "$SIM"; then
  exit 1
fi

pushd "${REPO_ROOT}/tests" >/dev/null || exit 1
BUILDDIR="$(find ios/build/Build/Products -type d -name 'testing.app' 2>/dev/null | head -1)"

if [[ -z "$BUILDDIR" || ! -d "$BUILDDIR" ]]; then
  log_boot_status "ERROR: could not find tests/ios/build/.../testing.app"
  popd >/dev/null || exit 1
  exit 1
fi

install_udid="$(resolve_device_udid "$SIM")"
if [[ -n "$install_udid" ]]; then
  booted_line="$(describe_booted_device "$SIM")"
  if [[ -z "$booted_line" ]]; then
    log_boot_status "phase=wait_shutdown udid=${install_udid} waiting for Shutdown before install..."
    shutdown_wait=0
    while (( shutdown_wait < 120 )); do
      booted_line="$(describe_booted_device "$SIM")"
      if [[ -z "$booted_line" ]]; then
        log_boot_status "phase=wait_shutdown udid=${install_udid} device not Booted after ${shutdown_wait}s"
        break
      fi
      sleep 2
      shutdown_wait=$((shutdown_wait + 2))
    done
    if [[ -n "$(describe_booted_device "$SIM")" ]]; then
      log_boot_status "phase=wait_shutdown udid=${install_udid} still Booted after ${shutdown_wait}s — proceeding with install anyway"
    fi
  fi
fi

log_boot_status "phase=install_app bundle=\"${BUILDDIR}\""
install_start=$SECONDS
xcrun simctl install "$SIM" "$BUILDDIR"
log_boot_status "install complete in $((SECONDS - install_start))s"
popd >/dev/null || exit 1

log_boot_status "phase=complete device=\"${SIM}\" ready with test app installed"

if [[ "${RNFB_START_SIM_LOGS:-1}" == "1" && "$BOOT_MODE" == "full" ]]; then
  restart_simulator_logging || true
fi
