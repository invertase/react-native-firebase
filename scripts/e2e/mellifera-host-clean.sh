#!/usr/bin/env bash
# Aggressive host clean for this worktree's e2e/mellifera leftovers.
# Uses generic release-e2e-resources.sh, then best-effort worktree-scoped process sweeps.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "[host-clean] $(date -u +%Y-%m-%dT%H:%M:%SZ) purging e2e host..."

bash "${REPO_ROOT}/scripts/e2e/mellifera-teardown.sh" 2>/dev/null || true

# Worktree-scoped leftovers that may not hold the resolved listen ports anymore.
pkill -f "${REPO_ROOT}.*firebase.*emulators:start" 2>/dev/null || true
pkill -f "${REPO_ROOT}.*functionsEmulatorRuntime" 2>/dev/null || true
pkill -f "${REPO_ROOT}.*detox" 2>/dev/null || true
pkill -f "${REPO_ROOT}.*jest.*e2e/jest.config.js" 2>/dev/null || true
pkill -f "${REPO_ROOT}.*react-native start" 2>/dev/null || true
pkill -f 'mellifera-run-iterations' 2>/dev/null || true

rm -f /tmp/rnfb-mellifera-iterations.pid 2>/dev/null || true

echo "[host-clean] adb devices:"
adb devices 2>/dev/null || true
bash "${REPO_ROOT}/scripts/e2e/check-e2e-resources.sh" || true
echo "[host-clean] done"
