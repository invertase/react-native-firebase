#!/bin/bash
# Start or restart iOS simulator focused log stream and resource monitor (sourced by boot-simulator.sh).
set -uo pipefail

restart_simulator_logging() {
  local with_stdout="${RNFB_SIM_LOG_STDOUT:-0}"
  local record_screens="${RNFB_RECORD_SCREENS:-0}"
  local log_dir="${RNFB_SIM_LOG_DIR:-.}"
  local sim_app_log="${log_dir}/sim-app.log"
  local resource_log="${log_dir}/resource-monitor.log"
  local repo_root="${RNFB_REPO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)}"
  local log_predicate='process == "testing" OR (process == "SpringBoard" AND eventMessage CONTAINS "invertase") OR eventMessage CONTAINS[c] "RNFBStorage" OR eventMessage CONTAINS[c] "FIRStorage" OR eventMessage CONTAINS[c] "StorageTask"'

  if ! xcrun simctl list devices booted 2>/dev/null | grep -q Booted; then
    echo "[boot-status] phase=log_streams skipped=no_booted_simulator"
    return 1
  fi

  echo "[boot-status] phase=log_streams_restart ts=$(date -u +%Y-%m-%dT%H:%M:%SZ) stdout=${with_stdout} record_screens=${record_screens} dir=${log_dir}"

  pkill -f 'simctl spawn booted log stream' 2>/dev/null || true
  pkill -f 'simctl io booted recordVideo' 2>/dev/null || true
  pkill -f resource-monitor.sh 2>/dev/null || true
  sleep 1

  {
    echo ""
    echo "=== log stream restarted $(date -u +%Y-%m-%dT%H:%M:%SZ) predicate=${log_predicate} ==="
  } >>"$sim_app_log" 2>/dev/null || : >"$sim_app_log"

  if [[ "$record_screens" == "1" ]]; then
    if [[ "$with_stdout" == "1" ]]; then
      xcrun simctl io booted recordVideo --codec=h264 -f "${log_dir}/simulator.mp4" 2>&1 &
    else
      nohup sh -c "xcrun simctl io booted recordVideo --codec=h264 -f '${log_dir}/simulator.mp4' 2>&1 &" >/dev/null 2>&1 &
    fi
  fi

  if [[ "$with_stdout" == "1" ]]; then
    xcrun simctl spawn booted log stream --level debug --style compact \
      --predicate "$log_predicate" 2>&1 | tee -a "$sim_app_log" &
  else
    nohup sh -c "xcrun simctl spawn booted log stream --level debug --style compact --predicate '${log_predicate}' >>'${sim_app_log}' 2>&1 &" >/dev/null 2>&1 &
  fi

  chmod +x "${repo_root}/.github/workflows/scripts/resource-monitor.sh"
  RNFB_RESOURCE_MONITOR_LOG="$resource_log" nohup "${repo_root}/.github/workflows/scripts/resource-monitor.sh" >/dev/null 2>&1 &

  echo "[boot-status] phase=log_streams_started sim_app_log=${sim_app_log} video=$([[ "$record_screens" == "1" ]] && echo "${log_dir}/simulator.mp4" || echo disabled) monitor=${resource_log}"
}
