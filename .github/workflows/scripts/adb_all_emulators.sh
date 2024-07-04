#!/bin/bash
echo "Running $1 on all running emulators..."
devices=`$ANDROID_HOME/platform-tools/adb devices`

for device in $devices; do
    if [[ "$device" =~ "emulator-" ]]; then
      $ANDROID_HOME/platform-tools/adb -s $device $1
    fi    
done    
echo "All Done."