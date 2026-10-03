#!/bin/bash
# iOS 27 UIScene launch smoke for test-rn-bare (RN CLI fixture).
# Requires a prior yarn test-rn-bare:ios:build in this checkout (ios/ + Release compile graph).
# simctl-only — no Simulator.app / Device Hub.
#
# Probe mode (RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE=1): this script never reads the
# build script's DerivedData (that one holds the Release build, which has no
# embedded JS bundle). It runs its own Debug xcodebuild against the workspace,
# so the app it launches is probe-built only because the preceding probe
# `yarn test-rn-bare:ios:build` left a probe Pods project behind. Probe mode
# therefore (a) asserts that Pods state, (b) builds into its own wiped
# DerivedData (RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA) and launches only from
# there, never from a stale default-DerivedData app, and (c) adds the facade
# load and configure assertions in lib/rn-bare-probe-launch-assertions.sh.
# Flag off keeps the original build, lookup, and assertions unchanged.
set -euo pipefail

cd "$(dirname "$0")/../../.."

REPO_ROOT="$(pwd)"
# shellcheck source=../../../scripts/e2e/lib/ios-simulator-helpers.sh
source "${REPO_ROOT}/scripts/e2e/lib/ios-simulator-helpers.sh"

log() {
  echo "[test-rn-bare-ios-launch-smoke] $*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

# shellcheck source=lib/rn-bare-probe-launch-assertions.sh
source "${REPO_ROOT}/.github/workflows/scripts/lib/rn-bare-probe-launch-assertions.sh"

# Default off: the shipped path is unchanged.
PROBE_DYNAMIC_FIREBASE="${RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE:-0}"

BUNDLE_ID="${RNFB_TEST_RN_BARE_BUNDLE_ID:-com.invertase.testrnbare}"
PROCESS_NAME="${RNFB_TEST_RN_BARE_PROCESS:-testrnbare}"
WORKSPACE="${RNFB_TEST_RN_BARE_WORKSPACE:-test-rn-bare/ios/testrnbare.xcworkspace}"
SCHEME="${RNFB_TEST_RN_BARE_SCHEME:-testrnbare}"
SIM_NAME="${RNFB_TEST_RN_BARE_IOS27_DEVICE:-iPhone 18 Pro}"
METRO_PORT="${RNFB_TEST_RN_BARE_METRO_PORT:-8081}"
METRO_LOG="${RNFB_TEST_RN_BARE_METRO_LOG:-/tmp/test-rn-bare-launch-smoke-metro.log}"
APP_LOG="${RNFB_TEST_RN_BARE_LAUNCH_LOG:-/tmp/test-rn-bare-launch-smoke.log}"
XCODEBUILD_LOG="${RNFB_TEST_RN_BARE_LAUNCH_XCODEBUILD_LOG:-/tmp/test-rn-bare-launch-smoke-xcodebuild.log}"
PODS_PBXPROJ="test-rn-bare/ios/Pods/Pods.xcodeproj/project.pbxproj"
LAUNCH_DERIVED_DATA=""
LOG_LEVEL="default"
if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  LAUNCH_DERIVED_DATA="${RNFB_TEST_RN_BARE_LAUNCH_DERIVED_DATA:-/tmp/test-rn-bare-launch-derived-data-dynamic-firebase}"
  # FirebaseCore's configure marker is a debug-level log.
  LOG_LEVEL="debug"
fi

if [[ ! -d "$WORKSPACE" ]]; then
  fail "missing ${WORKSPACE} — run yarn test-rn-bare:ios:build first"
fi

# Set once the log stream is started; cleanup() reaps it so a failure between
# the stream start and the normal kill (e.g. simctl launch under set -e) does
# not leave `log stream` running.
LOG_PID=""

cleanup() {
  local udid="$1"
  local metro_pid="$2"
  xcrun simctl terminate "$udid" "$BUNDLE_ID" 2>/dev/null || true
  if [[ -n "${LOG_PID:-}" ]]; then
    kill "$LOG_PID" 2>/dev/null || true
    wait "$LOG_PID" 2>/dev/null || true
    LOG_PID=""
  fi
  if [[ -n "$metro_pid" ]]; then
    kill "$metro_pid" 2>/dev/null || true
  fi
  lsof -ti:"$METRO_PORT" | xargs kill -9 2>/dev/null || true
}

if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  log "probe mode ON (RNFB_TEST_RN_BARE_DYNAMIC_FIREBASE=1)"
  rnfb_probe_launch_assert_probe_pods "$PODS_PBXPROJ"
  if [[ -z "$LAUNCH_DERIVED_DATA" || "$LAUNCH_DERIVED_DATA" == "/" ]]; then
    fail "refusing to delete launch DerivedData path '${LAUNCH_DERIVED_DATA}'"
  fi
  # Same rule as the probe build: a surviving /tmp path from another checkout
  # is not evidence for this one.
  rm -rf "$LAUNCH_DERIVED_DATA"
  log "removed launch DerivedData at ${LAUNCH_DERIVED_DATA} before xcodebuild"
fi

UDID="$(rnfb_ensure_ios_simulator_udid "$SIM_NAME")"
log "simulator udid=${UDID} name=\"${SIM_NAME}\" runtime=$(rnfb_ios_sim_runtime_label)"

lsof -ti:"$METRO_PORT" | xargs kill -9 2>/dev/null || true
: >"$METRO_LOG"
(
  cd test-rn-bare
  RCT_METRO_PORT="$METRO_PORT" CI=1 yarn start --port "$METRO_PORT" >>"$METRO_LOG" 2>&1
) &
METRO_PID=$!
trap 'cleanup "$UDID" "$METRO_PID"' EXIT

metro_ready=0
for _ in $(seq 1 120); do
  if curl -sf "http://127.0.0.1:${METRO_PORT}/status" | grep -q 'packager-status:running'; then
    metro_ready=1
    break
  fi
  if ! kill -0 "$METRO_PID" 2>/dev/null; then
    tail -40 "$METRO_LOG" >&2
    fail "Metro exited before becoming ready"
  fi
  sleep 1
done
[[ "$metro_ready" -eq 1 ]] || fail "Metro did not become ready on :${METRO_PORT}"

HOST_ARCH="$(uname -m)"
xcrun simctl boot "$UDID" 2>/dev/null || true
xcrun simctl bootstatus "$UDID" -b >/dev/null

log "xcodebuild Debug (simulator ${UDID}, log: ${XCODEBUILD_LOG})"
derived_data_args=()
if [[ -n "$LAUNCH_DERIVED_DATA" ]]; then
  derived_data_args=(-derivedDataPath "$LAUNCH_DERIVED_DATA")
fi
set +e
xcodebuild \
  ARCHS="$HOST_ARCH" \
  ONLY_ACTIVE_ARCH=YES \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  ${derived_data_args[@]+"${derived_data_args[@]}"} \
  -configuration Debug \
  -destination "id=${UDID}" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  build 2>&1 | tee "$XCODEBUILD_LOG"
xcodebuild_status=${PIPESTATUS[0]}
set -e
[[ "$xcodebuild_status" -eq 0 ]] || fail "xcodebuild Debug failed (exit ${xcodebuild_status})"

if [[ -n "$LAUNCH_DERIVED_DATA" ]]; then
  APP="$(
    find "${LAUNCH_DERIVED_DATA}/Build/Products/Debug-iphonesimulator" \
      -maxdepth 1 -name '*.app' 2>/dev/null | head -1
  )"
  [[ -n "$APP" && -d "$APP" ]] || fail "could not find Debug-iphonesimulator .app under ${LAUNCH_DERIVED_DATA}"
  rnfb_probe_launch_assert_framework_embedded "$APP"
  rnfb_probe_launch_assert_facade_referenced "$APP"
else
  APP="$(
    find "${HOME}/Library/Developer/Xcode/DerivedData"/testrnbare-*/Build/Products/Debug-iphonesimulator \
      -maxdepth 1 -name '*.app' 2>/dev/null | head -1
  )"
  [[ -n "$APP" && -d "$APP" ]] || fail "could not find Debug-iphonesimulator .app under DerivedData/testrnbare-*"
fi

xcrun simctl install "$UDID" "$APP"

: >"$APP_LOG"
xcrun simctl spawn "$UDID" log stream --level "$LOG_LEVEL" --style compact \
  --predicate "process == \"${PROCESS_NAME}\" OR subsystem == \"com.apple.runtime-issues\" OR eventMessage CONTAINS[c] \"EvaluateRuntimeIssueForNoSceneLifecycleAdoption\"" \
  >>"$APP_LOG" 2>&1 &
LOG_PID=$!
if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  # The configure marker is the first thing the probe checks, and a fixed sleep
  # can miss it on a cold simulator. `log stream` prints its "Filtering the log
  # data using" header once it is attached, so wait for that (up to ~10 s).
  log_stream_ready=0
  for _ in $(seq 1 20); do
    if grep -Fq 'Filtering the log data using' "$APP_LOG"; then
      log_stream_ready=1
      break
    fi
    if ! kill -0 "$LOG_PID" 2>/dev/null; then
      break
    fi
    sleep 0.5
  done
  if [[ "$log_stream_ready" -ne 1 ]]; then
    fail "log stream never reported ready within 10 s (no 'Filtering the log data using' header in ${APP_LOG}); the configure marker could be missed"
  fi
else
  sleep 1
fi

xcrun simctl terminate "$UDID" "$BUNDLE_ID" 2>/dev/null || true
APP_PID=""
if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  # -FIRDebugEnabled turns on FirebaseCore debug logging (the configure marker).
  # simctl prints "<bundle id>: <pid>".
  launch_output="$(xcrun simctl launch "$UDID" "$BUNDLE_ID" -FIRDebugEnabled)"
  APP_PID="${launch_output##*: }"
else
  xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null
fi

sleep 10
if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  # Map the images while the app is still running. Asserted below.
  rnfb_probe_launch_capture_loaded_images "$APP_PID"
fi
kill "$LOG_PID" 2>/dev/null || true
wait "$LOG_PID" 2>/dev/null || true
LOG_PID=""

scene_ips="$(
  grep -Ei 'UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption|NoSceneLifecycleAdoption' "$APP_LOG" \
    | grep -Ev '^Filtering the log data using' \
    || true
)"
if [[ -n "$scene_ips" ]]; then
  fail "scene lifecycle runtime issue detected — see ${APP_LOG}"
fi
if ! grep -Fq 'Window did become application key' "$APP_LOG"; then
  firebase_hint="$(
    grep -Ei 'Firebase|FIRApp|GOOGLE_APP_ID|FirebaseApp\.configure|Configuration fails|terminated due to signal|abort\(\)' "$APP_LOG" \
      | grep -Ev '^Filtering the log data using' \
      | tail -8 \
      || true
  )"
  if [[ -n "$firebase_hint" ]]; then
    fail "app window never became key (Firebase/init crash likely) — log excerpt: ${firebase_hint} — full log: ${APP_LOG}"
  fi
  fail "app window never became key — see ${APP_LOG}"
fi
if ! grep -Fq "sceneOfRecord: sceneID: sceneID:${BUNDLE_ID}-default" "$APP_LOG"; then
  fail "expected single-scene sceneOfRecord not observed — see ${APP_LOG}"
fi

if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  log "--- dynamic probe launch checks ---"
  rnfb_probe_launch_assert_framework_loaded
  rnfb_probe_launch_assert_configure_logged "$APP_LOG"
fi

xcrun simctl terminate "$UDID" "$BUNDLE_ID"
if [[ "$PROBE_DYNAMIC_FIREBASE" == "1" ]]; then
  log "PASS: iOS 27 sim launch smoke, dynamic probe (foreground scene, RNFBFirebase.framework embedded and loaded, FirebaseCore configure ran)"
else
  log "PASS: iOS 27 sim launch smoke (foreground scene, no UIScene runtime issue)"
fi
