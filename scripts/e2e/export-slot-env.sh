#!/usr/bin/env bash
# Print slotted e2e env exports for eval into the current shell.
# Full lifecycle: running-e2e.md § slot-lifecycle
#
# Usage:
#   eval "$(bash scripts/e2e/export-slot-env.sh <android|ios|macos> <slot>)"
#   bash scripts/e2e/check-e2e-resources.sh   # / release-e2e-resources.sh — slot-scoped
#   bash scripts/e2e/start-emulator-slotted.sh <platform>   # or … <platform> <slot>
#   bash scripts/e2e/run-slotted-packager.sh <platform> <slot>   # background OK
#   yarn tests:<platform>:build
#   bash scripts/e2e/run-slotted-test-cover.sh <platform> <slot>
#   bash scripts/e2e/release-e2e-resources.sh
#
# Always sets full RNFB_{ANDROID,IOS,MACOS}_* ports plus slot device identities
# (TestingAVD-N / RNFB E2E iOS slot-N / RNFB_MACOS_PRODUCT_NAME=io.invertase.testing.s<slot>).
# Also emits unset for parent leftovers (ANDROID_SERIAL, AVD_NAME, …) that apply clears.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/e2e-slot-env.sh
source "${SCRIPT_DIR}/lib/e2e-slot-env.sh"

PLATFORM="${1:?platform required: android|ios|macos}"
SLOT="${2:?slot required: non-negative integer}"

e2e_slot_env_print "$PLATFORM" "$SLOT"
