#!/usr/bin/env bash
# Run inside a seed Tart VM once to produce the golden toolchain layer.
set -euo pipefail

# shellcheck source=lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

TART_SCRIPTS="${RNFB_TART_SCRIPTS_MOUNT:-/Volumes/My Shared Files/tart-scripts}"
if [[ -f "${TART_SCRIPTS}/manifests/golden-expected.json" ]]; then
  EXPECTED="${TART_SCRIPTS}/manifests/golden-expected.json"
else
  EXPECTED="${RNFB_TART_ROOT}/manifests/golden-expected.json"
fi

SEED_IMAGE="$(rnfb_tart_read_manifest_field "$EXPECTED" tart_seed_image)"
NODE_MAJOR="$(rnfb_tart_read_manifest_field "$EXPECTED" node_major)"
JAVA_VERSION="$(rnfb_tart_read_manifest_field "$EXPECTED" java_version)"
CCACHE_MAX="$(rnfb_tart_read_manifest_field "$EXPECTED" ccache_max_size)"

export SEED_IMAGE NODE_MAJOR JAVA_VERSION CCACHE_MAX

echo "[provision] seed=${SEED_IMAGE} node=${NODE_MAJOR} java=${JAVA_VERSION}"

rnfb_tart_init_brew

mkdir -p "$RNFB_TART_MANIFEST_DIR" "$YARN_CACHE_FOLDER" "$RNFB_DETOX_CACHE" \
  "$RNFB_METRO_CACHE" "$RNFB_FIREBASE_EMULATORS" "$RNFB_CCACHE_DIR"

# Xcode pin comes from the Cirrus seed image.
xcodebuild -version | tee /tmp/xcode-version.txt
xcrun simctl list >/dev/null

export HOMEBREW_NO_AUTO_UPDATE=1

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q "^v${NODE_MAJOR}\\."; then
  brew install "node@${NODE_MAJOR}"
  brew link --overwrite --force "node@${NODE_MAJOR}"
fi

if ! /usr/libexec/java_home -v "${JAVA_VERSION}" >/dev/null 2>&1; then
  brew install --cask "temurin@${JAVA_VERSION}"
fi
export JAVA_HOME="$(/usr/libexec/java_home -v "${JAVA_VERSION}")"
export PATH="${JAVA_HOME}/bin:${PATH}"

if ! ruby -e "exit(Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('3.0.0') ? 0 : 1)"; then
  brew install ruby@3
  export PATH="$(brew --prefix ruby@3)/bin:${PATH}"
fi
rnfb_tart_init_ruby_path
gem update --system >/dev/null 2>&1 || true
gem update cocoapods xcodeproj
if ! command -v pod >/dev/null 2>&1; then
  brew install cocoapods
fi

brew install ccache jq wget git
rnfb_tart_enable_ccache

if ! command -v yeetd >/dev/null 2>&1; then
  wget -q https://github.com/biscuitehh/yeetd/releases/download/1.0/yeetd-normal.pkg -O /tmp/yeetd-normal.pkg
  sudo installer -pkg /tmp/yeetd-normal.pkg -target /
fi
rnfb_tart_start_yeetd

bash "${TART_SCRIPTS}/lib/install-homebrew-utils.sh" applesimutils xcbeautify

MANIFEST="${RNFB_TART_MANIFEST_DIR}/golden-manifest.json"
python3 - <<'PY'
import json, subprocess, datetime, os

def sh(cmd):
    return subprocess.check_output(cmd, shell=True, text=True).strip()

manifest = {
    "baked_at": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
    "seed_image": os.environ["SEED_IMAGE"],
    "xcode_version": sh("xcodebuild -version | head -1 | awk '{print $2}'"),
    "node_version": sh("node -v"),
    "java_version": sh("java -version 2>&1 | head -1"),
    "ruby_version": sh("ruby -v"),
    "ccache_max_size": os.environ["CCACHE_MAX"],
    "yarn_cache_folder": os.environ["YARN_CACHE_FOLDER"],
    "cache_paths": {
        "detox": os.environ["RNFB_DETOX_CACHE"],
        "metro": os.environ["RNFB_METRO_CACHE"],
        "firebase_emulators": os.environ["RNFB_FIREBASE_EMULATORS"],
        "ccache": os.environ["RNFB_CCACHE_DIR"],
        "cocoa_pods_downloads": os.environ["RNFB_COCOA_PODS_CACHE"],
    },
}
manifest_path = os.path.join(os.environ["RNFB_TART_MANIFEST_DIR"], "golden-manifest.json")
with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)
    f.write("\n")
print(f"[provision] wrote {manifest_path}")
PY

echo "[provision] golden toolchain ready"
