#!/usr/bin/env bash
# Canonical Metro start for yarn tests:packager:* / tests:macos:packager:*.
# Honor RCT_METRO_PORT (fallback RNFB_METRO_PORT / 8081). Always kill that port's
# listeners (SIGTERM then SIGKILL), set TMPDIR=$HOME/.metro/rnfb-${port}, drop a
# stale Watchman watch for this Metro project root and watch only allowlist trees
# Metro reloads. Start Metro, wait for /status packager-status:running, then
# succeed or fail. Leaves Metro running (no setsid / no reuse-if-up).
#
# Usage:
#   bash scripts/e2e/start-packager.sh tests [--client-logs|--reset-cache ...]
#   bash scripts/e2e/start-packager.sh tests-macos [--reset-cache]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=lib/e2e-resource-env.sh
source "${SCRIPT_DIR}/lib/e2e-resource-env.sh"

APP_DIR="${1:?metro project dir required: tests|tests-macos}"
shift

case "$APP_DIR" in
  tests | tests-macos) ;;
  *)
    echo "error: metro project must be tests or tests-macos (got ${APP_DIR})" >&2
    exit 2
    ;;
esac

e2e_sanitize_serial_env

METRO_ROOT="${REPO_ROOT}/${APP_DIR}"
PORT="${RCT_METRO_PORT:-${RNFB_METRO_PORT:-${JET_METRO_PORT:-8081}}}"
export RCT_METRO_PORT="$PORT"
CACHE_DIR="${HOME}/.metro/rnfb-${PORT}"
mkdir -p "$CACHE_DIR"
export TMPDIR="$CACHE_DIR"
STATUS_WAIT_SEC="${RNFB_METRO_STATUS_WAIT_SEC:-180}"
METRO_LOG="${RNFB_METRO_LOG:-/tmp/rnfb-metro-${PORT}.log}"

kill_port_listeners() {
  local port=$1
  local pids
  pids="$(e2e_listener_pids "$port")"
  if [[ -z "${pids}" ]]; then
    return 0
  fi
  echo "[packager] SIGTERM :${port} pids=$(echo "$pids" | tr '\n' ' ')"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  sleep 1
  pids="$(e2e_listener_pids "$port")"
  if [[ -n "${pids}" ]]; then
    echo "[packager] SIGKILL :${port} pids=$(echo "$pids" | tr '\n' ' ')"
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
}

watchman_reset_allowlist() {
  if ! command -v watchman >/dev/null 2>&1; then
    return 0
  fi
  echo "[packager] watchman watch-del metro root ${METRO_ROOT}"
  watchman watch-del "$METRO_ROOT" >/dev/null 2>&1 || true
  # Do not watch-del $REPO_ROOT: a same-worktree sibling packager (android+ios
  # share tests/; macos is tests-macos/) still needs its watches. Dropping the
  # whole tree left /status dead by :test-cover (anrser4 Metro wait / macOS bundle).
  # Do not keep a whole-monorepo watch (native */build noise) — only allowlist below.
  local dir
  # Allowlist: this Metro project root + packages Metro already watchFolders.
  watchman watch-project "$METRO_ROOT" >/dev/null 2>&1 || true
  for dir in "${REPO_ROOT}/packages"/*; do
    [[ -d "$dir" ]] || continue
    watchman watch-project "$dir" >/dev/null 2>&1 || true
  done
  if [[ "$APP_DIR" == "tests-macos" ]]; then
    watchman watch-project "${REPO_ROOT}/tests" >/dev/null 2>&1 || true
  fi
}

kill_port_listeners "$PORT"
watchman_reset_allowlist

echo "[packager] start project=${METRO_ROOT} port=${PORT} TMPDIR=${TMPDIR} log=${METRO_LOG}"
cd "$METRO_ROOT"
# Ignore SIGHUP so a background agent starter can exit; do not setsid (unproven).
trap '' HUP
yarn react-native start "$@" >"${METRO_LOG}" 2>&1 &
METRO_PID=$!
disown "${METRO_PID}" 2>/dev/null || true

deadline=$((SECONDS + STATUS_WAIT_SEC))
body=""
while ((SECONDS < deadline)); do
  if ! kill -0 "${METRO_PID}" 2>/dev/null; then
    echo "error: Metro pid ${METRO_PID} exited before /status packager-status:running (log=${METRO_LOG})" >&2
    exit 1
  fi
  body="$(curl -sf "http://127.0.0.1:${PORT}/status" 2>/dev/null || true)"
  if [[ "$body" == *"packager-status:running"* ]]; then
    echo "[packager] ready :${PORT} packager-status:running pid=${METRO_PID}"
    exit 0
  fi
  sleep 1
done

echo "error: timed out after ${STATUS_WAIT_SEC}s waiting for http://127.0.0.1:${PORT}/status packager-status:running (last body: ${body:-<empty>}) log=${METRO_LOG}" >&2
exit 1
