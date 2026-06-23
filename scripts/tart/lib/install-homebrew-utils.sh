#!/usr/bin/env bash
# Install vendored RNFB Homebrew formulae from scripts/tart/vendor (not .github/).
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <formula> [<formula> ...]" >&2
  exit 1
fi

_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_vendor_formula="${_script_dir}/../vendor/homebrew-rnfb/Formula"

if [[ ! -d "$_vendor_formula" ]]; then
  echo "error: missing vendored formulae at ${_vendor_formula}" >&2
  exit 1
fi

TAP_ROOT="$(brew --repository)/Library/Taps/invertase/homebrew-rnfb"
mkdir -p "$TAP_ROOT"
cp -R "$_vendor_formula" "$TAP_ROOT/"

export HOMEBREW_NO_AUTO_UPDATE=1
if brew help trust &>/dev/null; then
  brew trust invertase/rnfb
else
  export HOMEBREW_NO_REQUIRE_TAP_TRUST=1
fi

for formula in "$@"; do
  if brew list --formula "$formula" &>/dev/null; then
    echo "Uninstalling existing ${formula} before invertase/rnfb install..."
    brew uninstall --formula "$formula"
  fi
done

install_args=()
for formula in "$@"; do
  install_args+=("invertase/rnfb/${formula}")
done
brew install "${install_args[@]}"
