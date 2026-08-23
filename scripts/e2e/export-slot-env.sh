#!/usr/bin/env bash
# Print slotted e2e env exports for eval into the current shell.
# Full lifecycle: running-e2e.md § slot-lifecycle (The Law — same yarn runbook as serial)
#
# Usage:
#   eval "$(yarn tests:e2e:export-slot-env <android|ios|macos> <slot>)"
#   yarn tests:e2e:check
#   yarn tests:packager:jet            # or yarn tests:macos:packager:jet
#   yarn tests:emulator:start
#   yarn tests:<platform>:pod:install  # ios|macos
#   yarn tests:<platform>:build
#   yarn tests:<platform>:test-cover
#   yarn tests:e2e:release [--devices]
#
# Always sets full RNFB_{ANDROID,IOS,MACOS}_* ports plus slot device identities
# (TestingAVD-N / RNFB E2E iOS slot-N / RNFB_MACOS_PRODUCT_NAME=io.invertase.testing.s<slot>).
# Pins RNFB_ANDROID_CONSOLE_PORT=$((5556+2*slot)) and ANDROID_SERIAL=emulator-${port}
# (adb-safe; not FreePortFinder 10000–20000). Emits unset for other parent leftovers
# (AVD_NAME, …) that apply clears.
# Does not export or unset GRADLE_USER_HOME — leave the host default (~/.gradle
# when unset). Concurrent independent worktrees share that home by design.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/e2e-slot-env.sh
source "${SCRIPT_DIR}/lib/e2e-slot-env.sh"

PLATFORM="${1:?platform required: android|ios|macos}"
SLOT="${2:?slot required: non-negative integer}"

e2e_slot_env_print "$PLATFORM" "$SLOT"
