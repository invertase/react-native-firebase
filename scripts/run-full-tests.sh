#!/usr/bin/env bash
# Full test suite orchestrator for react-native-firebase.
#
# Usage:
#   yarn test:full [--slot N] [--clear-whole-host] [--verbose]
#
# Deterministic full gate: always scoped release + check before e2e, and scoped
# release --devices after (pass or fail). Fast reuse / tight iteration uses the
# decomposed yarn tests:* loop in OKF running-e2e.md — not this script.
#
# --slot N              Slotted parallel e2e (1× android ∥ 1× ios ∥ 1× macos).
#                       Omit for serial unslotted e2e (ios → android → macos).
# --clear-whole-host    Whole-host yarn tests:e2e:release --all-slots --devices
#                       before and after e2e. Dedicated e2e Mac only — kills every slot.
# --verbose             Stream step output; default logs to LOGDIR only (LLM-friendly).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
EXPORT_SLOT_ENV="${REPO_ROOT}/scripts/e2e/export-slot-env.sh"
CLEAR_SLOT_ENV="${REPO_ROOT}/scripts/e2e/clear-slot-env.sh"
# shellcheck source=e2e/lib/e2e-slot-env.sh
source "${REPO_ROOT}/scripts/e2e/lib/e2e-slot-env.sh"
# shellcheck source=e2e/lib/e2e-resource-env.sh
source "${REPO_ROOT}/scripts/e2e/lib/e2e-resource-env.sh"

SLOT=""
CLEAR_WHOLE_HOST=0
VERBOSE=0

LOG_DIR=""
META_FILE=""
PHASE=0
PHASE_TOTAL=6
RUN_START=$SECONDS

# Background PIDs we own (slotted packagers / emulators) for trap cleanup.
declare -a OWNED_PIDS=()

usage() {
  cat <<'EOF'
Usage: yarn test:full [--slot N] [--clear-whole-host] [--verbose]

  --slot N              Slotted parallel e2e (android + ios + macos concurrently).
  --clear-whole-host    Whole-host release (--all-slots --devices). Dedicated e2e Mac only.
  --verbose             Stream command output (default: log files under LOGDIR).
  -h, --help            Show this help.

Always performs scoped release + check before e2e and scoped release --devices after.
Serial scope: TestingAVD / iPhone 17 / io.invertase.testing. Slotted: slot-N only.
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --slot)
        SLOT="${2:?--slot requires a number}"
        shift 2
        ;;
      --clear)
        echo "error: --clear was removed; yarn test:full always performs scoped release before and after e2e" >&2
        exit 2
        ;;
      --clear-all)
        echo "error: --clear-all was renamed to --clear-whole-host" >&2
        exit 2
        ;;
      --clear-whole-host)
        CLEAR_WHOLE_HOST=1
        shift
        ;;
      --verbose)
        VERBOSE=1
        shift
        ;;
      -h | --help)
        usage
        exit 0
        ;;
      *)
        echo "error: unknown argument: $1" >&2
        usage >&2
        exit 2
        ;;
    esac
  done
  if [[ -n "$SLOT" ]] && ! [[ "$SLOT" =~ ^[0-9]+$ ]]; then
    echo "error: --slot must be a non-negative integer (got: $SLOT)" >&2
    exit 2
  fi
}

elapsed_s() {
  echo $((SECONDS - RUN_START))
}

status_line() {
  local phase_name=$1 state=$2
  local extra=${3:-}
  local slot_label="serial"
  [[ -n "$SLOT" ]] && slot_label="slot-${SLOT}"
  local scope_label="scoped"
  [[ "$CLEAR_WHOLE_HOST" -eq 1 ]] && scope_label="whole-host"
  if [[ -n "$extra" ]]; then
    echo "[run-full-tests] slot=${slot_label} release=${scope_label} [phase ${PHASE}/${PHASE_TOTAL}] ${phase_name} ${state} (${extra})"
  else
    echo "[run-full-tests] slot=${slot_label} release=${scope_label} [phase ${PHASE}/${PHASE_TOTAL}] ${phase_name} ${state}"
  fi
  if [[ -n "$META_FILE" ]]; then
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ${phase_name} ${state} ${extra:-}" >>"$META_FILE"
  fi
}

log_path_for() {
  local name=$1
  echo "${LOG_DIR}/${name}.log"
}

emit_failure_detail() {
  local name=$1
  local log_file
  log_file="$(log_path_for "$name")"
  echo "[run-full-tests] FAIL detail: ${name} log=${log_file}"
  if [[ -f "$log_file" ]]; then
    echo "---- last 40 lines: ${name} ----"
    tail -n 40 "$log_file"
    echo "---- markers: ${name} ----"
    rg -n 'FAIL |Error:|TELNET_ERROR|Could not connect|prefetch retry|Tests:|passing|failing' "$log_file" 2>/dev/null | tail -n 20 || true
  fi
}

run_cmd_logged() {
  local name=$1
  shift
  local log_file
  log_file="$(log_path_for "$name")"
  if [[ "$VERBOSE" -eq 1 ]]; then
    echo "[run-full-tests] RUN ${name} (verbose)"
    if "$@"; then
      return 0
    fi
    echo "[run-full-tests] FAIL ${name}"
    return 1
  fi
  if "$@" >"$log_file" 2>&1; then
    rm -f "$log_file"
    return 0
  fi
  emit_failure_detail "$name"
  return 1
}

run_yarn() {
  local name=$1
  shift
  run_cmd_logged "$name" yarn "$@"
}

run_slotted() {
  local platform=$1
  local slot=$2
  local name=$3
  shift 3
  local log_file
  log_file="$(log_path_for "$name")"
  local inner
  inner='eval "$(bash '"${EXPORT_SLOT_ENV}"' '"$platform"' '"$slot"')" && yarn '"$(printf '%q ' "$@")"
  if [[ "$VERBOSE" -eq 1 ]]; then
    echo "[run-full-tests] RUN ${name} (slotted ${platform} ${slot}, verbose)"
    bash -c "$inner"
    return $?
  fi
  if bash -c "$inner" >"$log_file" 2>&1; then
    rm -f "$log_file"
    return 0
  fi
  emit_failure_detail "$name"
  return 1
}

run_slotted_bg() {
  local platform=$1
  local slot=$2
  local name=$3
  shift 3
  local log_file
  log_file="$(log_path_for "$name")"
  local inner
  inner='eval "$(bash '"${EXPORT_SLOT_ENV}"' '"$platform"' '"$slot"')" && yarn '"$(printf '%q ' "$@")"
  if [[ "$VERBOSE" -eq 1 ]]; then
    bash -c "$inner" &
  else
    bash -c "$inner" >"$log_file" 2>&1 &
  fi
  OWNED_PIDS+=($!)
}

kill_listen_port() {
  local port=$1
  local pids
  pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
  fi
}

slot_metro_port() {
  local platform=$1
  local slot=$2
  local base off
  base=$(e2e_slot_base "$slot")
  off=$(e2e_slot_platform_offset "$platform")
  echo $((base + off + 7))
}

# Readiness probes — OKF running-e2e.md §2 Services ready:
#   Metro: curl /status succeeds AND body contains packager-status:running
#   Firebase Functions: e2e_port_listening(FUNCTIONS_PORT) — listener only
# Do not use fixed sleep for readiness; poll with these probes or delegate to
# yarn tests:emulator:start / tests:packager:jet (they embed the same checks).

wait_for_port_free() {
  local port=$1
  local label=${2:-tcp}
  local i
  for i in $(seq 1 30); do
    if ! e2e_port_listening "$port"; then
      return 0
    fi
    sleep 1
  done
  echo "[run-full-tests] port still busy :${port} (${label})" >&2
  return 1
}

wait_for_metro_port() {
  local port=$1
  local label=${2:-metro}
  local i body
  for i in $(seq 1 90); do
    body="$(curl -sf "http://127.0.0.1:${port}/status" 2>/dev/null || true)"
    if [[ -n "$body" && "$body" == *packager-status:running* ]]; then
      return 0
    fi
    sleep 1
  done
  echo "[run-full-tests] Metro /status timeout :${port} (${label})" >&2
  return 1
}

wait_for_emulator_start_job() {
  local name=$1
  local pid=$2
  if ! wait "$pid"; then
    emit_failure_detail "$name"
    return 1
  fi
  rm -f "$(log_path_for "$name")"
  return 0
}

stop_serial_packager() {
  ps -ef | grep node | grep react-native | grep cli.js | awk '{print $2}' | xargs kill 2>/dev/null || true
  kill_listen_port 8081
  killall "io.invertase.testing" 2>/dev/null || true
  kill_listen_port 8090
  wait_for_port_free 8081 serial-metro || true
  wait_for_port_free 8090 serial-jet || true
}

cleanup_owned_pids() {
  local pid
  for pid in "${OWNED_PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  OWNED_PIDS=()
}

e2e_host_release_and_check() {
  if [[ "$CLEAR_WHOLE_HOST" -eq 1 ]]; then
    run_yarn e2e-release tests:e2e:release --all-slots --devices
    run_yarn e2e-check tests:e2e:check --all-slots --services
    return 0
  fi
  if [[ -n "$SLOT" ]]; then
    run_slotted android "$SLOT" e2e-release tests:e2e:release --devices
    run_slotted android "$SLOT" e2e-check tests:e2e:check
  else
    # Serial --devices is slot-safe: release-e2e-resources only touches TestingAVD,
    # iPhone 17, io.invertase.testing — NOT TestingAVD-N / slot sims unless --all-slots.
    run_yarn e2e-release tests:e2e:release --devices
    run_yarn e2e-check tests:e2e:check
  fi
}

e2e_host_release_after() {
  if [[ "$CLEAR_WHOLE_HOST" -eq 1 ]]; then
    run_yarn e2e-release-after tests:e2e:release --all-slots --devices
    return 0
  fi
  if [[ -n "$SLOT" ]]; then
    run_slotted android "$SLOT" e2e-release-after tests:e2e:release --devices
  else
    run_yarn e2e-release-after tests:e2e:release --devices
  fi
}

run_parallel_steps() {
  local -a names=()
  local -a runners=()
  while [[ $# -gt 0 ]]; do
    names+=("$1")
    shift
    runners+=("$1")
    shift
  done

  local failed=0
  local -a pids=()
  local i name runner

  (
    trap 'kill 0' SIGINT
    for i in "${!names[@]}"; do
      name=${names[$i]}
      runner=${runners[$i]}
      if [[ "$VERBOSE" -eq 1 ]]; then
        echo "[run-full-tests] RUN ${name} (parallel, verbose)"
        bash -c "$runner" &
      else
        bash -c "$runner" >"$(log_path_for "$name")" 2>&1 &
      fi
      pids+=($!)
    done
    i=0
    for pid in "${pids[@]}"; do
      if ! wait "$pid"; then
        failed=1
        emit_failure_detail "${names[$i]}"
      else
        rm -f "$(log_path_for "${names[$i]}")"
      fi
      i=$((i + 1))
    done
    exit "$failed"
  ) || return 1
}

run_verify_phase() {
  PHASE=3
  status_line verify RUNNING

  local -a names runners

  if [[ -n "$SLOT" ]]; then
    names=(
      tests:android:build
      tests:ios:build
      tests:macos:build
    )
    runners=(
      "eval \"\$(bash ${EXPORT_SLOT_ENV} android ${SLOT})\" && yarn tests:android:build"
      "eval \"\$(bash ${EXPORT_SLOT_ENV} ios ${SLOT})\" && yarn tests:ios:build"
      "eval \"\$(bash ${EXPORT_SLOT_ENV} macos ${SLOT})\" && yarn tests:macos:build"
    )
  else
    names=(
      tests:android:build
      tests:ios:build
      tests:macos:build
    )
    runners=(
      'yarn tests:android:build'
      'yarn tests:ios:build'
      'yarn tests:macos:build'
    )
  fi

  names+=(
    compare:types
    tsc:compile
    tsc:compile:consumer
    reference:api
    attw:check
    lint:js
    lint:deps
    lint:android
    lint:ios:check
    lint:markdown
    lint:spellcheck
    tests:jest
    tests:android:unit
    tests:ios:unit
  )
  runners+=(
    'yarn compare:types'
    'yarn tsc:compile'
    'yarn tsc:compile:consumer'
    'yarn reference:api'
    'yarn attw:check'
    'yarn lint:js'
    'yarn lint:deps'
    'yarn lint:android'
    'yarn lint:ios:check'
    'yarn lint:markdown'
    'yarn lint:spellcheck'
    'yarn tests:jest'
    'yarn tests:android:unit'
    'yarn tests:ios:unit'
  )

  local args=()
  for i in "${!names[@]}"; do
    args+=("${names[$i]}" "${runners[$i]}")
  done

  run_parallel_steps "${args[@]}"
  status_line verify OK "$(elapsed_s)s"
}

run_e2e_serial_flavor() {
  local flavor=$1
  local attempt log_name
  for attempt in 1 2 3; do
    log_name="e2e-${flavor}-cover-attempt${attempt}"
    status_line "e2e-${flavor}" "ATTEMPT ${attempt}"
    if run_yarn "$log_name" tests:"${flavor}":test-cover; then
      status_line "e2e-${flavor}" OK "attempt ${attempt}"
      return 0
    fi
    if [[ "$attempt" -eq 3 ]]; then
      status_line "e2e-${flavor}" FAIL "all attempts"
      return 1
    fi
  done
}

run_e2e_serial() {
  PHASE=5
  status_line e2e RUNNING "serial"

  eval "$(bash "${CLEAR_SLOT_ENV}")"

  run_cmd_logged detox-framework-cache bash -c '
    cd tests &&
      yarn detox clean-framework-cache &&
      yarn detox build-framework-cache
  '

  PHASE=4
  status_line e2e-preflight RUNNING
  e2e_host_release_and_check
  status_line e2e-preflight OK "$(elapsed_s)s"
  PHASE=5

  status_line e2e-services RUNNING "emulator+packager :8081"
  yarn tests:emulator:start >"$(log_path_for e2e-emulator-start)" 2>&1 &
  local emu_pid=$!
  OWNED_PIDS+=("$emu_pid")
  yarn tests:packager:jet >"$(log_path_for e2e-packager-mobile)" 2>&1 &
  OWNED_PIDS+=($!)
  wait_for_emulator_start_job e2e-emulator-start "$emu_pid" || return 1
  wait_for_metro_port 8081 mobile || {
    emit_failure_detail e2e-packager-mobile
    return 1
  }
  status_line e2e-services OK "metro :8081"

  run_e2e_serial_flavor ios || return 1
  run_yarn e2e-ios-coverage-process yarn tests:ios:test:process-coverage

  run_e2e_serial_flavor android || return 1
  run_yarn e2e-android-coverage-post yarn tests:android:post-e2e-coverage

  status_line e2e-metro-switch RUNNING "tests-macos Metro"
  stop_serial_packager
  yarn tests:macos:packager:jet >"$(log_path_for e2e-packager-macos)" 2>&1 &
  OWNED_PIDS+=($!)
  wait_for_metro_port 8081 macos || {
    emit_failure_detail e2e-packager-macos
    return 1
  }

  run_e2e_serial_flavor macos || return 1

  status_line e2e OK "$(elapsed_s)s"
}

wait_for_parallel_pids() {
  local count=$1
  shift
  local -a names=("${@:1:count}")
  local -a pids=("${@:count+1}")
  local fail=0 failed_name="" i pid

  while true; do
    local any_running=0
    for i in "${!pids[@]}"; do
      pid=${pids[$i]}
      [[ "$pid" == "0" ]] && continue
      if kill -0 "$pid" 2>/dev/null; then
        any_running=1
        continue
      fi
      if ! wait "$pid"; then
        fail=1
        failed_name=${names[$i]}
        break
      fi
      pids[$i]=0
    done
    if [[ "$fail" -eq 1 ]]; then
      for pid in "${pids[@]}"; do
        [[ "$pid" == "0" ]] && continue
        kill "$pid" 2>/dev/null || true
        wait "$pid" 2>/dev/null || true
      done
      emit_failure_detail "$failed_name"
      return 1
    fi
    [[ "$any_running" -eq 0 ]] && return 0
    sleep 1
  done
}

run_e2e_slotted_parallel() {
  PHASE=5
  status_line e2e RUNNING "slotted parallel"

  run_cmd_logged detox-framework-cache bash -c '
    cd tests &&
      yarn detox clean-framework-cache &&
      yarn detox build-framework-cache
  '

  PHASE=4
  status_line e2e-preflight RUNNING
  e2e_host_release_and_check
  status_line e2e-preflight OK "$(elapsed_s)s"
  PHASE=5

  local android_metro ios_metro macos_metro
  android_metro=$(slot_metro_port android "$SLOT")
  ios_metro=$(slot_metro_port ios "$SLOT")
  macos_metro=$(slot_metro_port macos "$SLOT")

  status_line e2e-services RUNNING "3 emulators + 3 packagers"
  # yarn tests:emulator:start exits 0 only after e2e_port_listening(FUNCTIONS_PORT).
  run_slotted android "$SLOT" e2e-emulator-android tests:emulator:start
  run_slotted ios "$SLOT" e2e-emulator-ios tests:emulator:start
  run_slotted macos "$SLOT" e2e-emulator-macos tests:emulator:start

  run_slotted_bg android "$SLOT" e2e-packager-android tests:packager:jet
  run_slotted_bg ios "$SLOT" e2e-packager-ios tests:packager:jet
  run_slotted_bg macos "$SLOT" e2e-packager-macos tests:macos:packager:jet

  wait_for_metro_port "$android_metro" "android-slot-${SLOT}" || {
    emit_failure_detail e2e-packager-android
    return 1
  }
  wait_for_metro_port "$ios_metro" "ios-slot-${SLOT}" || {
    emit_failure_detail e2e-packager-ios
    return 1
  }
  wait_for_metro_port "$macos_metro" "macos-slot-${SLOT}" || {
    emit_failure_detail e2e-packager-macos
    return 1
  }
  status_line e2e-services OK "metros :${android_metro}/:${ios_metro}/:${macos_metro}"

  local -a e2e_names=(e2e-android-cover e2e-ios-cover e2e-macos-cover)
  local -a e2e_pids=()

  if [[ "$VERBOSE" -eq 1 ]]; then
    run_slotted android "$SLOT" e2e-android-cover tests:android:test-cover &
    e2e_pids+=($!)
    run_slotted ios "$SLOT" e2e-ios-cover tests:ios:test-cover &
    e2e_pids+=($!)
    run_slotted macos "$SLOT" e2e-macos-cover tests:macos:test-cover &
    e2e_pids+=($!)
  else
    bash -c 'eval "$(bash '"${EXPORT_SLOT_ENV}"' android '"$SLOT"')" && yarn tests:android:test-cover' \
      >"$(log_path_for e2e-android-cover)" 2>&1 &
    e2e_pids+=($!)
    bash -c 'eval "$(bash '"${EXPORT_SLOT_ENV}"' ios '"$SLOT"')" && yarn tests:ios:test-cover' \
      >"$(log_path_for e2e-ios-cover)" 2>&1 &
    e2e_pids+=($!)
    bash -c 'eval "$(bash '"${EXPORT_SLOT_ENV}"' macos '"$SLOT"')" && yarn tests:macos:test-cover' \
      >"$(log_path_for e2e-macos-cover)" 2>&1 &
    e2e_pids+=($!)
  fi

  wait_for_parallel_pids 3 "${e2e_names[@]}" "${e2e_pids[@]}" || return 1

  PHASE=6
  status_line post-e2e-coverage RUNNING
  run_slotted android "$SLOT" e2e-android-coverage-post tests:android:post-e2e-coverage
  run_slotted ios "$SLOT" e2e-ios-coverage-process tests:ios:test:process-coverage
  status_line post-e2e-coverage OK "$(elapsed_s)s"

  status_line e2e OK "$(elapsed_s)s"
}

on_exit() {
  local ec=$?
  cleanup_owned_pids
  if [[ "$ec" -ne 0 ]]; then
    if [[ "$CLEAR_WHOLE_HOST" -eq 1 ]]; then
      yarn tests:e2e:release --all-slots --devices \
        >>"$(log_path_for e2e-release-exit)" 2>&1 || true
    elif [[ -n "${SLOT:-}" ]]; then
      bash -c 'eval "$(bash '"${EXPORT_SLOT_ENV}"' android '"${SLOT}"')" && yarn tests:e2e:release --devices' \
        >>"$(log_path_for e2e-release-exit)" 2>&1 || true
    else
      yarn tests:e2e:release --devices >>"$(log_path_for e2e-release-exit)" 2>&1 || true
    fi
    echo "[run-full-tests] FAILED exit=${ec} LOGDIR=${LOG_DIR}"
  fi
}

main() {
  parse_args "$@"

  cd "$REPO_ROOT"
  LOG_DIR="$(mktemp -d /tmp/rnfb-full-XXXXXX)"
  META_FILE="${LOG_DIR}/00-meta.txt"
  trap on_exit EXIT

  {
    echo "LOGDIR=${LOG_DIR}"
    echo "slot=${SLOT:-serial}"
    echo "clear_whole_host=${CLEAR_WHOLE_HOST}"
    echo "verbose=${VERBOSE}"
    date -u +%Y-%m-%dT%H:%M:%SZ
  } | tee "$META_FILE"

  local slot_label="serial"
  [[ -n "$SLOT" ]] && slot_label="slot-${SLOT}"
  local scope_label="scoped"
  [[ "$CLEAR_WHOLE_HOST" -eq 1 ]] && scope_label="whole-host"
  echo "[run-full-tests] LOGDIR=${LOG_DIR} slot=${slot_label} release=${scope_label} verbose=${VERBOSE}"

  # Static checks must not inherit stale slotted env from the parent shell.
  eval "$(bash "${CLEAR_SLOT_ENV}")" >/dev/null

  PHASE=1
  status_line install RUNNING
  run_yarn install install
  status_line install OK "$(elapsed_s)s"

  PHASE=2
  status_line pods RUNNING
  run_parallel_steps \
    tests:ios:pod:install 'yarn tests:ios:pod:install' \
    tests:macos:pod:install 'yarn tests:macos:pod:install'
  status_line pods OK "$(elapsed_s)s"

  run_verify_phase

  if [[ -n "$SLOT" ]]; then
    run_e2e_slotted_parallel
  else
    run_e2e_serial
    PHASE=6
    status_line post-e2e-coverage OK "serial inline"
  fi

  status_line e2e-release RUNNING
  e2e_host_release_after
  status_line e2e-release OK "$(elapsed_s)s"

  echo "[run-full-tests] ALL_PASSED LOGDIR=${LOG_DIR} elapsed=$(elapsed_s)s"
}

main "$@"
