#!/bin/bash
echo "Running $1 on all running emulators..."
devices=`adb devices`

for device in $devices; do
    if [[ "$device" =~ "emulator-" ]]; then
      adb -s $device $1
    fi    
done    
echo "All Done."