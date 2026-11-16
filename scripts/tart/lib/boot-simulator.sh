#!/usr/bin/env bash
# Tart VM: delegate to canonical CI boot-simulator (Device Hub + UDID pins).
set -euo pipefail

REPO_ROOT="${RNFB_REPO_ROOT:?RNFB_REPO_ROOT must point at the mounted worktree}"
export RNFB_REPO_ROOT

if [[ "${RNFB_HEADLESS_SIMULATOR:-1}" == "1" ]]; then
  export RNFB_SIM_UI_HEADLESS=1
fi
# Ephemeral single-tenant VM: restarting the simulator UI touches no other owner.
export RNFB_SIM_UI_RESET="${RNFB_SIM_UI_RESET:-1}"

exec "${REPO_ROOT}/.github/workflows/scripts/boot-simulator.sh"
