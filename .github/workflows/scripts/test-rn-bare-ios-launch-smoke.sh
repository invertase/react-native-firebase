#!/bin/bash
# iOS 27 UIScene launch smoke for test-rn-bare (RN CLI fixture).
# Requires a prior yarn test-rn-bare:ios:build in this checkout (ios/ + Release compile graph).
# simctl-only — no Simulator.app / Device Hub.
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

BUNDLE_ID="${RNFB_TEST_RN_BARE_BUNDLE_ID:-com.invertase.testrnbare}"
PROCESS_NAME="${RNFB_TEST_RN_BARE_PROCESS:-testrnbare}"
WORKSPACE="${RNFB_TEST_RN_BARE_WORKSPACE:-test-rn-bare/ios/testrnbare.xcworkspace}"
SCHEME="${RNFB_TEST_RN_BARE_SCHEME:-testrnbare}"
SIM_NAME="${RNFB_TEST_RN_BARE_IOS27_DEVICE:-iPhone 18 Pro}"
METRO_PORT="${RNFB_TEST_RN_BARE_METRO_PORT:-8081}"
METRO_LOG="${RNFB_TEST_RN_BARE_METRO_LOG:-/tmp/test-rn-bare-launch-smoke-metro.log}"
APP_LOG="${RNFB_TEST_RN_BARE_LAUNCH_LOG:-/tmp/test-rn-bare-launch-smoke.log}"
XCODEBUILD_LOG="${RNFB_TEST_RN_BARE_LAUNCH_XCODEBUILD_LOG:-/tmp/test-rn-bare-launch-smoke-xcodebuild.log}"

if [[ ! -d "$WORKSPACE" ]]; then
  fail "missing ${WORKSPACE} — run yarn test-rn-bare:ios:build first"
fi

cleanup() {
  local udid="$1"
  local metro_pid="$2"
  xcrun simctl terminate "$udid" "$BUNDLE_ID" 2>/dev/null || true
  if [[ -n "$metro_pid" ]]; then
    kill "$metro_pid" 2>/dev/null || true
  fi
  lsof -ti:"$METRO_PORT" | xargs kill -9 2>/dev/null || true
}

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
set +e
xcodebuild \
  ARCHS="$HOST_ARCH" \
  ONLY_ACTIVE_ARCH=YES \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Debug \
  -destination "id=${UDID}" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  build 2>&1 | tee "$XCODEBUILD_LOG"
xcodebuild_status=${PIPESTATUS[0]}
set -e
[[ "$xcodebuild_status" -eq 0 ]] || fail "xcodebuild Debug failed (exit ${xcodebuild_status})"

APP="$(
  find "${HOME}/Library/Developer/Xcode/DerivedData"/testrnbare-*/Build/Products/Debug-iphonesimulator \
    -maxdepth 1 -name '*.app' 2>/dev/null | head -1
)"
[[ -n "$APP" && -d "$APP" ]] || fail "could not find Debug-iphonesimulator .app under DerivedData/testrnbare-*"

xcrun simctl install "$UDID" "$APP"

: >"$APP_LOG"
xcrun simctl spawn "$UDID" log stream --level default --style compact \
  --predicate "process == \"${PROCESS_NAME}\" OR subsystem == \"com.apple.runtime-issues\" OR eventMessage CONTAINS[c] \"EvaluateRuntimeIssueForNoSceneLifecycleAdoption\"" \
  >>"$APP_LOG" 2>&1 &
LOG_PID=$!
sleep 1

xcrun simctl terminate "$UDID" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null

sleep 10
kill "$LOG_PID" 2>/dev/null || true
wait "$LOG_PID" 2>/dev/null || true

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

xcrun simctl terminate "$UDID" "$BUNDLE_ID"
log "PASS: iOS 27 sim launch smoke (foreground scene, no UIScene runtime issue)"
