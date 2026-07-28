#!/bin/bash
# Wait for macOS host load average to drop before starting Detox (experimental CI settle step).
set -euo pipefail

MAX_WAIT_SEC="${RNFB_LOAD_SETTLE_MAX_WAIT_SEC:-1200}"
POLL_SEC="${RNFB_LOAD_SETTLE_POLL_SEC:-5}"
MAX_LOAD="${RNFB_LOAD_SETTLE_MAX_LOAD:-20}"

parse_load1() {
  # uptime: ... load averages: 1.23 4.56 7.89
  uptime 2>/dev/null | sed -n 's/.*load averages: \([0-9.]*\).*/\1/p' | head -1
}

elapsed=0
echo "[load-settle] max_wait=${MAX_WAIT_SEC}s poll=${POLL_SEC}s threshold=${MAX_LOAD}"

while (( elapsed <= MAX_WAIT_SEC )); do
  load1="$(parse_load1)"
  if [[ -z "$load1" ]]; then
    echo "[load-settle] ts=$(date -u +%Y-%m-%dT%H:%M:%SZ) elapsed=${elapsed}s load1=unknown (could not parse uptime)"
  else
    echo "[load-settle] ts=$(date -u +%Y-%m-%dT%H:%M:%SZ) elapsed=${elapsed}s load1=${load1} threshold=${MAX_LOAD}"
    if awk -v load="$load1" -v max="$MAX_LOAD" 'BEGIN { exit (load < max) ? 0 : 1 }'; then
      echo "[load-settle] host load ${load1} < ${MAX_LOAD} after ${elapsed}s — proceeding"
      exit 0
    fi
  fi

  if (( elapsed >= MAX_WAIT_SEC )); then
    break
  fi

  sleep "$POLL_SEC"
  elapsed=$((elapsed + POLL_SEC))
done

echo "[load-settle] WARN: timed out after ${MAX_WAIT_SEC}s with load1=${load1:-unknown} (threshold=${MAX_LOAD}) — proceeding anyway"
exit 0
