#!/bin/bash

# Any command here that exits non-zero is an error
set -e

# Get our simulator name from our test Detox config
pushd "$(dirname "$0")/../../../tests" || exit 1
SIM="$(cat .detoxrc.js | grep iPhone | cut -d"'" -f2)"
echo "Attempting to boot iOS Simulator $SIM..."

# Clear up any existing attempts in case we are re-trying
echo "...killing any existing Simulator processes..."
killall Simulator || true

# Boot the simulator if not booted, make sure it is in the foreground
echo "...booting $SIM and foregrounding Simulator..."
(xcrun simctl boot "$SIM" || true) && open -a Simulator.app

# Is it booted?
echo "...waiting to make sure $SIM is booted..."
xcrun simctl list |grep -i "$SIM ("|grep -v 'Phone:'|grep -v 'unavailable'|grep -v CoreSimulator|grep Booted

# Are we a Debug or Release build?
BUILDDIR="$( find ios/build/Build/Products -type d |grep 'testing.app$' | head -1)"

# Install our app (glob so Release or Debug works)
echo "...installing the Test app build on $SIM..."
xcrun simctl install "$SIM" "$BUILDDIR"

echo "Successfully booted $SIM and installed test app."