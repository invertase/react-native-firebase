#!/usr/bin/env bash
# Startup fail-fast markers for e2e tee logs (running-e2e.md#startup-fail-fast-poll).
# Hard infra only. Load-induced Detox currentStatus / 5000ms status-query latency is
# not a wave-kill and is not host-capacity proof (UNI-9way-latency).
# Healthy Detox "The app seems to be idle" must not match.
# "waiting for Metro on port 12007" is a hang only with serial emulator-5554 (leftover slot Metro).
# Slotted android slot-0 correctly waits on :12007 (emulator-5556).
# shellcheck shell=bash

# Line-oriented pattern for notify_on_output / AwaitShell (no bare APP_STATUS, no bare :12007,
# no currentStatus / 5000ms — those are latency, not hard infra).
E2E_STARTUP_FAILFAST_NOTIFY_PATTERN='ReactContext is null|TELNET_ERROR|Cannot connect|emulator-16|Jest did not exit'

# True when a tee/lifecycle log should abort immediately (hard infra / leftover emu).
e2e_log_has_startup_failfast() {
  local f="${1:?log}"
  [[ -f "$f" ]] || return 1
  if grep -qE "$E2E_STARTUP_FAILFAST_NOTIFY_PATTERN" "$f"; then
    return 0
  fi
  # Serial leftover: unslotted TestingAVD/5554 waiting on slot-0 Metro :12007.
  if grep -qE 'waiting for Metro on port 12007' "$f" && grep -qE 'emulator-5554' "$f"; then
    return 0
  fi
  return 1
}

# Wave infra abort: pod/:build/preflight (exit 99 or lifecycle incomplete), not product mocha fails.
e2e_wave_is_infra_abort() {
  local exit_code="${1:?}"
  local life="${2:-}"
  if [[ "$exit_code" == "99" ]]; then
    return 0
  fi
  if [[ -n "$life" && -f "$life" ]]; then
    if grep -qE '\[cell\] INFRA|Unable to find a specification' "$life"; then
      return 0
    fi
    if [[ "$exit_code" != "0" ]] && ! grep -qE 'test-cover start' "$life"; then
      return 0
    fi
  fi
  return 1
}
