#!/usr/bin/env bash
# Host: ephemeral VM from warmed image, mount worktree, run one iteration, delete VM.
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

rnfb_tart_require tart
rnfb_tart_require sshpass

WORKTREE=""
BUILD_MODE="debug"
ITERATION="0"
WARMED_VM="${RNFB_TART_WARMED_VM}"
KEEP_VM=0
GRAPHICS=0
SYNC_ARTIFACTS=1

usage() {
  cat <<EOF
usage: $0 --worktree PATH [--mode debug|release] [--iteration N] [--warmed-vm NAME] [--keep-vm] [--graphics] [--no-sync-artifacts]

Ephemeral iOS e2e iteration using a warmed Tart VM and virtiofs worktree mount.

Iteration runs detached inside the VM (nohup). The host polls virtiofs for
iteration-complete.json — no long-lived SSH log stream.

The VM stays running from boot through iteration + SCP harvest. The host
orchestrator tears it down only at the end (or leaves it running with --keep-vm).

  --graphics           Open Tart VM window (Simulator.app, visual debugging). Default: headless.
  --keep-vm            Do not stop/delete the VM when finished (use stop-ephemeral.sh later).
  --no-sync-artifacts  Skip host SCP harvest of bulk logs (small files still sync via virtiofs).
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --worktree) WORKTREE="$2"; shift 2 ;;
    --mode) BUILD_MODE="$2"; shift 2 ;;
    --iteration) ITERATION="$2"; shift 2 ;;
    --warmed-vm) WARMED_VM="$2"; shift 2 ;;
    --keep-vm) KEEP_VM=1; shift ;;
    --graphics) GRAPHICS=1; shift ;;
    --no-sync-artifacts) SYNC_ARTIFACTS=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$WORKTREE" ]]; then
  usage >&2
  exit 1
fi
WORKTREE="$(cd "$WORKTREE" && pwd)"

if ! rnfb_tart_vm_exists "${WARMED_VM}"; then
  echo "error: warmed VM ${WARMED_VM} not found — run bake-warmed.sh first" >&2
  exit 1
fi

EPHEMERAL_VM="rnfb-e2e-$(uuidgen | tr '[:upper:]' '[:lower:]')"
SESSION_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="${SESSION_ID}-${BUILD_MODE}"
ARTIFACT_RUN_DIR="$(rnfb_tart_artifact_run_dir "$RUN_ID" "$ITERATION")"
COMPLETE_FILE="$(rnfb_tart_iteration_complete_file "$WORKTREE" "$ARTIFACT_RUN_DIR")"
REMOTE_LOG="$(rnfb_tart_iteration_remote_log "$ARTIFACT_RUN_DIR")"
REMOTE_PID_FILE="${RNFB_TART_VM_PREWARM_DIR}/scripts/tart/artifacts/${ARTIFACT_RUN_DIR}/iteration.pid"
HOST_LOG="$(rnfb_tart_artifact_session_dir "$RNFB_TART_ROOT" "$SESSION_ID")/run-ephemeral.log"

if [[ "$GRAPHICS" -eq 1 ]]; then
  HEADLESS_SIM=0
else
  HEADLESS_SIM=1
fi

TART_RUN_FLAGS=()
if [[ "$GRAPHICS" -eq 0 ]]; then
  TART_RUN_FLAGS+=(--no-graphics)
fi

mkdir -p "$(dirname "$HOST_LOG")" "${WORKTREE}/scripts/tart/artifacts/${ARTIFACT_RUN_DIR}"
: >"$HOST_LOG"
exec >>"$HOST_LOG" 2>&1

rnfb_tart_log "[ephemeral] clone ${WARMED_VM} → ${EPHEMERAL_VM}"
tart clone "$WARMED_VM" "$EPHEMERAL_VM"

run_pid=""

teardown_on_exit() {
  if [[ "$KEEP_VM" -eq 1 ]]; then
    rnfb_tart_log "[ephemeral] --keep-vm: leaving ${EPHEMERAL_VM} running (stop with: ./scripts/tart/stop-ephemeral.sh ${EPHEMERAL_VM} --delete)"
    return 0
  fi
  rnfb_tart_ephemeral_teardown "$EPHEMERAL_VM" "$run_pid" 1
}
trap teardown_on_exit EXIT

rnfb_tart_log "[ephemeral] starting VM (graphics=${GRAPHICS}) with worktree + tart-scripts mounts..."
if ((${#TART_RUN_FLAGS[@]})); then
  tart run "${TART_RUN_FLAGS[@]}" \
    --dir=worktree:"${WORKTREE}" \
    --dir=tart-scripts:"${RNFB_TART_ROOT}":ro \
    "$EPHEMERAL_VM" &
else
  tart run \
    --dir=worktree:"${WORKTREE}" \
    --dir=tart-scripts:"${RNFB_TART_ROOT}":ro \
    "$EPHEMERAL_VM" &
fi
run_pid=$!
sleep 5

rnfb_tart_log "[ephemeral] VM ${EPHEMERAL_VM} stays up until orchestrator teardown"

rnfb_tart_wait_ssh "$EPHEMERAL_VM" 240

sleep 2

rnfb_tart_log "[ephemeral] launching detached iteration run=${RUN_ID} iter=${ITERATION}"
rnfb_tart_log "[ephemeral] remote log: ${REMOTE_LOG}"
rnfb_tart_log "[ephemeral] tail live: sshpass -p admin ssh admin@\$(tart ip ${EPHEMERAL_VM}) tail -f ${REMOTE_LOG}"

rnfb_tart_launch_iteration_detached "$EPHEMERAL_VM" "$REMOTE_LOG" "$REMOTE_PID_FILE" \
  "${RNFB_TART_WORKTREE_MOUNT}" \
  "${BUILD_MODE}" \
  "${RUN_ID}" \
  "${ITERATION}" \
  "${HEADLESS_SIM}"

sleep 5

rnfb_tart_log "[ephemeral] launch dispatched — polling virtiofs for completion..."

set +e
iter_rc="$(rnfb_tart_wait_iteration_complete "$WORKTREE" "$ARTIFACT_RUN_DIR")"
wait_rc=$?
set -e

if [[ "$wait_rc" -ne 0 ]]; then
  iter_rc=124
fi

if [[ -f "$COMPLETE_FILE" ]]; then
  iter_rc="$(rnfb_tart_read_iteration_rc "$WORKTREE" "$ARTIFACT_RUN_DIR")"
fi

if [[ "$SYNC_ARTIFACTS" -eq 1 ]]; then
  rnfb_tart_harvest_artifact_dir "$EPHEMERAL_VM" "$WORKTREE" "$ARTIFACT_RUN_DIR"
else
  rnfb_tart_log "[ephemeral] --no-sync-artifacts: skipping SCP harvest (essentials still on virtiofs; bulk logs remain on VM)"
fi

rnfb_tart_log "[ephemeral] iteration rc=${iter_rc} artifacts=${WORKTREE}/scripts/tart/artifacts/${ARTIFACT_RUN_DIR}"
rnfb_tart_log "[ephemeral] host log: ${HOST_LOG}"
exit "$iter_rc"
