#!/bin/bash
# android-emulator-runner executes each script: line via sh -c; keep orchestration here.
set -uo pipefail

TEST_EXIT=0
ADB="${ANDROID_HOME}/platform-tools/adb"

cleanup_android_e2e() {
  pkill -f resource-monitor-android.sh || true
  pkill -f "adb logcat" || true
  "$ADB" -s emulator-5554 emu kill 2>/dev/null || true
  sleep "${ANDROID_EMULATOR_WAIT_TIME_BEFORE_KILL:-5}"
  if pgrep -f qemu-system-x86_64-headless >/dev/null 2>&1; then
    echo "Emulator did not exit gracefully; force-killing qemu"
    pkill -9 -f qemu-system-x86_64-headless || true
  fi
}

trap cleanup_android_e2e EXIT

"$ADB" devices
nohup sh -c "$ADB logcat '*:D' > adb-log.txt" &
chmod +x ./.github/workflows/scripts/resource-monitor-android.sh
nohup ./.github/workflows/scripts/resource-monitor-android.sh &

yarn tests:android:test-cover --headless || TEST_EXIT=$?

# Pull coverage.ec and run Jacoco while the emulator and app filesDir are still
# intact. cleanup_android_e2e (emu kill) must run only after post-e2e — reordering
# here regressed native uploads when this script replaced the inline CI script.
yarn tests:android:post-e2e-coverage || true

exit "$TEST_EXIT"
