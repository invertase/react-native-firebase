#!/usr/bin/env bash
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
set -e

if [[ ${PODS_ROOT} && -f "${PODS_ROOT}/FirebaseCrashlytics/run" ]]; then
  echo "info: Exec FirebaseCrashlytics Run from Pods"
  "${PODS_ROOT}/FirebaseCrashlytics/run"
elif [[ -f "${PROJECT_DIR}/FirebaseCrashlytics.framework/run" ]]; then
  echo "info: Exec FirebaseCrashlytics Run from framework"
  "${PROJECT_DIR}/FirebaseCrashlytics.framework/run"
else
  # SPM: upload-symbols is at a known path in the SourcePackages checkout.
  # BUILD_DIR is typically DerivedData/Project-hash/Build/Products — strip from /Build onward
  # to get the DerivedData project root where SourcePackages lives.
  SPM_CRASHLYTICS_DIR="${BUILD_DIR%Build/*}SourcePackages/checkouts/firebase-ios-sdk/Crashlytics"
  SPM_UPLOAD_SYMBOLS="${SPM_CRASHLYTICS_DIR}/upload-symbols"
  if [[ -x "${SPM_UPLOAD_SYMBOLS}" ]]; then
    echo "info: Exec FirebaseCrashlytics upload-symbols from SPM"
    "${SPM_UPLOAD_SYMBOLS}" -gsp "${PROJECT_DIR}/GoogleService-Info.plist" -p ios "${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}"
  elif [[ -f "${SPM_UPLOAD_SYMBOLS}" ]]; then
    echo "info: Exec FirebaseCrashlytics upload-symbols from SPM (chmod +x)"
    chmod +x "${SPM_UPLOAD_SYMBOLS}"
    "${SPM_UPLOAD_SYMBOLS}" -gsp "${PROJECT_DIR}/GoogleService-Info.plist" -p ios "${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}"
  else
    echo "warning: FirebaseCrashlytics run script not found at CocoaPods, framework, or SPM paths. Skipping dSYM upload."
    echo "warning: Checked: \${PODS_ROOT}/FirebaseCrashlytics/run, \${PROJECT_DIR}/FirebaseCrashlytics.framework/run, ${SPM_UPLOAD_SYMBOLS}"
  fi
fi
