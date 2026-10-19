#!/usr/bin/env bash
# Collate high-signal iOS e2e flake markers (Tart copy).
set -uo pipefail

OUT="${RNFB_FLAKE_SUMMARY_OUT:-flake-summary.txt}"
DETOX_LOG="${RNFB_DETOX_LOG:-}"
LOG_DIR="${RNFB_LOG_DIR:-.}"

{
  echo "flake-summary generated $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""

  summarize() {
    local label="$1"
    local file="$2"
    if [[ ! -f "$file" ]]; then
      echo "=== ${label}: (missing ${file}) ==="
      echo ""
      return
    fi
    echo "=== ${label}: ${file} ($(wc -l <"$file" | tr -d ' ') lines) ==="
    rg -n \
      '\[jet-ws\]|\[rnfb-e2e\]|\[jet-coverage\]|\[rnfb-lifecycle\]|RETRYABLE_DISCONNECT|reconnect_recovered|FrontBoard|FBSOpenApplication|coverage-ready|retry-eligibility|install-state|terminateApp|launchApp failure|Jet attempt|FAIL e2e' \
      "$file" 2>/dev/null | tail -200 || true
    echo ""
  }

  summarize "detox-log" "${DETOX_LOG}"
  summarize "simulator-log" "${LOG_DIR}/simulator.log"
  summarize "testing-log" "${LOG_DIR}/testing.log"
  summarize "springboard-log" "${LOG_DIR}/springboard-invertase.log"
  summarize "resource-monitor" "${LOG_DIR}/resource-monitor.log"
  summarize "metro-log" "${LOG_DIR}/metro.log"

  echo "=== await-exit stall markers ==="
  if [[ -f "${DETOX_LOG}" ]]; then
    rg -n 'awaiting-jet-exit stalled|stall-kill-jet|launch-retry-kill-jet|stall-diagnostics|Coverage summary|Unknown% \( 0/0 \)|\( 0/0 \)' \
      "${DETOX_LOG}" 2>/dev/null | tail -40 || true
  else
    echo "(no detox log)"
  fi
  if [[ -f "${LOG_DIR}/resource-monitor.log" ]]; then
    echo "--- resource-monitor load around stall (last 40 load lines) ---"
    rg -n 'load averages|^\[resource-monitor\] ps-empty' "${LOG_DIR}/resource-monitor.log" 2>/dev/null | tail -40 || true
  fi
  echo ""
} >"$OUT"

echo "[flake-summary] wrote ${OUT} ($(wc -l <"$OUT" | tr -d ' ') lines)"
