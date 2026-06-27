#!/bin/bash
# Start or restart iOS simulator log streams and resource monitor (sourced by boot-simulator.sh).
set -uo pipefail

restart_simulator_logging() {
  local with_stdout="${RNFB_SIM_LOG_STDOUT:-0}"
  local log_dir="${RNFB_SIM_LOG_DIR:-.}"
  local simulator_log="${log_dir}/simulator.log"
  local testing_log="${log_dir}/testing.log"
  local springboard_log="${log_dir}/springboard-invertase.log"
  local resource_log="${log_dir}/resource-monitor.log"
  local repo_root="${RNFB_REPO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)}"

  if ! xcrun simctl list devices booted 2>/dev/null | grep -q Booted; then
    echo "[boot-status] phase=log_streams skipped=no_booted_simulator"
    return 1
  fi

  echo "[boot-status] phase=log_streams_restart ts=$(date -u +%Y-%m-%dT%H:%M:%SZ) stdout=${with_stdout} dir=${log_dir}"

  pkill -f 'simctl spawn booted log stream' 2>/dev/null || true
  pkill -f 'simctl io booted recordVideo' 2>/dev/null || true
  pkill -f resource-monitor.sh 2>/dev/null || true
  sleep 1

  {
    echo ""
    echo "=== log stream restarted $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  } >>"$simulator_log" 2>/dev/null || : >"$simulator_log"
  {
    echo ""
    echo "=== log stream restarted $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  } >>"$testing_log" 2>/dev/null || : >"$testing_log"
  {
    echo ""
    echo "=== log stream restarted $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  } >>"$springboard_log" 2>/dev/null || : >"$springboard_log"

  if [[ "$with_stdout" == "1" ]]; then
    xcrun simctl io booted recordVideo --codec=h264 -f "${log_dir}/simulator.mp4" 2>&1 &
    xcrun simctl spawn booted log stream --level debug --style compact 2>&1 | tee -a "$simulator_log" &
    xcrun simctl spawn booted log stream --level debug --style compact \
      --predicate 'process == "testing"' 2>&1 | tee -a "$testing_log" &
    xcrun simctl spawn booted log stream --level debug --style compact \
      --predicate 'process == "SpringBoard" AND eventMessage CONTAINS "invertase"' 2>&1 | tee -a "$springboard_log" &
  else
    nohup sh -c "xcrun simctl io booted recordVideo --codec=h264 -f '${log_dir}/simulator.mp4' 2>&1 &" >/dev/null 2>&1 &
    nohup sh -c "xcrun simctl spawn booted log stream --level debug --style compact >>'${simulator_log}' 2>&1 &" >/dev/null 2>&1 &
    nohup sh -c "xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == \"testing\"' >>'${testing_log}' 2>&1 &" >/dev/null 2>&1 &
    nohup sh -c "xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == \"SpringBoard\" AND eventMessage CONTAINS \"invertase\"' >>'${springboard_log}' 2>&1 &" >/dev/null 2>&1 &
  fi

  chmod +x "${repo_root}/.github/workflows/scripts/resource-monitor.sh"
  RNFB_RESOURCE_MONITOR_LOG="$resource_log" nohup "${repo_root}/.github/workflows/scripts/resource-monitor.sh" >/dev/null 2>&1 &

  echo "[boot-status] phase=log_streams_started video=${log_dir}/simulator.mp4 monitor=${resource_log}"
}
