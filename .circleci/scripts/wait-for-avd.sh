#!/bin/bash
#
# Copyright (c) 2016-present Invertase Limited & Contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this library except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

BOOT=""
INTERVAL=5
MAX_RETRIES=60
REMAINING_RETRIES=${MAX_RETRIES}

echo "[AVD] Waiting for boot completion..."
export PATH=$(dirname $(dirname $(command -v android)))/platform-tools:$PATH

until [[ "$BOOT" =~ "1" ]]; do
  if [[ ${REMAINING_RETRIES} -eq 0 ]]; then
    echo "[AVD] Failed to boot within 5 minutes. Exiting..." 1>&2
    exit 125
  fi

  BOOT=$(adb -e shell getprop sys.boot_completed 2>&1)
  sleep ${INTERVAL}

  REMAINING_RETRIES=$((REMAINING_RETRIES - 1))
  echo "[AVD] $REMAINING_RETRIES retries remaining."
done

sleep ${INTERVAL}
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0

sleep ${INTERVAL}

# Wake device if screen not on
adb shell dumpsys power | grep "mScreenOn=true" | xargs -0 test -z && adb shell input keyevent 26

echo "[AVD] Now ready."
