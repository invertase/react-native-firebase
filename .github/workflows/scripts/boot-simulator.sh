#!/bin/bash

# Any command here that exits non-zero is an error
set -e

# Get our simulator name from our test Detox config
pushd "$(dirname "$0")/../../../tests" || exit 1
SIM="$(cat .detoxrc.js | grep iPhone | cut -d"'" -f2)"
echo "Attempting to boot iOS Simulator $SIM..."

# Boot the simulator if not booted, make sure it is in the foreground
(xcrun simctl boot "$SIM" || true) && open -a Simulator.app

# Is it booted?
xcrun simctl list |grep -i "$SIM ("|grep -v 'Phone:'|grep -v 'unavailable'|grep -v CoreSimulator|grep Booted

# Are we a Debug or Release build?
BUILDDIR="$( find ios/build/Build/Products -type d |grep 'testing.app$' | head -1)"

# Install our app (glob so Release or Debug works)
xcrun simctl install "$SIM" "$BUILDDIR"