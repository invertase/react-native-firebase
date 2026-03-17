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
  # SPM: upload-symbols is in the SourcePackages checkout
  SPM_UPLOAD_SYMBOLS=$(find "${BUILD_DIR%Build/*}SourcePackages/checkouts/firebase-ios-sdk/Crashlytics" -name "upload-symbols" -type f 2>/dev/null | head -1)
  if [[ -n "${SPM_UPLOAD_SYMBOLS}" ]]; then
    echo "info: Exec FirebaseCrashlytics upload-symbols from SPM"
    "${SPM_UPLOAD_SYMBOLS}" -gsp "${PROJECT_DIR}/GoogleService-Info.plist" -p ios "${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}"
  else
    echo "warning: FirebaseCrashlytics run script not found, skipping dSYM upload"
  fi
fi
