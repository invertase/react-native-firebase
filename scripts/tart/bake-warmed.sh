#!/usr/bin/env bash
# Host: clone golden VM, prewarm caches on origin/main, tag rnfb-ios-e2e-warmed.
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

rnfb_tart_require tart
rnfb_tart_require sshpass

HOST_REPO="${1:-${RNFB_HOST_REPO:-}}"
if [[ -z "$HOST_REPO" ]]; then
  echo "usage: $0 [path-to-host-git-repo]" >&2
  echo "  Uses git remote.origin.url and resolves origin/main HEAD for prewarm." >&2
  exit 1
fi
HOST_REPO="$(cd "$HOST_REPO" && pwd)"

if ! rnfb_tart_vm_exists "${RNFB_TART_GOLDEN_VM}"; then
  echo "error: golden VM ${RNFB_TART_GOLDEN_VM} not found — run bake-golden.sh first" >&2
  exit 1
fi

RNFB_REPO_URL="$(git -C "$HOST_REPO" remote get-url origin)"
RNFB_REPO_URL="$(rnfb_tart_https_repo_url "$RNFB_REPO_URL")"
RNFB_MAIN_REF="main"
RNFB_MAIN_SHA="$(git -C "$HOST_REPO" ls-remote origin refs/heads/main | awk '{print $1}')"

BUILD_VM="${RNFB_TART_WARMED_VM}-build"
tart stop "$BUILD_VM" 2>/dev/null || true
tart delete "$BUILD_VM" 2>/dev/null || true
tart stop "$RNFB_TART_WARMED_VM" 2>/dev/null || true
tart delete "$RNFB_TART_WARMED_VM" 2>/dev/null || true

echo "[bake-warmed] cloning ${RNFB_TART_GOLDEN_VM} → ${BUILD_VM}"
tart clone "$RNFB_TART_GOLDEN_VM" "$BUILD_VM"

BAKE_SESSION_ID="$(date -u +%Y%m%dT%H%M%SZ)"
BAKE_ARTIFACT_DIR="$(rnfb_tart_artifact_session_dir "$RNFB_TART_ROOT" "$BAKE_SESSION_ID")"
mkdir -p "$BAKE_ARTIFACT_DIR"

echo "[bake-warmed] prewarm origin/main @ ${RNFB_MAIN_SHA:0:12}"
tart run --no-graphics --dir=tart-scripts:"${RNFB_TART_ROOT}":ro "$BUILD_VM" &
run_pid=$!
sleep 5

cleanup() {
  kill "$run_pid" 2>/dev/null || true
  tart stop "$BUILD_VM" 2>/dev/null || true
}
trap cleanup EXIT

rnfb_tart_wait_ssh "$BUILD_VM" 240

set +e
rnfb_tart_ssh "$BUILD_VM" \
  "RNFB_REPO_URL='${RNFB_REPO_URL}' RNFB_MAIN_REF='${RNFB_MAIN_REF}' \
   bash '${RNFB_TART_SCRIPTS_MOUNT}/prewarm-caches.sh'" \
  > "${BAKE_ARTIFACT_DIR}/prewarm.log" 2>&1 &
prewarm_pid=$!

while kill -0 "$prewarm_pid" 2>/dev/null; do
  if rnfb_tart_ssh "$BUILD_VM" "test -f ~/rnfb-tart-manifests/prewarm-complete.json" 2>/dev/null; then
    rnfb_tart_log "[bake-warmed] prewarm completion marker detected"
    sleep 3
    kill "$prewarm_pid" 2>/dev/null || true
    wait "$prewarm_pid" 2>/dev/null || true
    break
  fi
  sleep 15
done

if kill -0 "$prewarm_pid" 2>/dev/null; then
  wait "$prewarm_pid"
fi
set -e

rnfb_tart_ssh "$BUILD_VM" "cat ~/rnfb-tart-manifests/warmed-main.json" \
  > "${RNFB_TART_ROOT}/manifests/warmed-main.json"

kill "$run_pid" 2>/dev/null || true
wait "$run_pid" 2>/dev/null || true
tart stop "$BUILD_VM" 2>/dev/null || true

echo "[bake-warmed] tagging ${RNFB_TART_WARMED_VM}"
tart clone "$BUILD_VM" "$RNFB_TART_WARMED_VM"
tart delete "$BUILD_VM"
trap - EXIT

echo "[bake-warmed] done — local VM: ${RNFB_TART_WARMED_VM}"
echo "[bake-warmed] warmed-main.json commit: $(python3 -c "import json; print(json.load(open('${RNFB_TART_ROOT}/manifests/warmed-main.json'))['main_commit'][:12])")"
