#!/bin/bash
# iOS 27 UIScene launch smoke for test-expo (Expo 58 dev-client fixture).
# Requires a prior yarn test-expo:ios:link in this checkout (ios/ generated).
# simctl-only — no Simulator.app / Device Hub.
set -euo pipefail

cd "$(dirname "$0")/../../.."
cd test-expo

log() {
  echo "[test-expo-ios-launch-smoke] $*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

BUNDLE_ID="${RNFB_TEST_EXPO_BUNDLE_ID:-io.invertase.testing}"
SCHEME_URL="${RNFB_TEST_EXPO_SCHEME:-testexpo}"
WORKSPACE="${RNFB_TEST_EXPO_WORKSPACE:-ios/testexpo.xcworkspace}"
XCODE_SCHEME="${RNFB_TEST_EXPO_XCODE_SCHEME:-testexpo}"
SIM_NAME="${RNFB_TEST_EXPO_IOS27_DEVICE:-iPhone 18 Pro}"
SIM_RUNTIME="${RNFB_TEST_EXPO_IOS27_RUNTIME:-iOS 27.0}"
METRO_PORT="${RNFB_TEST_EXPO_METRO_PORT:-8081}"
METRO_LOG="${RNFB_TEST_EXPO_METRO_LOG:-/tmp/test-expo-launch-smoke-metro.log}"
APP_LOG="${RNFB_TEST_EXPO_LAUNCH_LOG:-/tmp/test-expo-launch-smoke.log}"
XCODEBUILD_LOG="${RNFB_TEST_EXPO_LAUNCH_XCODEBUILD_LOG:-/tmp/test-expo-launch-smoke-xcodebuild.log}"

if [[ ! -d "$WORKSPACE" ]]; then
  fail "missing ${WORKSPACE} — run yarn test-expo:ios:link first"
fi

resolve_sim_udid() {
  local line udid
  line="$(
    xcrun simctl list devices available 2>/dev/null \
      | awk -v device="$SIM_NAME" -v runtime="$SIM_RUNTIME" '
          $0 ~ "-- " runtime " --" { in_runtime = 1; next }
          in_runtime && /^-- / { in_runtime = 0 }
          in_runtime && index($0, device " (") { print; exit }
        '
  )"
  [[ -n "$line" ]] || fail "no available simulator named \"${SIM_NAME}\" on runtime ${SIM_RUNTIME}"
  udid="$(sed -E 's/.*\(([A-F0-9-]+)\).*/\1/' <<<"$line")"
  [[ -n "$udid" ]] || fail "could not parse UDID from simulator line: ${line}"
  echo "$udid"
}

cleanup() {
  local udid="$1"
  local metro_pid="$2"
  xcrun simctl terminate "$udid" "$BUNDLE_ID" 2>/dev/null || true
  if [[ -n "$metro_pid" ]]; then
    kill "$metro_pid" 2>/dev/null || true
  fi
  lsof -ti:"$METRO_PORT" | xargs kill -9 2>/dev/null || true
}

UDID="$(resolve_sim_udid)"
log "simulator udid=${UDID} name=\"${SIM_NAME}\" runtime=${SIM_RUNTIME}"

lsof -ti:"$METRO_PORT" | xargs kill -9 2>/dev/null || true
: >"$METRO_LOG"
CI=1 npx expo start --dev-client --port "$METRO_PORT" --localhost >>"$METRO_LOG" 2>&1 &
METRO_PID=$!
trap 'cleanup "$UDID" "$METRO_PID"' EXIT

metro_ready=0
for _ in $(seq 1 120); do
  if curl -sf "http://localhost:${METRO_PORT}/status" | grep -q 'packager-status:running'; then
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
# Cap compile time: prior CI run sat silent after ~18m of xcodebuild env spam until the
# 60m job timeout. Prefer GNU timeout when present; otherwise perl alarm.
XCODEBUILD_TIMEOUT_SEC="${RNFB_TEST_EXPO_XCODEBUILD_TIMEOUT_SEC:-2400}"
set +e
if command -v gtimeout >/dev/null 2>&1; then
  gtimeout "$XCODEBUILD_TIMEOUT_SEC" xcodebuild \
    ARCHS="$HOST_ARCH" \
    ONLY_ACTIVE_ARCH=YES \
    -workspace "$WORKSPACE" \
    -scheme "$XCODE_SCHEME" \
    -configuration Debug \
    -destination "id=${UDID}" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGN_IDENTITY="" \
    build 2>&1 | tee "$XCODEBUILD_LOG"
  xcodebuild_status=${PIPESTATUS[0]}
elif command -v timeout >/dev/null 2>&1; then
  timeout "$XCODEBUILD_TIMEOUT_SEC" xcodebuild \
    ARCHS="$HOST_ARCH" \
    ONLY_ACTIVE_ARCH=YES \
    -workspace "$WORKSPACE" \
    -scheme "$XCODE_SCHEME" \
    -configuration Debug \
    -destination "id=${UDID}" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGN_IDENTITY="" \
    build 2>&1 | tee "$XCODEBUILD_LOG"
  xcodebuild_status=${PIPESTATUS[0]}
else
  perl -e 'alarm shift; exec @ARGV' "$XCODEBUILD_TIMEOUT_SEC" \
    xcodebuild \
    ARCHS="$HOST_ARCH" \
    ONLY_ACTIVE_ARCH=YES \
    -workspace "$WORKSPACE" \
    -scheme "$XCODE_SCHEME" \
    -configuration Debug \
    -destination "id=${UDID}" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGN_IDENTITY="" \
    build 2>&1 | tee "$XCODEBUILD_LOG"
  xcodebuild_status=${PIPESTATUS[0]}
fi
set -e
if [[ "$xcodebuild_status" -eq 124 || "$xcodebuild_status" -eq 142 ]]; then
  fail "xcodebuild Debug timed out after ${XCODEBUILD_TIMEOUT_SEC}s (log: ${XCODEBUILD_LOG})"
fi
[[ "$xcodebuild_status" -eq 0 ]] || fail "xcodebuild Debug failed (exit ${xcodebuild_status})"

APP="$(
  find "${HOME}/Library/Developer/Xcode/DerivedData"/testexpo-*/Build/Products/Debug-iphonesimulator \
    -maxdepth 1 -name '*.app' 2>/dev/null | head -1
)"
[[ -n "$APP" && -d "$APP" ]] || fail "could not find Debug-iphonesimulator .app under DerivedData/testexpo-*"

xcrun simctl install "$UDID" "$APP"

: >"$APP_LOG"
xcrun simctl spawn "$UDID" log stream --level default --style compact \
  --predicate 'process == "testexpo" OR subsystem == "com.apple.runtime-issues" OR eventMessage CONTAINS[c] "EvaluateRuntimeIssueForNoSceneLifecycleAdoption"' \
  >>"$APP_LOG" 2>&1 &
LOG_PID=$!
sleep 1

metro_lines_before="$(wc -l <"$METRO_LOG" | tr -d ' ')"
xcrun simctl terminate "$UDID" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl launch "$UDID" "$BUNDLE_ID" >/dev/null
ENC_URL="$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=""))' "http://127.0.0.1:${METRO_PORT}")"
xcrun simctl openurl "$UDID" "${SCHEME_URL}://expo-development-client/?url=${ENC_URL}"

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
  fail "app window never became key — see ${APP_LOG}"
fi
if ! grep -Fq 'sceneOfRecord: sceneID: sceneID:io.invertase.testing-default' "$APP_LOG"; then
  fail "expected single-scene sceneOfRecord not observed — see ${APP_LOG}"
fi

log "prefetch iOS JS bundle from Metro (root UI entry)"
bundle_tmp="$(mktemp)"
if ! curl -sf "http://localhost:${METRO_PORT}/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true&minify=false" -o "$bundle_tmp"; then
  rm -f "$bundle_tmp"
  fail "Metro did not serve the iOS bundle for test-expo"
fi
if ! [[ -s "$bundle_tmp" ]]; then
  rm -f "$bundle_tmp"
  fail "Metro returned an empty iOS bundle"
fi
rm -f "$bundle_tmp"
if ! tail -n +"$((metro_lines_before + 1))" "$METRO_LOG" | grep -q 'iOS Bundled'; then
  log "note: dev-client did not pull bundle in-sim during the wait; host prefetch succeeded"
fi

xcrun simctl terminate "$UDID" "$BUNDLE_ID"
log "PASS: iOS 27 sim launch smoke (foreground scene, no UIScene runtime issue, Metro root bundle ready)"
