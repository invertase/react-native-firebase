#!/bin/bash
# Reproduce intermittent Android packageDebugAndroidTest / IncrementalSplitterRunnable
# failures under cold install + parallel host load (mirrors run-full-tests.sh phase 2–5).
#
# Usage:
#   ./scripts/repro-android-build-flake.sh [attempts]
#   ATTEMPTS=5 ./scripts/repro-android-build-flake.sh
#
# Logs:
#   /tmp/rnfb-android-flake-repro.log      full output
#   /tmp/rnfb-android-flake-repro.summary  pass/fail per attempt

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

ATTEMPTS="${1:-${ATTEMPTS:-5}}"
LOG="${LOG:-/tmp/rnfb-android-flake-repro.log}"
SUMMARY="${SUMMARY:-/tmp/rnfb-android-flake-repro.summary}"

: >"$LOG"
: >"$SUMMARY"

log() {
  echo "$1" | tee -a "$LOG" "$SUMMARY"
}

# Plain rm only — do not call yarn build:clean before node_modules exists (rimraf lives there).
clean_workspace_artifacts() {
  log "  stopping gradle daemons..."
  (cd tests/android && ./gradlew --stop >>"$LOG" 2>&1) || true

  log "  removing android/ios/macos build dirs..."
  rm -rf \
    tests/android/build \
    tests/android/app/build \
    tests/android/.gradle \
    tests/android/app/.cxx \
    tests/ios/build \
    tests/macos/build \
    tests/dist

  log "  removing all node_modules..."
  find . -name node_modules -type d -prune -exec rm -rf {} + 2>/dev/null || true
}

cold_reset() {
  log "=== COLD RESET $(date -Iseconds) ==="
  clean_workspace_artifacts

  log "  yarn install (codegen)..."
  yarn install >>"$LOG" 2>&1 || return 1

  log "  gradlew clean (post-codegen)..."
  (cd tests/android && ./gradlew clean --no-build-cache >>"$LOG" 2>&1) || true

  log "  pod install (ios + macos)..."
  (yarn tests:ios:pod:install >>"$LOG" 2>&1 & yarn tests:macos:pod:install >>"$LOG" 2>&1 & wait) || return 1
}

# Android build with maximum coldness; other jobs match run-full-tests.sh parallel block.
run_android_build_cold() {
  (
    cd tests/android
    ./gradlew-with-worker-cap.sh \
      assembleDebug assembleAndroidTest lintDebug \
      -DtestBuildType=debug \
      --warning-mode all \
      --stacktrace \
      --no-build-cache \
      --rerun-tasks
  ) >>"$LOG" 2>&1
}

parallel_verify() {
  log "=== PARALLEL VERIFY $(date -Iseconds) ==="
  local pids=()
  local failed=0

  yarn tests:ios:build >>"$LOG" 2>&1 & pids+=($!)
  yarn tests:macos:build >>"$LOG" 2>&1 & pids+=($!)
  run_android_build_cold & pids+=($!)
  yarn compare:types >>"$LOG" 2>&1 & pids+=($!)
  yarn lint:js >>"$LOG" 2>&1 & pids+=($!)
  yarn lint:ios:check >>"$LOG" 2>&1 & pids+=($!)
  yarn lint:markdown >>"$LOG" 2>&1 & pids+=($!)
  yarn lint:spellcheck >>"$LOG" 2>&1 & pids+=($!)
  yarn tests:jest >>"$LOG" 2>&1 & pids+=($!)

  for pid in "${pids[@]}"; do
    wait "$pid" || failed=1
  done

  return "$failed"
}

extract_failure_hints() {
  grep -nE \
    'IncrementalSplitter|packageDebugAndroidTest FAILED|Caused by|NoSuchFile|OutOfMemory|BUILD FAILED|Command failed' \
    "$LOG" | tail -40 | tee -a "$SUMMARY" || true
}

pass_count=0
fail_count=0

for i in $(seq 1 "$ATTEMPTS"); do
  log ""
  log "=== ATTEMPT $i/$ATTEMPTS $(date -Iseconds) ==="

  if cold_reset && parallel_verify; then
    log "ATTEMPT $i: PASS $(date -Iseconds)"
    pass_count=$((pass_count + 1))
  else
    log "ATTEMPT $i: FAIL $(date -Iseconds)"
    fail_count=$((fail_count + 1))
    extract_failure_hints
  fi
done

log ""
log "=== SUMMARY: $pass_count passed, $fail_count failed (of $ATTEMPTS) ==="
log "Full log: $LOG"
