#!/usr/bin/env bash
# Resolve the iOS simulator *device name* for boot-simulator.sh (CI + Jet reboot).
# Prefer RNFB_IOS_SIMULATOR (slot env already exports `RNFB E2E iOS slot-N`;
# serial default follows scripts/e2e/create-ios-simulators.sh / E2E_DEFAULT_IOS_SIMULATOR /
# RNFB_IOS_BASE_SIMULATOR). Detoxrc fallback skips comment lines so a comment
# mentioning iPhone cannot become the device name.

resolve_ios_simulator_name() {
  local detoxrc="${1:-}"
  if [[ -n "${RNFB_IOS_SIMULATOR:-}" ]]; then
    printf '%s\n' "$RNFB_IOS_SIMULATOR"
    return 0
  fi
  if [[ -z "$detoxrc" || ! -f "$detoxrc" ]]; then
    echo "resolve_ios_simulator_name: missing detoxrc: ${detoxrc:-<empty>}" >&2
    return 1
  fi
  local name
  name="$(
    grep -E 'iPhone' "$detoxrc" \
      | grep -vE '^[[:space:]]*(//|#)' \
      | head -1 \
      | cut -d"'" -f2
  )"
  if [[ -z "$name" ]]; then
    echo "resolve_ios_simulator_name: no iPhone device name in ${detoxrc}" >&2
    return 1
  fi
  printf '%s\n' "$name"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  resolve_ios_simulator_name "${1:-}"
fi
