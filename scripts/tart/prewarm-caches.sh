#!/usr/bin/env bash
# Run inside a golden Tart VM: clone origin/main and populate natural cache paths.
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

RNFB_REPO_URL="${RNFB_REPO_URL:-https://github.com/invertase/react-native-firebase.git}"
RNFB_MAIN_REF="${RNFB_MAIN_REF:-main}"

TART_SCRIPTS="${RNFB_TART_SCRIPTS_MOUNT:-/Volumes/My Shared Files/tart-scripts}"
HOST_MANIFEST_DIR="${RNFB_HOST_MANIFEST_DIR:-${TART_SCRIPTS}/manifests}"

echo "[prewarm] repo=${RNFB_REPO_URL} ref=${RNFB_MAIN_REF}"
echo "[prewarm] YARN_CACHE_FOLDER=${YARN_CACHE_FOLDER}"

mkdir -p "$YARN_CACHE_FOLDER" "$RNFB_DETOX_CACHE" "$RNFB_METRO_CACHE" \
  "$RNFB_FIREBASE_EMULATORS" "$RNFB_CCACHE_DIR" "$RNFB_TART_MANIFEST_DIR"

if [[ -d "${RNFB_TART_PREWARM_DIR}/.git" ]]; then
  rm -rf "${RNFB_TART_PREWARM_DIR}"
fi

git clone --depth 50 --branch "${RNFB_MAIN_REF}" "${RNFB_REPO_URL}" "${RNFB_TART_PREWARM_DIR}"
cd "${RNFB_TART_PREWARM_DIR}"

MAIN_SHA="$(git rev-parse HEAD)"
YARN_LOCK_SHA="$(shasum -a 256 yarn.lock | awk '{print $1}')"
PODFILE_LOCK_SHA="$(shasum -a 256 tests/ios/Podfile.lock | awk '{print $1}')"

rnfb_tart_init_brew
rnfb_tart_init_cocoapods
rnfb_tart_init_brew_utils "${TART_SCRIPTS}"
rnfb_tart_enable_ccache
rnfb_tart_start_yeetd

CCACHE_STATS_FILE="ccache-stats.txt"
export RNFB_CCACHE_STATS_FILE="$CCACHE_STATS_FILE"
: > "$CCACHE_STATS_FILE"

echo "[prewarm] yarn install..."
yarn

echo "[prewarm] pod install..."
yarn tests:ios:pod:install

echo "[prewarm] debug build (SKIP_BUNDLING=1)..."
rnfb_tart_capture_ccache_stats "before prewarm debug build"
export SKIP_BUNDLING=1
export RCT_NO_LAUNCH_PACKAGER=1
yarn tests:ios:build
rnfb_tart_capture_ccache_stats "after prewarm debug build"
if [[ -f ccache-stats.txt ]]; then
  cp ccache-stats.txt "${RNFB_TART_MANIFEST_DIR}/prewarm-ccache-stats.txt"
fi

echo "[prewarm] firebase emulators..."
yarn tests:emulator:start-ci

echo "[prewarm] metro bundle prefetch..."
nohup yarn tests:packager:jet-ci > /tmp/metro-prewarm.log 2>&1 &
until curl --output /dev/null --silent --head --fail http://localhost:8081/status; do
  sleep 2
done
curl --output /dev/null --silent --head --fail \
  "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false&inlineSourceMap=true"
pkill -f "tests:packager:jet-ci" 2>/dev/null || true

WARMED_MANIFEST="${RNFB_TART_MANIFEST_DIR}/warmed-main.json"
python3 - <<PY
import json, datetime, os

manifest = {
    "prewarmed_at": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
    "main_commit": "${MAIN_SHA}",
    "main_ref": "${RNFB_MAIN_REF}",
    "repo_url": "${RNFB_REPO_URL}",
    "yarn_lock_sha256": "${YARN_LOCK_SHA}",
    "podfile_lock_sha256": "${PODFILE_LOCK_SHA}",
    "build_mode": "debug",
    "yarn_cache_folder": os.environ["YARN_CACHE_FOLDER"],
    "cache_paths": {
        "detox": os.environ["RNFB_DETOX_CACHE"],
        "metro": os.environ["RNFB_METRO_CACHE"],
        "firebase_emulators": os.environ["RNFB_FIREBASE_EMULATORS"],
        "ccache": os.environ["RNFB_CCACHE_DIR"],
        "cocoa_pods_downloads": os.environ["RNFB_COCOA_PODS_CACHE"],
    },
}
with open("${WARMED_MANIFEST}", "w") as f:
    json.dump(manifest, f, indent=2)
    f.write("\n")
print("[prewarm] wrote ${WARMED_MANIFEST}")
PY

if [[ -d "$HOST_MANIFEST_DIR" && -w "$HOST_MANIFEST_DIR" ]]; then
  cp "${WARMED_MANIFEST}" "${HOST_MANIFEST_DIR}/warmed-main.json" 2>/dev/null || true
fi

echo "[prewarm] complete commit=${MAIN_SHA:0:12}"
python3 - <<PY
import json, datetime
doc = {
    "finished_at": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
    "main_commit": "${MAIN_SHA}",
    "rc": 0,
}
with open("${RNFB_TART_MANIFEST_DIR}/prewarm-complete.json", "w") as f:
    json.dump(doc, f, indent=2)
    f.write("\n")
PY
