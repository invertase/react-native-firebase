#!/usr/bin/env bash
# Print slotted e2e env exports for eval into the current shell.
#
# Usage:
#   eval "$(bash scripts/e2e/export-slot-env.sh <android|ios|macos> <slot>)"
#   yarn tests:macos:build
#   bash scripts/e2e/start-emulator-slotted.sh macos
#   yarn tests:macos:packager:jet-reset-cache   # or: bash scripts/e2e/run-slotted-packager.sh macos <slot>
#   yarn tests:macos:test-cover          # or: bash scripts/e2e/run-slotted-test-cover.sh macos <slot>
#
# For macOS, sets RNFB_MACOS_PRODUCT_NAME=io.invertase.testing.s<slot> (and matching
# bundle id) so concurrent macOS apps do not share one process name.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/e2e-slot-env.sh
source "${SCRIPT_DIR}/lib/e2e-slot-env.sh"

PLATFORM="${1:?platform required: android|ios|macos}"
SLOT="${2:?slot required: non-negative integer}"

e2e_slot_env_print "$PLATFORM" "$SLOT"
