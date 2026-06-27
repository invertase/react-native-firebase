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
    top_ps="$(ps -arc www -o pid,pcpu,pmem,rss,etime,command 2>/dev/null | head -30 || true)"
    if [[ -z "$(echo "$top_ps" | sed -n '2,$p' | grep -v '^[[:space:]]*$' | head -1)" ]]; then
      echo "[resource-monitor] ps-empty falling back to ps aux + top -l 1"
      ps aux 2>/dev/null | head -30 || true
      top -l 1 -n 10 -stats pid,cpu,mem,command 2>/dev/null | head -25 || true
    else
      echo "$top_ps"
    fi
    echo "--- e2e-related ---"
    e2e_ps="$(ps -arc www -o pid,pcpu,pmem,rss,etime,command 2>/dev/null \
      | grep -E 'testing|node |java |Simulator|Metro|simctl|log stream|screencapture' \
      | grep -v grep || true)"
    if [[ -z "$e2e_ps" ]]; then
      echo "[resource-monitor] ps-empty falling back to ps aux grep"
      ps aux 2>/dev/null \
        | grep -E 'testing|node |java |Simulator|Metro|simctl|log stream|screencapture' \
        | grep -v grep \
        | head -20 || true
    else
      echo "$e2e_ps"
    fi
    echo ""
  } >>"$LOG_FILE" 2>&1
  sleep "$INTERVAL_SEC"
done
