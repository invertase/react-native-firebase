#!/bin/bash

bootanim=""

echo "Waiting for AVD to finish booting"
export PATH=$(dirname $(dirname $(command -v android)))/platform-tools:$PATH

until [[ "$bootanim" =~ "stopped" ]]; do
  sleep 5
  bootanim=$(adb -e shell getprop init.svc.bootanim 2>&1)
  echo "Android device boot animation status is '$bootanim'"
done

sleep 5

echo "Android Virtual Device is now ready."
