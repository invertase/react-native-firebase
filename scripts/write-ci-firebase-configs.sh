#!/usr/bin/env bash

set -euo pipefail

IOS_OUTPUT_PATH="${1:?missing iOS output path}"
ANDROID_OUTPUT_PATH="${2:?missing Android output path}"

cat > "${IOS_OUTPUT_PATH}" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>API_KEY</key>
  <string>ci-api-key</string>
  <key>BUNDLE_ID</key>
  <string>io.invertase.react-native-demo</string>
  <key>GCM_SENDER_ID</key>
  <string>1234567890</string>
  <key>GOOGLE_APP_ID</key>
  <string>1:1234567890:ios:abcdef123456</string>
  <key>IS_ADS_ENABLED</key>
  <false/>
  <key>IS_ANALYTICS_ENABLED</key>
  <false/>
  <key>IS_APPINVITE_ENABLED</key>
  <false/>
  <key>IS_GCM_ENABLED</key>
  <true/>
  <key>IS_SIGNIN_ENABLED</key>
  <false/>
  <key>PLIST_VERSION</key>
  <string>1</string>
  <key>PROJECT_ID</key>
  <string>rnfb-build-harness-ci</string>
  <key>STORAGE_BUCKET</key>
  <string>rnfb-build-harness-ci.appspot.com</string>
</dict>
</plist>
EOF

cat > "${ANDROID_OUTPUT_PATH}" <<'EOF'
{
  "project_info": {
    "project_number": "1234567890",
    "project_id": "rnfb-build-harness-ci",
    "storage_bucket": "rnfb-build-harness-ci.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:1234567890:android:abcdef123456",
        "android_client_info": {
          "package_name": "com.invertase.testing"
        }
      },
      "api_key": [
        {
          "current_key": "ci-api-key"
        }
      ]
    }
  ],
  "configuration_version": "1"
}
EOF
