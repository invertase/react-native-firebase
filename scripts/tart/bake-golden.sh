#!/usr/bin/env bash
# Host: clone Cirrus seed, provision toolchain, tag rnfb-ios-e2e-golden.
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

rnfb_tart_require tart
rnfb_tart_require sshpass

EXPECTED="${RNFB_TART_ROOT}/manifests/golden-expected.json"
SEED_IMAGE="$(rnfb_tart_read_manifest_field "$EXPECTED" tart_seed_image)"
BUILD_VM="${RNFB_TART_GOLDEN_VM}-build"

MIN_FREE_GIB="${RNFB_TART_MIN_FREE_GIB:-80}"
avail_kib="$(df -k "${HOME}" | awk 'NR==2 {print $4}')"
avail_gib=$((avail_kib / 1024 / 1024))
if (( avail_gib < MIN_FREE_GIB )); then
  echo "warning: only ~${avail_gib} GiB free on ${HOME}; recommend >= ${MIN_FREE_GIB} GiB before baking" >&2
fi

echo "[bake-golden] pulling ${SEED_IMAGE} if needed..."
tart pull "$SEED_IMAGE" || true

tart stop "$BUILD_VM" 2>/dev/null || true
tart delete "$BUILD_VM" 2>/dev/null || true
tart stop "$RNFB_TART_GOLDEN_VM" 2>/dev/null || true
tart delete "$RNFB_TART_GOLDEN_VM" 2>/dev/null || true

echo "[bake-golden] cloning seed → ${BUILD_VM}"
tart clone "$SEED_IMAGE" "$BUILD_VM"

echo "[bake-golden] starting ${BUILD_VM} with tart-scripts mount..."
tart run --no-graphics --dir=tart-scripts:"${RNFB_TART_ROOT}":ro "$BUILD_VM" &
run_pid=$!
sleep 5

cleanup() {
  kill "$run_pid" 2>/dev/null || true
  tart stop "$BUILD_VM" 2>/dev/null || true
}
trap cleanup EXIT

rnfb_tart_wait_ssh "$BUILD_VM" 240

echo "[bake-golden] provisioning toolchain..."
rnfb_tart_ssh "$BUILD_VM" "bash '${RNFB_TART_SCRIPTS_MOUNT}/provision-toolchain.sh'"

rnfb_tart_ssh "$BUILD_VM" "cat ~/rnfb-tart-manifests/golden-manifest.json" \
  > "${RNFB_TART_ROOT}/manifests/golden-baked.json"

kill "$run_pid" 2>/dev/null || true
wait "$run_pid" 2>/dev/null || true
tart stop "$BUILD_VM" 2>/dev/null || true

echo "[bake-golden] tagging ${RNFB_TART_GOLDEN_VM}"
tart clone "$BUILD_VM" "$RNFB_TART_GOLDEN_VM"
tart delete "$BUILD_VM"
trap - EXIT

echo "[bake-golden] done — local VM: ${RNFB_TART_GOLDEN_VM}"
echo "[bake-golden] manifest: ${RNFB_TART_ROOT}/manifests/golden-baked.json"
