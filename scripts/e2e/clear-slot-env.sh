#!/usr/bin/env bash
# Print unset lines for leftover slotted e2e env. Eval before a serial (non-slot)
# Law run when the parent shell may still hold `export-slot-env` carry-in:
#   eval "$(yarn tests:e2e:clear-slot-env)"
# Canonical yarn tests:* also call e2e_sanitize_serial_env when slot is unset,
# but leftover RNFB_E2E_SLOT would skip that — this command always unsets.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/e2e-slot-env.sh
source "${SCRIPT_DIR}/lib/e2e-slot-env.sh"

e2e_slot_env_clear_print
