#!/usr/bin/env bash
# Selected-Xcode Device Hub + iOS 27 runtime pins for e2e simctl automation.
# simctl remains the backend; foreground UI uses DeviceHub.app under the active Xcode.
set -euo pipefail

# Human-readable runtime label (simctl list devices section header), not the identifier.
RNFB_IOS_SIM_RUNTIME_LABEL="${RNFB_IOS_SIM_RUNTIME:-iOS 27.0}"

rnfb_ios_sim_runtime_label() {
  printf '%s\n' "$RNFB_IOS_SIM_RUNTIME_LABEL"
}

rnfb_selected_xcode_developer_dir() {
  xcode-select -p 2>/dev/null
}

# DeviceHub.app ships beside Xcode.app (not under Developer/Applications).
rnfb_resolve_device_hub_app() {
  local dev hub
  dev="$(rnfb_selected_xcode_developer_dir)" || return 1
  hub="${dev%/Developer}/Applications/DeviceHub.app"
  if [[ -d "$hub" ]]; then
    printf '%s\n' "$hub"
    return 0
  fi
  return 1
}

# Pre–Xcode 27 hosts that still ship Simulator.app next to Developer.
rnfb_resolve_legacy_simulator_app() {
  local dev legacy
  dev="$(rnfb_selected_xcode_developer_dir)" || return 1
  legacy="${dev}/Applications/Simulator.app"
  if [[ -d "$legacy" ]]; then
    printf '%s\n' "$legacy"
    return 0
  fi
  return 1
}

rnfb_resolve_foreground_simulator_ui_app() {
  local app
  if app="$(rnfb_resolve_device_hub_app)"; then
    printf '%s\n' "$app"
    return 0
  fi
  if app="$(rnfb_resolve_legacy_simulator_app)"; then
    printf '%s\n' "$app"
    return 0
  fi
  return 1
}

rnfb_resolve_ios_sim_runtime_identifier() {
  local label
  label="$(rnfb_ios_sim_runtime_label)"
  xcrun simctl list runtimes available -j | node -e "
    const label = process.argv[1];
    const j = JSON.parse(require('fs').readFileSync(0, 'utf8'));
    const ios = (j.runtimes || []).filter(
      r => r.isAvailable && r.platform === 'iOS' && r.name === label,
    );
    if (!ios.length) {
      const avail = (j.runtimes || [])
        .filter(r => r.isAvailable && r.platform === 'iOS')
        .map(r => r.name)
        .join(', ');
      console.error('error: no available iOS runtime named \"' + label + '\" (have: ' + avail + ')');
      process.exit(1);
    }
    process.stdout.write(ios[0].identifier);
  " "$label"
}

# Resolve UDID for device name on the pinned runtime (available, not necessarily booted).
rnfb_resolve_ios_sim_udid_for_name() {
  local name="$1"
  local label udid line
  label="$(rnfb_ios_sim_runtime_label)"
  line="$(
    xcrun simctl list devices available 2>/dev/null \
      | awk -v device="$name" -v runtime="$label" '
          $0 ~ "-- " runtime " --" { in_runtime = 1; next }
          in_runtime && /^-- / { in_runtime = 0 }
          in_runtime && index($0, device " (") { print; exit }
        '
  )"
  if [[ -z "$line" ]]; then
    return 1
  fi
  udid="$(sed -E 's/.*\(([A-F0-9-]+)\).*/\1/' <<<"$line")"
  [[ -n "$udid" ]] || return 1
  printf '%s\n' "$udid"
}

rnfb_ensure_ios_simulator_udid() {
  local name="$1"
  local base_type="${RNFB_IOS_BASE_SIMULATOR:-iPhone 17}"
  local runtime udid

  if udid="$(rnfb_resolve_ios_sim_udid_for_name "$name")"; then
    printf '%s\n' "$udid"
    return 0
  fi

  runtime="$(rnfb_resolve_ios_sim_runtime_identifier)"
  echo "[ios-sim] creating \"${name}\" (${base_type}, runtime=${runtime})" >&2
  udid="$(xcrun simctl create "$name" "$base_type" "$runtime")"
  printf '%s\n' "$udid"
}

rnfb_open_device_hub_for_udid() {
  local udid="$1"
  local app
  if ! app="$(rnfb_resolve_foreground_simulator_ui_app)"; then
    echo "[ios-sim] WARN: no DeviceHub.app or Simulator.app under selected Xcode — continuing simctl-only" >&2
    return 0
  fi
  open "$app" --args -CurrentDeviceUDID "$udid"
}

rnfb_kill_foreground_simulator_ui() {
  killall DeviceHub 2>/dev/null || true
  killall Simulator 2>/dev/null || true
}
