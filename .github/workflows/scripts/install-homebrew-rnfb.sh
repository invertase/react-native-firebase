#!/usr/bin/env bash
# Install vendored RNFB Homebrew formulae (Brew 6+ requires a tap, not bare --formula paths).
# Pin/update docs: okf-bundle/ci-workflows/ios.md#pinned-homebrew-utilities
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <formula> [<formula> ...]" >&2
  exit 1
fi

TAP_ROOT="$(brew --repository)/Library/Taps/invertase/homebrew-rnfb"
mkdir -p "$TAP_ROOT"
cp -R .github/homebrew-rnfb/Formula "$TAP_ROOT/"

export HOMEBREW_NO_AUTO_UPDATE=1
brew trust invertase/rnfb

# GHA images often ship homebrew-core formulae with the same names. Brew refuses to
# install invertase/rnfb/<name> while core <name> is still in the Cellar.
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
