#!/bin/bash
# Snapshot CPU/memory/IO-ish process stats during iOS e2e runs.
set -uo pipefail

INTERVAL_SEC="${RNFB_RESOURCE_MONITOR_INTERVAL_SEC:-10}"
LOG_FILE="${RNFB_RESOURCE_MONITOR_LOG:-resource-monitor.log}"

echo "[resource-monitor] interval=${INTERVAL_SEC}s log=${LOG_FILE} pid=$$" >>"$LOG_FILE"

while true; do
  {
    echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
    echo "--- load ---"
    uptime
    echo "--- top (pid pcpu pmem rss command) ---"
    ps -arc www -o pid,pcpu,pmem,rss,etime,command 2>/dev/null | head -30 || true
    echo "--- e2e-related ---"
    ps -arc www -o pid,pcpu,pmem,rss,etime,command 2>/dev/null \
      | grep -E 'testing|node |java |Simulator|Metro|simctl|log stream|screencapture' \
      | grep -v grep || true
    echo ""
  } >>"$LOG_FILE" 2>&1
  sleep "$INTERVAL_SEC"
done
