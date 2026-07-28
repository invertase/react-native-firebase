#!/usr/bin/env bash
# Inside VM: one iOS e2e iteration on the mounted worktree (mirrors CI job body).
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

RNFB_VIRTIOFS_ROOT="${RNFB_REPO_ROOT:-${RNFB_TART_WORKTREE_MOUNT}}"
BUILD_MODE="${RNFB_BUILD_MODE:-debug}"
RUN_ID="${RNFB_RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)-${BUILD_MODE}}"
ITERATION="${RNFB_ITERATION:-0}"
export RNFB_HEADLESS_SIMULATOR="${RNFB_HEADLESS_SIMULATOR:-1}"
export RNFB_BUILD_MODE="$BUILD_MODE"
export RNFB_RUN_ID="$RUN_ID"
export RNFB_ITERATION="$ITERATION"

TART_LIB="${RNFB_TART_SCRIPTS_MOUNT}/lib"
TART_SCRIPTS="${RNFB_TART_SCRIPTS_MOUNT}"

rnfb_tart_materialize_worktree "$RNFB_VIRTIOFS_ROOT"
RNFB_REPO_ROOT="$RNFB_LOCAL_REPO"
rnfb_tart_clean_stale_ios_build "$RNFB_REPO_ROOT"
ARTIFACT_RUN_DIR="$(rnfb_tart_artifact_run_dir "$RUN_ID" "$ITERATION")"
ARTIFACTS_DIR="${RNFB_REPO_ROOT}/scripts/tart/artifacts/${ARTIFACT_RUN_DIR}"
ARTIFACTS_VIRTIOFS="${RNFB_VIRTIOFS_ROOT}/scripts/tart/artifacts/${ARTIFACT_RUN_DIR}"

if [[ ! -d "${RNFB_REPO_ROOT}/.git" && ! -f "${RNFB_REPO_ROOT}/package.json" ]]; then
  echo "error: worktree not materialized at ${RNFB_REPO_ROOT}" >&2
  exit 1
fi

mkdir -p "$ARTIFACTS_DIR"
ITERATION_LOG="${ARTIFACTS_DIR}/run-iteration.log"
: >"$ITERATION_LOG"
exec >>"$ITERATION_LOG" 2>&1

rnfb_tart_on_iteration_exit() {
  local rc=$?
  if [[ ! -f "${ARTIFACTS_DIR}/iteration-complete.json" ]]; then
    rnfb_tart_write_iteration_complete "$ARTIFACT_RUN_DIR" "$rc" "$ARTIFACTS_DIR" || true
    rnfb_tart_sync_artifacts_essential_to_virtiofs \
      "$RNFB_VIRTIOFS_ROOT" "$RNFB_REPO_ROOT" "$ARTIFACT_RUN_DIR" || true
  fi
  exit "$rc"
}
trap rnfb_tart_on_iteration_exit EXIT

cd "$RNFB_REPO_ROOT"

CCACHE_STATS_FILE="ccache-stats.txt"
export RNFB_CCACHE_STATS_FILE="$CCACHE_STATS_FILE"
: > "$CCACHE_STATS_FILE"

echo "[iteration] repo=${RNFB_REPO_ROOT} mode=${BUILD_MODE} run=${RUN_ID} iter=${ITERATION} headless_sim=${RNFB_HEADLESS_SIMULATOR}"
echo "[iteration] YARN_CACHE_FOLDER=${YARN_CACHE_FOLDER} CCACHE_DIR=${CCACHE_DIR}"

rnfb_tart_sanitize_git_env
rnfb_tart_hydrate_ai_mocks_from_prewarm "$RNFB_REPO_ROOT"
rnfb_tart_init_brew
rnfb_tart_init_cocoapods
rnfb_tart_init_brew_utils "${TART_SCRIPTS}"
rnfb_tart_enable_ccache
rnfb_tart_start_yeetd

rnfb_tart_write_iteration_env iteration-env.txt "$RNFB_REPO_ROOT"
rnfb_tart_capture_ccache_stats "after toolchain init"

echo "[iteration] yarn install..."
GITFILE_BACKUP=""
if [[ -f .git ]]; then
  GITFILE_BACKUP="$(mktemp)"
  mv .git "$GITFILE_BACKUP"
fi
yarn
if [[ -n "$GITFILE_BACKUP" ]]; then
  mv "$GITFILE_BACKUP" .git
fi
rnfb_tart_capture_ccache_stats "after yarn install"

echo "[iteration] pod install..."
yarn tests:ios:pod:install
rnfb_tart_capture_ccache_stats "after pod install"

echo "[iteration] start firestore emulator..."
yarn tests:emulator:start-ci

if [[ "$BUILD_MODE" == "debug" ]]; then
  echo "[iteration] debug build..."
  rnfb_tart_capture_ccache_stats "before debug build"
  BUILD_START_EPOCH="$(date -u +%s)"
  export SKIP_BUNDLING=1
  export RCT_NO_LAUNCH_PACKAGER=1
  yarn tests:ios:build
  BUILD_END_EPOCH="$(date -u +%s)"
  echo "debug_build_duration_sec=$((BUILD_END_EPOCH - BUILD_START_EPOCH))" >> iteration-env.txt
  rnfb_tart_capture_ccache_stats "after debug build"

  echo "[iteration] metro prefetch..."
  nohup yarn tests:packager:jet-ci > metro.log 2>&1 &
  until curl --output /dev/null --silent --head --fail http://localhost:8081/status; do
    sleep 2
  done
  curl --output /dev/null --silent --head --fail \
    "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false&inlineSourceMap=true"
elif [[ "$BUILD_MODE" == "release" ]]; then
  echo "[iteration] release build..."
  rnfb_tart_capture_ccache_stats "before release build"
  BUILD_START_EPOCH="$(date -u +%s)"
  export RCT_NO_LAUNCH_PACKAGER=1
  yarn tests:ios:build:release
  BUILD_END_EPOCH="$(date -u +%s)"
  echo "release_build_duration_sec=$((BUILD_END_EPOCH - BUILD_START_EPOCH))" >> iteration-env.txt
  rnfb_tart_capture_ccache_stats "after release build"
else
  echo "error: unknown BUILD_MODE=${BUILD_MODE} (debug|release)" >&2
  exit 1
fi

echo "[iteration] cold simulator boot..."
export RNFB_REPO_ROOT
bash "${TART_LIB}/boot-simulator.sh"

echo "[iteration] log streams + resource monitor..."
nohup sh -c "xcrun simctl io booted recordVideo --codec=h264 -f simulator.mp4 2>&1 &"
nohup sh -c "xcrun simctl spawn booted log stream --level debug --style compact > simulator.log 2>&1 &"
nohup sh -c "xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == \"testing\"' > testing.log 2>&1 &"
nohup sh -c "xcrun simctl spawn booted log stream --level debug --style compact --predicate 'process == \"SpringBoard\" AND eventMessage CONTAINS \"invertase\"' > springboard-invertase.log 2>&1 &"
nohup bash "${TART_LIB}/resource-monitor.sh" >>resource-monitor.log 2>&1 &

set +e
if [[ "$BUILD_MODE" == "debug" ]]; then
  yarn tests:ios:test-cover 2>&1 | tee detox-step.log
  test_rc=${PIPESTATUS[0]}
  yarn tests:ios:test:process-coverage >/dev/null 2>&1 || true
else
  yarn tests:ios:test:release 2>&1 | tee detox-step.log
  test_rc=${PIPESTATUS[0]}
fi
set -e

killall -int simctl 2>/dev/null || true
pkill -f resource-monitor.sh 2>/dev/null || true

RNFB_DETOX_LOG=detox-step.log RNFB_LOG_DIR=. RNFB_FLAKE_SUMMARY_OUT=flake-summary.txt \
  bash "${TART_LIB}/flake-summary.sh"

mkdir -p "${ARTIFACTS_DIR}"
echo "[iteration] collecting artifacts → ${ARTIFACTS_VIRTIOFS}"
echo "test_rc=${test_rc}" >> iteration-env.txt
rnfb_tart_capture_ccache_stats "after tests"

for f in detox-step.log simulator.log testing.log springboard-invertase.log \
  resource-monitor.log metro.log flake-summary.txt simulator.mp4 xcodebuild-raw.log \
  ccache-stats.txt iteration-env.txt; do
  [[ -f "$f" ]] && cp "$f" "${ARTIFACTS_DIR}/" || true
done

rnfb_tart_write_iteration_complete "$ARTIFACT_RUN_DIR" "$test_rc" "$ARTIFACTS_DIR"
rnfb_tart_sync_artifacts_essential_to_virtiofs "$RNFB_VIRTIOFS_ROOT" "$RNFB_REPO_ROOT" "$ARTIFACT_RUN_DIR"

echo "[iteration] finished rc=${test_rc} artifacts=${ARTIFACTS_VIRTIOFS}"
exit "$test_rc"
