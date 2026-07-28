#!/bin/bash
# Snapshot host and guest CPU/load during Android e2e runs.
set -uo pipefail

INTERVAL_SEC="${RNFB_RESOURCE_MONITOR_INTERVAL_SEC:-10}"
LOG_FILE="${RNFB_RESOURCE_MONITOR_LOG:-resource-monitor-android.log}"
ADB="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}/platform-tools/adb"
SERIAL="${ANDROID_SERIAL:-emulator-5554}"

if [[ ! -x "$ADB" ]]; then
  ADB="$(command -v adb || true)"
fi

echo "[resource-monitor-android] interval=${INTERVAL_SEC}s log=${LOG_FILE} serial=${SERIAL} pid=$$" >>"$LOG_FILE"

while true; do
  {
    echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
    echo "--- host load ---"
    uptime
    echo "--- host top (pid pcpu pmem rss elapsed command) ---"
    ps -eo pid,pcpu,pmem,rss,etime,cmd --sort=-pcpu 2>/dev/null | head -25 || true
    echo "--- host e2e-related ---"
    ps -eo pid,pcpu,pmem,rss,etime,cmd 2>/dev/null \
      | grep -E 'qemu-system|adb |node |java |gradle|Metro' \
      | grep -v grep || true
    if [[ -n "$ADB" && -x "$ADB" ]]; then
      echo "--- guest props ---"
      "$ADB" -s "$SERIAL" shell getprop sys.boot_completed dev.bootcomplete 2>/dev/null || true
      echo "--- guest load ---"
      "$ADB" -s "$SERIAL" shell cat /proc/loadavg 2>/dev/null || true
      "$ADB" -s "$SERIAL" shell uptime 2>/dev/null || true
      echo "--- guest e2e-related ---"
      "$ADB" -s "$SERIAL" shell ps -A -o PID,NAME,CPU 2>/dev/null \
        | grep -E 'invertase|testing' \
        | grep -v grep || true
    fi
    echo ""
  } >>"$LOG_FILE" 2>&1
  sleep "$INTERVAL_SEC"
done
