#!/usr/bin/env bash
# Tart iOS xcodebuild wrapper: DerivedData on VM disk, codegen on virtiofs worktree.
set -euo pipefail

# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

export RNFB_IOS_DERIVED_DATA="${RNFB_IOS_DERIVED_DATA:-$HOME/rnfb-xcode-derived}"

rnfb_tart_xcode_clang_env() {
  export CC="$(xcrun -find clang)"
  export CXX="$(xcrun -find clang++)"
  export LD="$CC"
  export LDPLUSPLUS="$CXX"
}

# Keep tests/ios/build/generated on virtiofs; DerivedData lives on VM disk.
rnfb_tart_prepare_ios_build_layout() {
  local repo_root="$1"
  local ios_dir="${repo_root}/tests/ios"
  local build_path="${ios_dir}/build"

  if [[ -L "$build_path" ]]; then
    echo "[iteration] removing stale tests/ios/build symlink"
    rm -f "$build_path"
  fi

  mkdir -p "${build_path}/generated"

  if [[ -L "${build_path}/Build" ]]; then
    rm -f "${build_path}/Build"
  elif [[ -d "${build_path}/Build" ]]; then
    echo "[iteration] removing virtiofs tests/ios/build/Build (DerivedData → ${RNFB_IOS_DERIVED_DATA})"
    rm -rf "${build_path}/Build"
  fi
}

rnfb_tart_link_ios_build_products() {
  local repo_root="$1"
  local ios_build="${repo_root}/tests/ios/build"
  local products_src="${RNFB_IOS_DERIVED_DATA}/Build/Products"
  local products_link="${ios_build}/Build/Products"

  mkdir -p "${ios_build}/Build"
  if [[ -e "$products_link" && ! -L "$products_link" ]]; then
    rm -rf "$products_link"
  fi
  ln -sf "$products_src" "$products_link"
  echo "[iteration] tests/ios/build/Build/Products -> $(readlink "$products_link")"
}

rnfb_tart_ios_xcodebuild() {
  local repo_root="$1"
  local configuration="$2"
  local raw_log="${repo_root}/xcodebuild-raw.log"

  rnfb_tart_xcode_clang_env
  rnfb_tart_disable_ccache
  mkdir -p "$RNFB_IOS_DERIVED_DATA"

  cd "${repo_root}/tests"
  echo "[iteration] xcodebuild configuration=${configuration} derivedDataPath=${RNFB_IOS_DERIVED_DATA}"

  set -o pipefail
  xcodebuild \
    VALID_ARCHS="$(uname -m)" \
    CC="$CC" CPLUSPLUS="$CXX" LD="$LD" LDPLUSPLUS="$LDPLUSPLUS" \
    -workspace ios/testing.xcworkspace \
    -scheme testing \
    -configuration "$configuration" \
    -sdk iphonesimulator \
    -derivedDataPath "$RNFB_IOS_DERIVED_DATA" \
    2>&1 | tee "$raw_log" | xcbeautify

  rnfb_tart_link_ios_build_products "$repo_root"
}

rnfb_tart_ios_build_debug() {
  rnfb_tart_ios_xcodebuild "$1" Debug
}

rnfb_tart_ios_build_release() {
  rnfb_tart_ios_xcodebuild "$1" Release
}
