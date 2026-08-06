#!/bin/bash
# Collate high-signal iOS e2e flake markers from CI step logs on disk.
set -uo pipefail

OUT="${RNFB_FLAKE_SUMMARY_OUT:-flake-summary.txt}"
DETOX_LOG="${RNFB_DETOX_LOG:-}"

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
      '\[jet-ws\]|\[rnfb-e2e\]|\[jet-coverage\]|\[rnfb-lifecycle\]|RETRYABLE_DISCONNECT|reconnect_recovered|FrontBoard|FBSOpenApplication|coverage-ready|retry-eligibility|install-state|terminateApp|launchApp failure|Jet attempt|FAIL e2e|orchestrate-state|Child process terminated|log stream restarted|\[load-settle\]' \
      "$file" 2>/dev/null | tail -200 || true
    echo ""
  }

  summarize "detox-log" "${DETOX_LOG}"
  summarize "sim-app-log" "sim-app.log"
  summarize "resource-monitor" "resource-monitor.log"
  summarize "resource-monitor-android" "resource-monitor-android.log"
  summarize "metro-log" "metro.log"

  echo "=== disconnect_context vs resource-monitor load ==="
  if [[ -f "${DETOX_LOG}" ]]; then
    rg -n '\[jet-ws\] disconnect_context' "${DETOX_LOG}" 2>/dev/null | tail -20 || true
  fi
  if [[ -f "resource-monitor.log" ]]; then
    echo "--- resource-monitor load around disconnect (last 80 load lines) ---"
    rg -n 'load averages|^\[resource-monitor\] ps-empty' resource-monitor.log 2>/dev/null | tail -80 || true
  fi
  echo ""

  echo "=== log stream death markers ==="
  for f in sim-app.log; do
    if [[ -f "$f" ]]; then
      rg -n 'Child process terminated|log stream restarted' "$f" 2>/dev/null | tail -20 || true
    fi
  done
  echo ""
} >"$OUT"

echo "[flake-summary] wrote ${OUT} ($(wc -l <"$OUT" | tr -d ' ') lines)"
