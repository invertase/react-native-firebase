#!/usr/bin/env bash
# Thin wrapper: apply optional platform/slot env, then canonical yarn emulator start.
# Prefer: eval "$(yarn tests:e2e:export-slot-env <platform> N)" && yarn tests:emulator:start
#
# Usage:
#   bash scripts/e2e/start-emulator-slotted.sh <android|ios|macos> [slot]
set -euo pipefail

PLATFORM="${1:?platform required: android|ios|macos}"
SLOT_ARG="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=lib/e2e-slot-env.sh
source "${SCRIPT_DIR}/lib/e2e-slot-env.sh"

if [[ -n "$SLOT_ARG" ]]; then
  e2e_slot_env_apply "$PLATFORM" "$SLOT_ARG"
fi

exec "${REPO_ROOT}/.github/workflows/scripts/start-firebase-emulator.sh" "$PLATFORM"
