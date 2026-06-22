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
      '\[jet-ws\]|\[rnfb-e2e\]|\[jet-coverage\]|\[rnfb-lifecycle\]|RETRYABLE_DISCONNECT|reconnect_recovered|FrontBoard|FBSOpenApplication|coverage-ready|retry-eligibility|install-state|terminateApp|launchApp failure|Jet attempt|FAIL e2e' \
      "$file" 2>/dev/null | tail -200 || true
    echo ""
  }

  summarize "detox-log" "${DETOX_LOG}"
  summarize "simulator-log" "simulator.log"
  summarize "testing-log" "testing.log"
  summarize "springboard-log" "springboard-invertase.log"
  summarize "resource-monitor" "resource-monitor.log"
  summarize "metro-log" "metro.log"
} >"$OUT"

echo "[flake-summary] wrote ${OUT} ($(wc -l <"$OUT" | tr -d ' ') lines)"
