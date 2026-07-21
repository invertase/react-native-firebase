#!/usr/bin/env bash
# Clone TestingAVD into TestingAVD-0 … TestingAVD-4 for parallel e2e slots.
# Same AVD *definition* cannot run two read-write instances concurrently; clones are required.
# Serial unslotted runs keep using TestingAVD; slotted slot 0 uses TestingAVD-0.
set -euo pipefail

COUNT="${1:-4}"
BASE_AVD="${RNFB_ANDROID_BASE_AVD:-TestingAVD}"
ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
AVD_DIR="${ANDROID_AVD_HOME:-$HOME/.android/avd}"
EMU="${ANDROID_HOME}/emulator/emulator"
SDKMANAGER="${ANDROID_HOME}/cmdline-tools/latest/bin/avdmanager"

if [[ ! -x "$EMU" ]]; then
  echo "error: emulator not found at $EMU (set ANDROID_HOME)" >&2
  exit 1
fi

if ! "$EMU" -list-avds | grep -qx "$BASE_AVD"; then
  echo "error: base AVD '$BASE_AVD' not found. Create it first (Android Studio AVD Manager)." >&2
  exit 1
fi

clone_avd() {
  local src=$1 dst=$2
  if "$EMU" -list-avds | grep -qx "$dst"; then
    echo "[avd] $dst already exists"
    return 0
  fi

  local src_ini="${AVD_DIR}/${src}.ini"
  local src_avd="${AVD_DIR}/${src}.avd"
  local dst_ini="${AVD_DIR}/${dst}.ini"
  local dst_avd="${AVD_DIR}/${dst}.avd"

  echo "[avd] cloning $src → $dst"
  cp -R "$src_avd" "$dst_avd"
  cp "$src_ini" "$dst_ini"
  node -e "
    const fs = require('fs');
    const [ini, config, src, dst] = process.argv.slice(1);
    for (const file of [ini, config]) {
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').split(src).join(dst));
    }
  " "$dst_ini" "${dst_avd}/config.ini" "$src" "$dst"
}

for i in $(seq 0 "$COUNT"); do
  clone_avd "$BASE_AVD" "${BASE_AVD}-${i}"
done

echo "[avd] available AVDs:"
"$EMU" -list-avds | grep -E "^${BASE_AVD}" || true
echo "[avd] done — slotted slots 0..${COUNT} use ${BASE_AVD}-N; serial unslotted keeps ${BASE_AVD}"
