#!/usr/bin/env bash
# Host-clear gate before mellifera (or any slotted) work.
# Thin wrapper around mellifera-agnostic check-e2e-resources.sh.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FAIL=0

echo "[host-preflight] $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [[ ! -d "${REPO_ROOT}/mellifera/dist" ]]; then
  echo "[host-preflight] FAIL mellifera not built — run: cd mellifera && yarn build" >&2
  FAIL=1
else
  echo "[host-preflight] OK  mellifera dist present"
fi

if ! bash "${REPO_ROOT}/scripts/e2e/check-e2e-resources.sh"; then
  echo "[host-preflight] FAIL e2e resources busy — run: bash scripts/e2e/release-e2e-resources.sh [--devices]" >&2
  FAIL=1
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "[host-preflight] FAILED" >&2
  exit 1
fi

echo "[host-preflight] all checks passed"
exit 0
