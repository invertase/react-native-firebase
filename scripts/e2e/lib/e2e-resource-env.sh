#!/usr/bin/env bash
# Shared e2e resource resolution for check/release scripts.
# Precedence (per value): platform-prefixed RNFB_* → process/global env → serial defaults.
# tests/mellifera.env.json is only consulted when mellifera is explicitly enabled — see
# e2e_mellifera_enabled() below (finding #5: a stale/leftover JSON must never silently
# switch a plain serial check into multi-platform mode).
#
# Platform scoping (finding #3): callers may set E2E_PLATFORM_OVERRIDE (populated from a
# --platform=android|ios|macos CLI flag) to pin e2e_active_platforms() to exactly one
# platform. Without an override, an ambiguous "global" fallback is used — see
# e2e_active_platforms() and the caller-side platform_explicit() checks in
# check-e2e-resources.sh for why "global" must not be treated as "all platforms active"
# for aggressive per-platform probes (e.g. "any booted iOS simulator").
#
# shellcheck shell=bash

_E2E_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=e2e-slot-env.sh
source "${_E2E_LIB_DIR}/e2e-slot-env.sh"

# Serial defaults (legacy single-run behaviour).
E2E_DEFAULT_METRO_PORT=8081
E2E_DEFAULT_JET_PORT=8090
E2E_DEFAULT_JET_CONTROL_PORT=8091
E2E_DEFAULT_FIRESTORE_PORT=8080
E2E_DEFAULT_AUTH_PORT=9099
E2E_DEFAULT_DATABASE_PORT=9000
E2E_DEFAULT_FUNCTIONS_PORT=5001
E2E_DEFAULT_STORAGE_PORT=9199
E2E_DEFAULT_HUB_PORT=4400
E2E_DEFAULT_LOGGING_PORT=4500
E2E_DEFAULT_ANDROID_SERIAL=emulator-5554
E2E_DEFAULT_ANDROID_AVD=TestingAVD
E2E_DEFAULT_IOS_SIMULATOR='iPhone 17'
E2E_ANDROID_APP_ID=com.invertase.testing
E2E_ANDROID_TEST_APP_ID=com.invertase.testing.test
# Default macOS process / PRODUCT_NAME. Override with RNFB_MACOS_PRODUCT_NAME for
# concurrent slotted macOS (e.g. io.invertase.testing.s1) — see running-e2e.md.
E2E_DEFAULT_MACOS_APP_PROCESS=io.invertase.testing
E2E_MACOS_APP_PROCESS="${RNFB_MACOS_PRODUCT_NAME:-$E2E_DEFAULT_MACOS_APP_PROCESS}"
# When RNFB_MACOS_PRODUCT_NAME is unset (serial / unscoped host wipe), also probe/kill
# known slotted siblings so parallel leftovers fail host-clear and get released.
# Same slot ceiling as leftover Android/iOS devices and unscoped port collect.
E2E_MACOS_SLOTTED_MAX="${E2E_MACOS_SLOTTED_MAX:-$E2E_SLOTTED_MAX}"

e2e_repo_root() {
  local here
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
  echo "$here"
}

e2e_mellifera_env_json() {
  echo "$(e2e_repo_root)/tests/mellifera.env.json"
}

# Finding #5: only trust tests/mellifera.env.json when the caller opted in — either via
# RNFB_MELLIFERA=1 or an explicit --mellifera flag (callers set E2E_MELLIFERA_FLAG=1).
# A stale JSON left over from a previous mellifera session must not silently switch a
# plain serial check/release into multi-platform mode.
e2e_mellifera_enabled() {
  [[ "${RNFB_MELLIFERA:-0}" == "1" || "${E2E_MELLIFERA_FLAG:-0}" == "1" ]]
}

# Print (once per process, to stderr) a warning when the JSON file exists but mellifera
# was not enabled for this invocation — visibility without changing behaviour.
e2e_warn_stale_mellifera_json() {
  local json
  json=$(e2e_mellifera_env_json)
  if [[ -f "$json" ]] && ! e2e_mellifera_enabled; then
    echo "[e2e-resource-env] NOTE: ${json} exists but RNFB_MELLIFERA=1/--mellifera not set — ignoring it (serial defaults / RNFB_E2E_PLATFORM / --platform apply instead)" >&2
  fi
}

# --platform= never selects a slot; it only narrows which platform's devices/ports
# are probed among whatever env is already loaded. Warn when the flag is set without
# slotted carry-in (no RNFB_E2E_SLOT and no RNFB_*_JET_PORT).
e2e_warn_platform_without_slot() {
  if [[ -z "${E2E_PLATFORM_OVERRIDE:-}" ]]; then
    return 0
  fi
  if [[ -n "${RNFB_E2E_SLOT:-${RNFB_E2E_HOST_SLOT:-}}" ]]; then
    return 0
  fi
  if [[ -n "${RNFB_ANDROID_JET_PORT:-}${RNFB_IOS_JET_PORT:-}${RNFB_MACOS_JET_PORT:-}" ]]; then
    return 0
  fi
  echo "[e2e-resource-env] WARN: --platform=${E2E_PLATFORM_OVERRIDE} does not select a slot; load slotted env first via export-slot-env.sh (no RNFB_E2E_SLOT / RNFB_*_JET_PORT — using serial defaults for ports/devices)" >&2
}

# First non-empty among args.
e2e_first_set() {
  local v
  for v in "$@"; do
    if [[ -n "${v}" ]]; then
      echo "$v"
      return 0
    fi
  done
  echo ""
  return 0
}

e2e_env_get() {
  local key=$1
  # bash indirect expansion
  echo "${!key-}"
}

# Resolve metro for a platform (android|ios|macos) or "global".
e2e_resolve_metro() {
  local platform=${1:-global}
  local prefix
  if [[ "$platform" != "global" ]]; then
    prefix=$(echo "$platform" | tr '[:lower:]' '[:upper:]')
    e2e_first_set \
      "$(e2e_env_get "RNFB_${prefix}_METRO_PORT")" \
      "${RCT_METRO_PORT:-}" \
      "${RNFB_METRO_PORT:-}" \
      "${JET_METRO_PORT:-}" \
      "$E2E_DEFAULT_METRO_PORT"
  else
    e2e_first_set \
      "${RCT_METRO_PORT:-}" \
      "${RNFB_METRO_PORT:-}" \
      "${JET_METRO_PORT:-}" \
      "$E2E_DEFAULT_METRO_PORT"
  fi
}

e2e_resolve_jet() {
  local platform=${1:-global}
  local prefix
  if [[ "$platform" != "global" ]]; then
    prefix=$(echo "$platform" | tr '[:lower:]' '[:upper:]')
    e2e_first_set \
      "$(e2e_env_get "RNFB_${prefix}_JET_PORT")" \
      "${JET_REMOTE_PORT:-}" \
      "$E2E_DEFAULT_JET_PORT"
  else
    e2e_first_set "${JET_REMOTE_PORT:-}" "$E2E_DEFAULT_JET_PORT"
  fi
}

e2e_resolve_jet_control() {
  local platform=${1:-global}
  local prefix jet
  jet=$(e2e_resolve_jet "$platform")
  if [[ "$platform" != "global" ]]; then
    prefix=$(echo "$platform" | tr '[:lower:]' '[:upper:]')
    e2e_first_set \
      "$(e2e_env_get "RNFB_${prefix}_JET_CONTROL_PORT")" \
      "${RNFB_JET_CONTROL_PORT:-}" \
      "$((jet + 1))"
  else
    e2e_first_set "${RNFB_JET_CONTROL_PORT:-}" "$((jet + 1))"
  fi
}

e2e_resolve_emulator_port() {
  local platform=$1 service=$2 # firestore|auth|database|functions|storage|hub|logging
  local prefix svc_up default_var
  prefix=$(echo "$platform" | tr '[:lower:]' '[:upper:]')
  svc_up=$(echo "$service" | tr '[:lower:]' '[:upper:]')
  case "$service" in
    firestore) default_var=$E2E_DEFAULT_FIRESTORE_PORT ;;
    auth) default_var=$E2E_DEFAULT_AUTH_PORT ;;
    database) default_var=$E2E_DEFAULT_DATABASE_PORT ;;
    functions) default_var=$E2E_DEFAULT_FUNCTIONS_PORT ;;
    storage) default_var=$E2E_DEFAULT_STORAGE_PORT ;;
    hub) default_var=$E2E_DEFAULT_HUB_PORT ;;
    logging) default_var=$E2E_DEFAULT_LOGGING_PORT ;;
    *) default_var="" ;;
  esac
  e2e_first_set \
    "$(e2e_env_get "RNFB_${prefix}_EMULATOR_${svc_up}_PORT")" \
    "$default_var"
}

e2e_resolve_android_avd() {
  e2e_first_set "${RNFB_ANDROID_AVD:-}" "${RNFB_ANDROID_AVD_NAME:-}" "$E2E_DEFAULT_ANDROID_AVD"
}

e2e_resolve_android_serial() {
  local json avd
  json=$(e2e_mellifera_env_json)
  local from_json=""
  if [[ -f "$json" ]] && e2e_mellifera_enabled; then
    from_json=$(node -e "try{const j=require('$json');console.log((j.android&&j.android.device&&j.android.device.androidSerial)||'')}catch(e){}" 2>/dev/null || true)
  fi
  # Explicit serial (env or mellifera) always wins. Slotted export-slot-env
  # pins ANDROID_SERIAL=emulator-$((5556+2*slot)) (console 5556, 5558, 5560, …)
  # so check/release target the same adb name Detox launches with. Do not
  # invent emulator-5554 for TestingAVD-N (that serial is unslotted TestingAVD).
  # Detox must honor RNFB_ANDROID_CONSOLE_PORT — not FreePortFinder 10000–20000.
  if [[ -n "$from_json" || -n "${ANDROID_SERIAL:-}" ]]; then
    e2e_first_set "$from_json" "${ANDROID_SERIAL:-}"
    return 0
  fi
  avd=$(e2e_resolve_android_avd)
  if [[ "$avd" == "$E2E_DEFAULT_ANDROID_AVD" ]]; then
    echo "$E2E_DEFAULT_ANDROID_SERIAL"
  else
    echo ""
  fi
}

e2e_resolve_ios_simulator() {
  e2e_first_set "${RNFB_IOS_SIMULATOR:-}" "$E2E_DEFAULT_IOS_SIMULATOR"
}

# Platforms to consider, in precedence order:
#   1. E2E_PLATFORM_OVERRIDE (--platform=android|ios|macos CLI flag — highest precedence)
#   2. tests/mellifera.env.json (only when e2e_mellifera_enabled — finding #5)
#   3. RNFB_E2E_PLATFORM
#   4. any platform-prefixed metro/jet port env set
#   5. "global" — ambiguous fallback, NOT "all platforms active" (finding #3; see
#      platform_explicit() in check-e2e-resources.sh for how callers must treat this
#      differently from an explicit platform list for aggressive/false-positive-prone
#      probes such as "any booted iOS simulator").
e2e_active_platforms() {
  local platforms=()
  if [[ -n "${E2E_PLATFORM_OVERRIDE:-}" ]]; then
    printf '%s\n' "$E2E_PLATFORM_OVERRIDE"
    return 0
  fi
  local json
  json=$(e2e_mellifera_env_json)
  if [[ -f "$json" ]] && e2e_mellifera_enabled; then
    local p
    for p in android ios macos; do
      if node -e "const j=require('$json'); if(!j.$p||!j.$p.metro) process.exit(1)" 2>/dev/null; then
        platforms+=("$p")
      fi
    done
  fi
  if [[ ${#platforms[@]} -eq 0 && -n "${RNFB_E2E_PLATFORM:-}" ]]; then
    platforms+=("$RNFB_E2E_PLATFORM")
  fi
  if [[ ${#platforms[@]} -eq 0 ]]; then
    local p prefix
    for p in android ios macos; do
      prefix=$(echo "$p" | tr '[:lower:]' '[:upper:]')
      if [[ -n "$(e2e_env_get "RNFB_${prefix}_METRO_PORT")" || -n "$(e2e_env_get "RNFB_${prefix}_JET_PORT")" ]]; then
        platforms+=("$p")
      fi
    done
  fi
  if [[ ${#platforms[@]} -eq 0 ]]; then
    platforms+=(global)
  fi
  printf '%s\n' "${platforms[@]}"
}

# Unscoped serial/global: no slot env, no mellifera, no --platform, no prefixed ports.
e2e_is_unscoped_global() {
  [[ -z "${RNFB_E2E_SLOT:-${RNFB_E2E_HOST_SLOT:-}}" ]] || return 1
  [[ "$(e2e_active_platforms)" == "global" ]]
}

# POSIX ERE for pgrep/pkill — same complete @AVD identity as tests/e2e/androidAdbRange.js
# qemuAvdPgrepPattern. `TestingAVD` must not match qemu for `@TestingAVD-0`.
e2e_qemu_avd_pgrep_pattern() {
  local avd=$1
  local escaped
  escaped=$(printf '%s' "$avd" | sed 's/[.[\*^$()+?{|]/\\&/g')
  printf 'qemu-system.*@%s([[:space:]]|$)' "$escaped"
}

e2e_pkill_qemu_for_avd() {
  local avd=$1
  [[ -n "$avd" ]] || return 0
  pkill -f "$(e2e_qemu_avd_pgrep_pattern "$avd")" 2>/dev/null || true
}

# Unscoped device wipe: no explicit AVD / sim / slot (mirrors macOS .sN siblings).
e2e_android_avd_names_for_release() {
  if [[ -n "${RNFB_ANDROID_AVD:-}${RNFB_ANDROID_AVD_NAME:-}" ]]; then
    e2e_resolve_android_avd
    return 0
  fi
  local slot="${RNFB_E2E_SLOT:-${RNFB_E2E_HOST_SLOT:-}}"
  if [[ -n "$slot" ]]; then
    echo "TestingAVD-${slot}"
    return 0
  fi
  echo "$E2E_DEFAULT_ANDROID_AVD"
  local i
  for ((i = 0; i <= E2E_SLOTTED_MAX; i++)); do
    echo "TestingAVD-${i}"
  done
}

e2e_ios_simulator_names_for_release() {
  if [[ -n "${RNFB_IOS_SIMULATOR:-}" ]]; then
    echo "$RNFB_IOS_SIMULATOR"
    return 0
  fi
  local slot="${RNFB_E2E_SLOT:-${RNFB_E2E_HOST_SLOT:-}}"
  if [[ -n "$slot" ]]; then
    echo "RNFB E2E iOS slot-${slot}"
    return 0
  fi
  echo "$E2E_DEFAULT_IOS_SIMULATOR"
  local i
  for ((i = 0; i <= E2E_SLOTTED_MAX; i++)); do
    echo "RNFB E2E iOS slot-${i}"
  done
}

# Fail-fast for start-emulator-slotted: any suite listener already bound.
# Args: firestore auth database functions storage hub logging (aux = FS+8/+9/+12).
# Returns 1 and prints ports/pids when any are listening. Override e2e_port_listening
# in tests to mock.
e2e_abort_if_emulator_suite_ports_busy() {
  local fs=$1 auth=$2 db=$3 fn=$4 st=$5 hub=$6 log=$7
  local busy=0
  local name port pids spec
  for spec in \
    "firestore:${fs}" \
    "auth:${auth}" \
    "database:${db}" \
    "functions:${fn}" \
    "storage:${st}" \
    "hub:${hub}" \
    "logging:${log}" \
    "websocket:$((fs + 8))" \
    "eventarc:$((fs + 9))" \
    "tasks:$((fs + 12))"; do
    name="${spec%%:*}"
    port="${spec#*:}"
    if e2e_port_listening "$port"; then
      pids=$(e2e_listener_pids "$port" | tr '\n' ' ')
      echo "error: emulator suite port busy: ${name} :${port} pids=${pids}" >&2
      busy=1
    fi
  done
  if [[ "$busy" -ne 0 ]]; then
    echo "error: cannot start emulator suite — suite ports must be free (unscoped release-e2e-resources.sh or slot-scoped release). Abort; zero flake budget." >&2
    return 1
  fi
  return 0
}

e2e_print_collected_ports() {
  local i=0 port
  for port in "${E2E_PORTS[@]+"${E2E_PORTS[@]}"}"; do
    printf '%s %s\n' "$port" "${E2E_PORT_LABELS[$i]}"
    i=$((i + 1))
  done
}

# Populate arrays: E2E_PORTS (unique), E2E_PORT_LABELS (parallel labels), plus device fields.
# shellcheck disable=SC2034
e2e_collect_targets() {
  e2e_warn_stale_mellifera_json
  e2e_warn_platform_without_slot
  E2E_PORTS=()
  E2E_PORT_LABELS=()
  # Plain-string dedup (not an associative array) — bash 3.2 (macOS default /bin/bash) has no `local -A`.
  local seen=" "
  local platform metro jet jc svc port label fs slot plat lab p
  local unscoped_global=0
  if e2e_is_unscoped_global; then
    unscoped_global=1
  fi

  add_port() {
    local port_num=$1 port_lab=$2
    [[ -z "$port_num" ]] && return 0
    case "$seen" in
      *" ${port_num} "*)
        return 0
        ;;
    esac
    seen="${seen}${port_num} "
    E2E_PORTS+=("$port_num")
    E2E_PORT_LABELS+=("$port_lab")
  }

  while IFS= read -r platform; do
    [[ -z "$platform" ]] && continue
    metro=$(e2e_resolve_metro "$platform")
    jet=$(e2e_resolve_jet "$platform")
    jc=$(e2e_resolve_jet_control "$platform")
    add_port "$metro" "metro:${platform}"
    add_port "$jet" "jet:${platform}"
    add_port "$jc" "jet-control:${platform}"
    if [[ "$platform" != "global" ]]; then
      for svc in firestore auth database functions storage hub logging; do
        port=$(e2e_resolve_emulator_port "$platform" "$svc")
        add_port "$port" "emulator-${svc}:${platform}"
      done
      # Aux listeners Firebase Tools still binds (same offsets as start-emulator-slotted.sh).
      fs=$(e2e_resolve_emulator_port "$platform" firestore)
      if [[ -n "$fs" ]]; then
        add_port "$((fs + 8))" "emulator-firestore-websocket:${platform}"
        add_port "$((fs + 9))" "emulator-eventarc:${platform}"
        add_port "$((fs + 12))" "emulator-tasks:${platform}"
      fi
    else
      # Serial defaults: one emulator suite (not per-platform prefixed).
      add_port "$E2E_DEFAULT_FIRESTORE_PORT" "emulator-firestore:global"
      add_port "$E2E_DEFAULT_AUTH_PORT" "emulator-auth:global"
      add_port "$E2E_DEFAULT_DATABASE_PORT" "emulator-database:global"
      add_port "$E2E_DEFAULT_FUNCTIONS_PORT" "emulator-functions:global"
      add_port "$E2E_DEFAULT_STORAGE_PORT" "emulator-storage:global"
      add_port "$E2E_DEFAULT_HUB_PORT" "emulator-hub:global"
      add_port "$E2E_DEFAULT_LOGGING_PORT" "emulator-logging:global"
      # Firebase Tools serial defaults when config omits aux ports.
      add_port "9150" "emulator-firestore-websocket:global"
      add_port "9299" "emulator-eventarc:global"
      add_port "9499" "emulator-tasks:global"
    fi
  done < <(e2e_active_platforms)

  # After the active-platform loop — do not nest this while-read inside that
  # process substitution (bash 3.2 inner `read` steals the outer stdin).
  if [[ "$unscoped_global" -eq 1 ]]; then
    while read -r lab p; do
      [[ -z "$lab" ]] && continue
      add_port "$p" "$lab"
    done < <(
      for ((slot = 0; slot <= E2E_SLOTTED_MAX; slot++)); do
        for plat in android ios macos; do
          e2e_slot_block_port_lines "$plat" "$slot"
        done
      done
    )
  fi

  E2E_ANDROID_SERIAL=$(e2e_resolve_android_serial)
  E2E_ANDROID_AVD=$(e2e_resolve_android_avd)
  E2E_IOS_SIMULATOR=$(e2e_resolve_ios_simulator)
  # Re-resolve after env/mellifera load so RNFB_MACOS_PRODUCT_NAME wins.
  E2E_MACOS_APP_PROCESS="${RNFB_MACOS_PRODUCT_NAME:-$E2E_DEFAULT_MACOS_APP_PROCESS}"
}

e2e_port_listening() {
  local port=$1
  lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
}

e2e_listener_pids() {
  local port=$1
  lsof -nP -iTCP:"${port}" -sTCP:LISTEN -t 2>/dev/null || true
}

e2e_android_app_running() {
  local serial=$1 pkg=$2
  adb -s "$serial" shell pidof "$pkg" >/dev/null 2>&1
}

# Process names in scope for host-clear / release.
# - RNFB_MACOS_PRODUCT_NAME set → only that name (slot-scoped).
# - RNFB_E2E_SLOT / RNFB_E2E_HOST_SLOT set without product name → only .s${slot}.
# - Neither set (serial / unscoped host wipe) → default + .s0..sN siblings.
e2e_macos_process_names_for_probe() {
  if [[ -n "${RNFB_MACOS_PRODUCT_NAME:-}" ]]; then
    echo "$RNFB_MACOS_PRODUCT_NAME"
    return 0
  fi
  local slot="${RNFB_E2E_SLOT:-${RNFB_E2E_HOST_SLOT:-}}"
  if [[ -n "$slot" ]]; then
    echo "${E2E_DEFAULT_MACOS_APP_PROCESS}.s${slot}"
    return 0
  fi
  echo "$E2E_DEFAULT_MACOS_APP_PROCESS"
  local i
  for ((i = 0; i <= E2E_SLOTTED_MAX; i++)); do
    echo "${E2E_DEFAULT_MACOS_APP_PROCESS}.s${i}"
  done
}

# Echo the first matching busy process name, or empty if none.
e2e_macos_busy_process() {
  local name
  while IFS= read -r name; do
    [[ -z "$name" ]] && continue
    if pgrep -x "$name" >/dev/null 2>&1; then
      echo "$name"
      return 0
    fi
  done < <(e2e_macos_process_names_for_probe)
  return 1
}

e2e_macos_app_running() {
  e2e_macos_busy_process >/dev/null
}

e2e_macos_app_path() {
  local name="${1:-$E2E_MACOS_APP_PROCESS}"
  echo "$(e2e_repo_root)/tests-macos/macos/build/Build/Products/Debug/${name}.app"
}

e2e_ios_sim_booted() {
  local name=$1
  # Match name in booted devices list
  xcrun simctl list devices booted 2>/dev/null | grep -F "$name" | grep -q '(Booted)' && return 0
  # Serial/global: any booted counts as busy for iOS clearness when using defaults
  if [[ "$name" == "$E2E_DEFAULT_IOS_SIMULATOR" ]]; then
    local count
    count=$(xcrun simctl list devices booted 2>/dev/null | grep -c '(Booted)' || true)
    [[ "${count:-0}" -gt 0 ]]
    return $?
  fi
  return 1
}
