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
