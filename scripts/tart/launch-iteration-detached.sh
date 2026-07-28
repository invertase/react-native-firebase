#!/usr/bin/env bash
# In-VM: one-shot SSH target — start run-iteration.sh detached, print pid, exit.
set -euo pipefail

REMOTE_DIR="$1"
RNFB_REPO_ROOT="$2"
RNFB_BUILD_MODE="$3"
RNFB_RUN_ID="$4"
RNFB_ITERATION="$5"
RNFB_HEADLESS_SIMULATOR="$6"

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

mkdir -p "$REMOTE_DIR"
export RNFB_REPO_ROOT RNFB_BUILD_MODE RNFB_RUN_ID RNFB_ITERATION RNFB_HEADLESS_SIMULATOR

nohup bash "${RNFB_TART_SCRIPTS_MOUNT}/run-iteration.sh" </dev/null >/dev/null 2>&1 &
disown -h 2>/dev/null || disown
echo $! > "${REMOTE_DIR}/iteration.pid"
