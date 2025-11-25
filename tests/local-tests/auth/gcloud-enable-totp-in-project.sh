#!/bin/bash

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

# This script will enable TOTP in your project
#
# It assumes:
# - curl is in PATH (should be installed by default on macOS)
# - gcloud is in PATH and you are authenticated (brew install google-cloud-sdk...)
# - you have set PROJECT_ID (otherwise it will use "react-native-firebase-testing")

if [ -z ${PROJECT_ID+x} ]; then
  PROJECT_ID="react-native-firebase-testing"
fi

if [ -z ${NUM_ADJ_INTERVALS+x} ]; then
  NUM_ADJ_INTERVALS=5
fi

echo "Enabling MFA and TOTP in gcloud project $PROJECT_ID"
echo "...using ${NUM_ADJ_INTERVALS} as number of adjacent intervals to accept."

curl -X PATCH "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=mfa" \
    -H "Authorization: Bearer $(gcloud auth print-access-token)" \
    -H "Content-Type: application/json" \
    -H "X-Goog-User-Project: ${PROJECT_ID}" \
    -d \
    "{
        \"mfa\": {
          \"state\": \"ENABLED\",
          \"providerConfigs\": [{
            \"state\": \"ENABLED\",
            \"totpProviderConfig\": {
              \"adjacentIntervals\": ${NUM_ADJ_INTERVALS}
            }
          }]
       }
    }"