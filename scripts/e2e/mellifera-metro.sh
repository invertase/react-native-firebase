#!/usr/bin/env bash
# Slotted Metro start helper (per-platform RCT_METRO_PORT).
# Sourced by run-mellifera-verify-parallel.sh — not a clearance entrypoint.
# To clear Metro alone: bash scripts/e2e/release-e2e-resources.sh --only metro
# Canonical packager for serial runs remains:
#   iOS/Android: yarn tests:packager:jet  (cwd tests/)
#   macOS:       yarn tests:macos:packager:jet  (cwd tests-macos/)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Kill the process listening on a Metro port (if any).
mellifera_kill_metro_on_port() {
  local port=$1
  # Prefer generic release when env already points at this port.
  if [[ "${RCT_METRO_PORT:-}" == "$port" || "${RNFB_METRO_PORT:-}" == "$port" ]]; then
    bash "${SCRIPT_DIR}/release-e2e-resources.sh" --only metro >/dev/null 2>&1 || true
    return 0
  fi
  local pid
  pid=$(lsof -nP -iTCP:"${port}" -sTCP:LISTEN -t 2>/dev/null | head -1 || true)
  if [[ -n "$pid" ]]; then
    echo "[metro] stopping pid=${pid} on :${port}" >&2
    kill "$pid" 2>/dev/null || true
    sleep 2
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
      sleep 1
    fi
  fi
}

# Start Metro on the current platform env (RCT_METRO_PORT must be set).
# Args: repo_root platform log_file use_reset_cache(0|1)
# Prints new Metro PID to stdout.
mellifera_start_metro() {
  local repo_root=$1 platform=$2 log_file=$3 use_reset_cache=${4:-0}
  local port="${RCT_METRO_PORT:?RCT_METRO_PORT required}"
  local -a extra=()

  if [[ "$use_reset_cache" == "1" ]]; then
    extra+=(--reset-cache)
  fi

  mellifera_kill_metro_on_port "$port"
  echo "[metro-${platform}] port=${port} reset_cache=${use_reset_cache} log=${log_file}" >&2
  local packager_cwd="${repo_root}/tests"
  if [[ "$platform" == "macos" ]]; then
    packager_cwd="${repo_root}/tests-macos"
  fi
  (
    cd "${packager_cwd}"
    export RNFB_MELLIFERA=1 RCT_METRO_PORT JET_REMOTE_PORT JET_METRO_PORT RNFB_JET_CONTROL_PORT
    yarn react-native start --port "${port}" "${extra[@]}" --client-logs
  ) >>"$log_file" 2>&1 &
  echo $!
}
