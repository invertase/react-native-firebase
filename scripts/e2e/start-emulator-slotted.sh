#!/usr/bin/env bash
# Start one Firebase emulator suite for a platform using RNFB_<PLATFORM>_EMULATOR_* env vars.
#
# Also pins Firestore websocket / Eventarc / Cloud Tasks ports. Firebase Tools still
# starts eventarc+tasks as Functions dependencies and defaults Firestore's UI websocket
# to 9150 — those collide when multiple suites share a host (EADDRINUSE → suite dies;
# only the winner keeps a working Functions emulator).
set -euo pipefail

PLATFORM="${1:?platform required: android|ios|macos}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SCRIPTS="${REPO_ROOT}/.github/workflows/scripts"
SLOT="${RNFB_E2E_HOST_SLOT:-${RNFB_E2E_SLOT:-0}}"

prefix="$(echo "${PLATFORM}" | tr '[:lower:]' '[:upper:]')"

eval "FS_PORT=\$RNFB_${prefix}_EMULATOR_FIRESTORE_PORT"
eval "AUTH_PORT=\$RNFB_${prefix}_EMULATOR_AUTH_PORT"
eval "DB_PORT=\$RNFB_${prefix}_EMULATOR_DATABASE_PORT"
eval "FN_PORT=\$RNFB_${prefix}_EMULATOR_FUNCTIONS_PORT"
eval "ST_PORT=\$RNFB_${prefix}_EMULATOR_STORAGE_PORT"
eval "HUB_PORT=\$RNFB_${prefix}_EMULATOR_HUB_PORT"
eval "LOG_PORT=\$RNFB_${prefix}_EMULATOR_LOGGING_PORT"

for v in FS_PORT AUTH_PORT DB_PORT FN_PORT ST_PORT HUB_PORT LOG_PORT; do
  if [[ -z "${!v:-}" ]]; then
    echo "error: ${v} not set (export RNFB_${prefix}_EMULATOR_* ports first)" >&2
    exit 1
  fi
done

# Offsets within the platform block (FS_PORT is BLK+0):
# +8 websocket, +9 eventarc, +12 tasks (skip +10/+11 Jet).
WS_PORT=$((FS_PORT + 8))
EVENTARC_PORT=$((FS_PORT + 9))
TASKS_PORT=$((FS_PORT + 12))

CONFIG="${SCRIPTS}/.e2e-emulator-${PLATFORM}-${SLOT}.json"
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

echo "[emulator-${PLATFORM}] config=${CONFIG} firestore=${FS_PORT} functions=${FN_PORT} websocket=${WS_PORT} eventarc=${EVENTARC_PORT} tasks=${TASKS_PORT}"

# Serialize functions yarn/build — parallel suites share this directory (macOS has no flock).
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

# shellcheck source=firebase-cli.sh
source "${SCRIPTS}/firebase-cli.sh"

cd "${SCRIPTS}"
"${FIREBASE_CMD[@]}" emulators:start \
  --config "${CONFIG}" \
  --only auth,database,firestore,functions,storage \
  --project react-native-firebase-testing
