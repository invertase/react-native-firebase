#!/usr/bin/env bash
# Run record: resources e2e runs from this checkout started or worked with.
# Default yarn tests:e2e:release frees only recorded resources; anything else on the
# identity's ports/names is another owner's and is left running.
#
# Layout: ${RNFB_E2E_RUN_RECORD_DIR:-<repo>/.e2e-run}/<identity>/<entry>
#   identity = slot-N (RNFB_E2E_SLOT / RNFB_E2E_HOST_SLOT / --slot=N) or serial
#   one file per entry (tmp + mv), one tab-separated line:
#     pid     <pid> <start> <label>                    file pid-<pid>-<start key>
#     android <serial> <avd> <qemu pid> <start>        file android-<serial>
#     ios-sim <udid> <name> <launchd_sim pid> <start>  file ios-sim-<udid>
#   <start> is the process start time (PID reuse guard). Device entries count only while
#   that exact qemu / launchd_sim instance is alive; otherwise they are pruned unacted.
# Same format is written by tests/e2e/runRecord.js.
#
# shellcheck shell=bash

_E2E_RUN_RECORD_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

e2e_run_identity() {
  local slot="${E2E_SLOT_OVERRIDE:-${RNFB_E2E_SLOT:-${RNFB_E2E_HOST_SLOT:-}}}"
  if [[ -n "$slot" ]]; then
    echo "slot-${slot}"
  else
    echo serial
  fi
}

e2e_run_record_dir() {
  echo "${RNFB_E2E_RUN_RECORD_DIR:-${_E2E_RUN_RECORD_REPO_ROOT}/.e2e-run}/$(e2e_run_identity)"
}

# Process start time, or nothing when the pid is gone. Linux: /proc stat starttime
# (exact). Elsewhere: ps lstart pinned to LC_ALL=C TZ=UTC so writer and reader agree.
e2e_pid_start_time() {
  local pid=$1 line out
  [[ "$pid" =~ ^[0-9]+$ ]] || return 0
  if [[ -r "/proc/${pid}/stat" ]]; then
    IFS= read -r line <"/proc/${pid}/stat" 2>/dev/null || return 0
    local -a f
    read -r -a f <<<"${line##*) }"
    [[ -n "${f[19]:-}" ]] && printf 'proc:%s' "${f[19]}"
    return 0
  fi
  out="$(LC_ALL=C TZ=UTC ps -p "$pid" -o lstart= 2>/dev/null || true)"
  out="${out#"${out%%[![:space:]]*}"}"
  out="${out%"${out##*[![:space:]]}"}"
  printf '%s' "$out"
}

# File-name-safe form of a start time (pid entries are unique per process instance).
e2e_run_record_key() {
  printf '%s' "${1//[^A-Za-z0-9]/_}"
}

e2e_pid_parent() {
  local out
  out="$(ps -p "$1" -o ppid= 2>/dev/null || true)"
  echo "${out//[[:space:]]/}"
}

e2e_pid_args() {
  ps -p "$1" -o args= 2>/dev/null || true
}

e2e_pid_cwd() {
  lsof -a -p "$1" -d cwd -Fn 2>/dev/null | awk '/^n/ { print substr($0, 2); exit }' || true
}

# Write one entry: e2e_run_record_put <name> <field>...
e2e_run_record_put() {
  local name=$1
  shift
  local dir tmp
  dir="$(e2e_run_record_dir)"
  mkdir -p "$dir" 2>/dev/null || return 0
  tmp="${dir}/.${name}.$$"
  (
    IFS=$'\t'
    printf '%s\n' "$*"
  ) >"$tmp" 2>/dev/null && mv -f "$tmp" "${dir}/${name}" 2>/dev/null
  return 0
}

e2e_run_record_pid() {
  local pid=$1 label=$2 start
  [[ "$pid" =~ ^[0-9]+$ ]] || return 0
  start="$(e2e_pid_start_time "$pid")"
  [[ -n "$start" ]] || return 0
  e2e_run_record_put "pid-${pid}-$(e2e_run_record_key "$start")" pid "$pid" "$start" "$label"
}

# Print "<file>\t<entry line>" for every entry of a kind.
e2e_run_record_entries() {
  local kind=$1 dir f line
  dir="$(e2e_run_record_dir)"
  [[ -d "$dir" ]] || return 0
  for f in "$dir"/*; do
    [[ -f "$f" ]] || continue
    line=""
    IFS= read -r line <"$f" || [[ -n "$line" ]] || continue
    [[ "${line%%$'\t'*}" == "$kind" ]] || continue
    printf '%s\t%s\n' "$f" "$line"
  done
}

e2e_run_record_drop() {
  rm -f "$1"
}

# True when pid is alive with the recorded start time and its args contain needle.
e2e_device_token_live() {
  local pid=$1 start=$2 needle=$3
  [[ "$pid" =~ ^[0-9]+$ && -n "$start" ]] || return 1
  [[ "$(e2e_pid_start_time "$pid")" == "$start" ]] || return 1
  [[ "$(e2e_pid_args "$pid") " == *"${needle}"* ]]
}

e2e_android_token_needle() {
  printf '@%s ' "$1"
}

e2e_ios_token_needle() {
  printf '/Devices/%s/' "$1"
}

# Live recorded pids → E2E_RUN_RECORD_OWNED (" p1 p2 "). Prunes pid entries whose
# process is gone or reused, and device entries whose recorded instance is gone.
E2E_RUN_RECORD_OWNED=" "
e2e_run_record_load() {
  local f kind a b c d
  E2E_RUN_RECORD_OWNED=" "
  while IFS=$'\t' read -r f kind a b c; do
    [[ -n "$f" ]] || continue
    if [[ -n "$a" && "$(e2e_pid_start_time "$a")" == "$b" ]]; then
      E2E_RUN_RECORD_OWNED="${E2E_RUN_RECORD_OWNED}${a} "
    else
      e2e_run_record_drop "$f"
    fi
  done < <(e2e_run_record_entries pid)
  while IFS=$'\t' read -r f kind a b c d; do
    [[ -n "$f" ]] || continue
    e2e_device_token_live "$c" "$d" "$(e2e_android_token_needle "$b")" || e2e_run_record_drop "$f"
  done < <(e2e_run_record_entries android)
  while IFS=$'\t' read -r f kind a b c d; do
    [[ -n "$f" ]] || continue
    e2e_device_token_live "$c" "$d" "$(e2e_ios_token_needle "$a")" || e2e_run_record_drop "$f"
  done < <(e2e_run_record_entries ios-sim)
}

# "<file>\t<kind>\t<id>\t<name>\t<pid>\t<start>" for recorded devices whose instance is live.
e2e_run_record_live_devices() {
  local kind=$1 f k id name pid start needle
  while IFS=$'\t' read -r f k id name pid start; do
    [[ -n "$f" ]] || continue
    if [[ "$kind" == android ]]; then
      needle="$(e2e_android_token_needle "$name")"
    else
      needle="$(e2e_ios_token_needle "$id")"
    fi
    e2e_device_token_live "$pid" "$start" "$needle" || continue
    printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$f" "$k" "$id" "$name" "$pid" "$start"
  done < <(e2e_run_record_entries "$kind")
}

# True when a recorded, live device instance has this id (android serial / iOS UDID).
e2e_run_record_device_owned() {
  local kind=$1 want=$2 _f _k id _rest
  while IFS=$'\t' read -r _f _k id _rest; do
    [[ "$id" == "$want" ]] && return 0
  done < <(e2e_run_record_live_devices "$kind")
  return 1
}

# Pid of the running instance for a device id, recorded or not: the qemu with
# `-port N` for android emulator-N, or the launchd_sim of an iOS UDID. Nothing if none.
e2e_device_instance_pid() {
  local kind=$1 id=$2 pid args
  while read -r pid args; do
    if [[ "$kind" == android ]]; then
      [[ "$args" == *qemu-system* && " $args " == *" -port ${id#emulator-} "* ]] || continue
    else
      [[ "$args" == *launchd_sim* && "$args" == *"$(e2e_ios_token_needle "$id")"* ]] || continue
    fi
    echo "$pid"
    return 0
  done < <(ps -axo pid=,args= 2>/dev/null)
  return 0
}

# "<pid>\t<console port>\t<avd>" for every running emulator qemu: args name qemu-system
# and carry a ` -port N `, ` @<avd> ` or ` -avd <avd> ` argument (either field may be
# empty, not both). Device recording matches `@<avd>` only; see tests/e2e/runRecord.js.
e2e_qemu_instances() {
  local pid args port avd re_port=' -port ([0-9]+) ' re_avd=' @([^ ]+) ' re_avd_flag=' -avd ([^ ]+) '
  while read -r pid args; do
    [[ "$args" == *qemu-system* ]] || continue
    port=""
    avd=""
    [[ " $args " =~ $re_port ]] && port="${BASH_REMATCH[1]}"
    if [[ " $args " =~ $re_avd ]]; then
      avd="${BASH_REMATCH[1]}"
    elif [[ " $args " =~ $re_avd_flag ]]; then
      avd="${BASH_REMATCH[1]}"
    fi
    [[ -n "$port$avd" ]] || continue
    printf '%s\t%s\t%s\n' "$pid" "$port" "$avd"
  done < <(ps -axo pid=,args= 2>/dev/null)
  return 0
}

# this-checkout (recorded live instance, or a descendant of a recorded pid),
# this-checkout-unrecorded (its qemu runs with cwd in this repo — e.g. booted before the
# run record existed), or unrecorded. A real simulator's launchd_sim is a child of
# launchd with cwd /, so in practice an unrecorded simulator is unrecorded.
# Call e2e_run_record_load first.
e2e_device_owner() {
  local kind=$1 id=$2 pid
  if e2e_run_record_device_owned "$kind" "$id"; then
    echo this-checkout
    return 0
  fi
  pid="$(e2e_device_instance_pid "$kind" "$id")"
  if [[ -n "$pid" ]]; then
    e2e_pid_owner "$pid"
  else
    echo unrecorded
  fi
}

# Stop a process this script spawned: root, its descendants, and listeners on the given
# ports that are owned through the record — never another owner's listener. TERM, then KILL.
e2e_kill_started_tree() {
  local root=$1 sig port pid
  shift
  local -a pids
  [[ "$root" =~ ^[0-9]+$ ]] || return 0
  for sig in TERM KILL; do
    e2e_run_record_load
    pids=()
    while IFS= read -r pid; do
      [[ -n "$pid" ]] && pids+=("$pid")
    done < <(e2e_pid_tree "$root")
    for port in "$@"; do
      while IFS= read -r pid; do
        [[ -n "$pid" ]] && e2e_pid_owned "$pid" && pids+=("$pid")
      done < <(e2e_port_listener_pids "$port")
    done
    [[ ${#pids[@]} -gt 0 ]] || break
    kill "-${sig}" "${pids[@]}" 2>/dev/null || true
    sleep 1
  done
  return 0
}

# True when pid or one of its ancestors is a live recorded pid (call e2e_run_record_load first).
e2e_pid_owned() {
  local pid=$1 depth=0
  while [[ "$pid" =~ ^[0-9]+$ ]] && ((pid > 1 && depth < 32)); do
    case "$E2E_RUN_RECORD_OWNED" in
      *" ${pid} "*) return 0 ;;
    esac
    pid="$(e2e_pid_parent "$pid")"
    depth=$((depth + 1))
  done
  return 1
}

# this-checkout (recorded; release frees it), this-checkout-unrecorded (cwd inside this
# repo but not recorded — e.g. started before the run record existed, or outside
# yarn tests:*), or unrecorded (another owner).
e2e_pid_owner() {
  local pid=$1 cwd
  if e2e_pid_owned "$pid"; then
    echo this-checkout
    return 0
  fi
  cwd="$(e2e_pid_cwd "$pid")"
  if [[ -n "$cwd" && ("$cwd" == "$_E2E_RUN_RECORD_REPO_ROOT" || "$cwd" == "$_E2E_RUN_RECORD_REPO_ROOT"/*) ]]; then
    echo this-checkout-unrecorded
  else
    echo unrecorded
  fi
}

# Echo recorded live pids with an exact label (e.g. macos-app:io.invertase.testing).
e2e_run_record_pids_with_label() {
  local want=$1 f kind pid start label
  while IFS=$'\t' read -r f kind pid start label; do
    [[ -n "$pid" && "$label" == "$want" ]] || continue
    [[ "$(e2e_pid_start_time "$pid")" == "$start" ]] && echo "$pid"
  done < <(e2e_run_record_entries pid)
}

# Record listeners on a port that are already owned (descendants of a recorded pid), so
# they stay owned after their parent exits. A foreign listener is never recorded.
e2e_run_record_owned_port_listeners() {
  local port=$1 label=$2 pid
  e2e_run_record_load
  while IFS= read -r pid; do
    [[ -n "$pid" ]] || continue
    e2e_pid_owned "$pid" && e2e_run_record_pid "$pid" "$label"
  done < <(e2e_port_listener_pids "$port")
  return 0
}

# Current LISTEN pids on a port (fresh lsof).
e2e_port_listener_pids() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null || true
}

# pid and all its descendants, parents first.
e2e_pid_tree() {
  local pid=$1 child
  [[ "$pid" =~ ^[0-9]+$ ]] || return 0
  echo "$pid"
  while IFS= read -r child; do
    [[ -n "$child" ]] && e2e_pid_tree "$child"
  done < <(pgrep -P "$pid" 2>/dev/null || true)
}

# Owner diagnostics for a pid: pid, command, cwd.
e2e_pid_describe() {
  local pid=$1 cmd
  cmd="$(e2e_pid_args "$pid")"
  printf 'pid=%s cmd=%s cwd=%s' "$pid" "${cmd:0:120}" "$(e2e_pid_cwd "$pid")"
}

# Guidance for a holder this run will not kill. Args: <owner> <release --only category>.
e2e_foreign_holder_hint() {
  local owner=$1 category=$2
  if [[ "$owner" == this-checkout-unrecorded ]]; then
    echo "it runs from this checkout but no run recorded it (for example started outside yarn tests:*, before the run record existed, or by a step that does not record what it starts). Stop it, or in this shell's slot env run: yarn tests:e2e:release --include-unrecorded --only ${category}"
  else
    echo "another owner holds it. Free it from its owner, or use a free slot: eval \"\$(yarn tests:e2e:export-slot-env <platform> N)\" (yarn tests:e2e:check --services names one)"
  fi
}
