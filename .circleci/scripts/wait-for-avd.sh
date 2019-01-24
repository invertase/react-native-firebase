#!/bin/bash

bootanim=""

echo "Waiting for AVD to finish booting"
export PATH=$(dirname $(dirname $(command -v android)))/platform-tools:$PATH

until [[ "$bootanim" =~ "stopped" ]]; do
  sleep 10
  bootanim=$(adb -e shell getprop init.svc.bootanim 2>&1)
done

# extra time to let the OS settle
sleep 25

echo "Android Virtual Device is now ready."
