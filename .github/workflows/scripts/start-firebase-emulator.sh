#!/bin/bash
# Canonical Firebase emulator start for yarn tests:emulator:start / start-ci.
# Honors RNFB_*_EMULATOR_* (serial firebase.json defaults when unset). Pins aux
# Firestore websocket / Eventarc / Tasks (slotted: FS+8/+9/+12; serial: 9150/9299/9499).
# Aborts if suite ports are busy. Ready-check uses env Functions port — never hardcoded :8080.
#
# Emulator UI stays disabled (template ui.enabled=false): CI is headless and needs
# no dashboard; enabling would add another listener per suite. A per-slot UI port
# could be derived as firestore+13 (unique per platform×slot block) if wired later
# for local debugging — not interpolated here.
#
# Modes (same implementation):
#   (default)  background suite, wait until Functions is listening, then return 0
#   --no-daemon  foreground (interactive)
set -euo pipefail

SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPTS}/../../.." && pwd)"
# shellcheck source=../../../scripts/e2e/lib/e2e-resource-env.sh
source "${REPO_ROOT}/scripts/e2e/lib/e2e-resource-env.sh"
# shellcheck source=../../../scripts/e2e/lib/e2e-slot-env.sh
source "${REPO_ROOT}/scripts/e2e/lib/e2e-slot-env.sh"
# shellcheck source=firebase-cli.sh
source "${SCRIPTS}/firebase-cli.sh"

NO_DAEMON=0
PLATFORM_ARG=""
SLOT_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-daemon)
      NO_DAEMON=1
      shift
      ;;
    android | ios | macos)
      PLATFORM_ARG=$1
      shift
      ;;
    [0-9]*)
      SLOT_ARG=$1
      shift
      ;;
    *)
      echo "unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -n "$PLATFORM_ARG" && -n "$SLOT_ARG" ]]; then
  e2e_slot_env_apply "$PLATFORM_ARG" "$SLOT_ARG"
else
  e2e_sanitize_serial_env
fi

e2e_resolve_active_emulator_platform() {
  local p prefix metro resolved=""
  if [[ -n "${PLATFORM_ARG}" ]]; then
    resolved="$PLATFORM_ARG"
  elif [[ -n "${RCT_METRO_PORT:-}" ]]; then
    for p in android ios macos; do
      prefix=$(echo "$p" | tr '[:lower:]' '[:upper:]')
      metro=$(e2e_env_get "RNFB_${prefix}_METRO_PORT")
      if [[ -n "$metro" && "$metro" == "$RCT_METRO_PORT" ]]; then
        resolved="$p"
        break
      fi
    done
  elif [[ -n "${RNFB_E2E_PLATFORM:-}" ]]; then
    resolved="$RNFB_E2E_PLATFORM"
  fi
  if [[ -z "$resolved" ]]; then
    return 1
  fi
  if ! e2e_validate_platform_name "$resolved"; then
    return 2
  fi
  echo "$resolved"
  return 0
}

PLATFORM=""
if PLATFORM="$(e2e_resolve_active_emulator_platform)"; then
  :
else
  _platform_rc=$?
  if [[ "$_platform_rc" -eq 2 ]]; then
    exit 2
  fi
  PLATFORM=""
fi
unset _platform_rc

SLOT="${RNFB_E2E_HOST_SLOT:-${RNFB_E2E_SLOT:-serial}}"

if [[ -n "$PLATFORM" ]]; then
  prefix="$(echo "${PLATFORM}" | tr '[:lower:]' '[:upper:]')"
  eval "FS_PORT=\${RNFB_${prefix}_EMULATOR_FIRESTORE_PORT:-}"
  eval "AUTH_PORT=\${RNFB_${prefix}_EMULATOR_AUTH_PORT:-}"
  eval "DB_PORT=\${RNFB_${prefix}_EMULATOR_DATABASE_PORT:-}"
  eval "FN_PORT=\${RNFB_${prefix}_EMULATOR_FUNCTIONS_PORT:-}"
  eval "ST_PORT=\${RNFB_${prefix}_EMULATOR_STORAGE_PORT:-}"
  eval "HUB_PORT=\${RNFB_${prefix}_EMULATOR_HUB_PORT:-}"
  eval "LOG_PORT=\${RNFB_${prefix}_EMULATOR_LOGGING_PORT:-}"
  if [[ -z "${FS_PORT:-}" || -z "${FN_PORT:-}" ]]; then
    echo "error: active platform ${PLATFORM} but RNFB_${prefix}_EMULATOR_* ports are unset" >&2
    exit 1
  fi
  WS_PORT=$((FS_PORT + 8))
  EVENTARC_PORT=$((FS_PORT + 9))
  TASKS_PORT=$((FS_PORT + 12))
  TAG="${PLATFORM}"
else
  FS_PORT=$E2E_DEFAULT_FIRESTORE_PORT
  AUTH_PORT=$E2E_DEFAULT_AUTH_PORT
  DB_PORT=$E2E_DEFAULT_DATABASE_PORT
  FN_PORT=$E2E_DEFAULT_FUNCTIONS_PORT
  ST_PORT=$E2E_DEFAULT_STORAGE_PORT
  HUB_PORT=$E2E_DEFAULT_HUB_PORT
  LOG_PORT=$E2E_DEFAULT_LOGGING_PORT
  # Serial Firebase Tools aux defaults (FS+8/+9/+12 would collide with Jet :8090).
  WS_PORT=9150
  EVENTARC_PORT=9299
  TASKS_PORT=9499
  TAG="serial"
fi

e2e_abort_if_emulator_suite_ports_busy \
  "$FS_PORT" "$AUTH_PORT" "$DB_PORT" "$FN_PORT" "$ST_PORT" "$HUB_PORT" "$LOG_PORT"

# Serial aux ports are not FS+8; abort_if only checks FS+8/+9/+12. Probe serial aux too.
if [[ "$TAG" == "serial" ]]; then
  for spec in "websocket:${WS_PORT}" "eventarc:${EVENTARC_PORT}" "tasks:${TASKS_PORT}"; do
    name="${spec%%:*}"
    port="${spec#*:}"
    if e2e_port_listening "$port"; then
      pids=$(e2e_listener_pids "$port" | tr '\n' ' ')
      echo "error: emulator suite port busy: ${name} :${port} pids=${pids}" >&2
      echo "error: cannot start emulator suite — suite ports must be free. Abort; zero flake budget." >&2
      exit 1
    fi
  done
fi

CONFIG="${SCRIPTS}/.e2e-emulator-${TAG}-${SLOT}.json"
python3 - <<PY
import json
tpl = json.load(open("${SCRIPTS}/firebase.emulator.template.json"))
tpl["emulators"]["firestore"] = {
    "port": int("${FS_PORT}"),
    "websocketPort": int("${WS_PORT}"),
}
tpl["emulators"]["auth"]["port"] = int("${AUTH_PORT}")
tpl["emulators"]["database"]["port"] = int("${DB_PORT}")
tpl["emulators"]["functions"]["port"] = int("${FN_PORT}")
tpl["emulators"]["storage"]["port"] = int("${ST_PORT}")
tpl["emulators"]["hub"] = {"port": int("${HUB_PORT}")}
tpl["emulators"]["logging"] = {"port": int("${LOG_PORT}")}
tpl["emulators"]["eventarc"] = {"port": int("${EVENTARC_PORT}")}
tpl["emulators"]["tasks"] = {"port": int("${TASKS_PORT}")}
json.dump(tpl, open("${CONFIG}", "w"), indent=2)
PY

echo "[emulator-${TAG}] config=${CONFIG} firestore=${FS_PORT} functions=${FN_PORT} websocket=${WS_PORT} eventarc=${EVENTARC_PORT} tasks=${TASKS_PORT}"

LOCK_DIR="${SCRIPTS}/functions/.build.lock.d"
mkdir -p "${SCRIPTS}/functions"
deadline=$((SECONDS + 300))
while ! mkdir "${LOCK_DIR}" 2>/dev/null; do
  if (( SECONDS >= deadline )); then
    echo "error: timed out waiting for functions build lock ${LOCK_DIR}" >&2
    exit 1
  fi
  sleep 1
done
cleanup_lock() { rmdir "${LOCK_DIR}" 2>/dev/null || true; }
trap cleanup_lock EXIT
pushd "${SCRIPTS}/functions" >/dev/null
yarn >/dev/null 2>&1 || yarn
yarn build
popd >/dev/null
cleanup_lock
trap - EXIT

EMU_LOG="${RNFB_EMULATOR_LOG:-/tmp/rnfb-emulator-${TAG}-s${SLOT}.log}"
READY_TIMEOUT="${RNFB_EMULATOR_READY_TIMEOUT:-300}"
EMU_PID=""

kill_started_suite() {
  local port pids
  if [[ -n "${EMU_PID:-}" ]] && kill -0 "${EMU_PID}" 2>/dev/null; then
    kill "${EMU_PID}" 2>/dev/null || true
    sleep 1
    if kill -0 "${EMU_PID}" 2>/dev/null; then
      kill -9 "${EMU_PID}" 2>/dev/null || true
    fi
  fi
  for port in "$FS_PORT" "$AUTH_PORT" "$DB_PORT" "$FN_PORT" "$ST_PORT" "$HUB_PORT" "$LOG_PORT" \
    "$WS_PORT" "$EVENTARC_PORT" "$TASKS_PORT"; do
    pids="$(e2e_listener_pids "$port" | tr '\n' ' ')"
    if [[ -n "${pids// /}" ]]; then
      # shellcheck disable=SC2086
      kill ${pids} 2>/dev/null || true
      sleep 0.5
      pids="$(e2e_listener_pids "$port" | tr '\n' ' ')"
      if [[ -n "${pids// /}" ]]; then
        # shellcheck disable=SC2086
        kill -9 ${pids} 2>/dev/null || true
      fi
    fi
  done
  wait "${EMU_PID}" 2>/dev/null || true
}

cd "${SCRIPTS}"
EMU_START=("${FIREBASE_CMD[@]}" emulators:start --config "${CONFIG}" --only auth,database,firestore,functions,storage --project react-native-firebase-testing)

if [[ "$NO_DAEMON" -eq 1 ]]; then
  echo "Starting Firebase Emulator Suite in foreground."
  exec "${EMU_START[@]}"
fi

# Never register kill_started_suite on EXIT — a healthy start must leave emulators running after exit 0.
trap '' HUP
echo "[emulator-${TAG}] starting background suite log=${EMU_LOG}"
"${EMU_START[@]}" >"${EMU_LOG}" 2>&1 &
EMU_PID=$!
disown "${EMU_PID}" 2>/dev/null || true

ready_deadline=$((SECONDS + READY_TIMEOUT))
while ! e2e_port_listening "$FN_PORT"; do
  if (( SECONDS >= ready_deadline )); then
    echo "error: timed out after ${READY_TIMEOUT}s waiting for Functions :${FN_PORT} (log=${EMU_LOG})" >&2
    kill_started_suite
    exit 1
  fi
  if ! kill -0 "${EMU_PID}" 2>/dev/null; then
    echo "error: firebase emulators exited before Functions :${FN_PORT} was listening (log=${EMU_LOG})" >&2
    kill_started_suite
    exit 1
  fi
  sleep 1
done

echo "[emulator-${TAG}] ready functions=:${FN_PORT} pid=${EMU_PID} log=${EMU_LOG}"
exit 0
