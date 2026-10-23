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

# upload-symbols talks to the network and has no timeout of its own, so a stalled
# request can hang the whole build. perl's alarm is used because macOS has no
# `timeout`. A timeout exits non-zero, which the callers below report as a
# warning without failing the build.
UPLOAD_SYMBOLS_TIMEOUT_SEC="${RNFB_CRASHLYTICS_UPLOAD_TIMEOUT_SEC:-300}"

run_upload_symbols() {
  perl -e 'alarm shift; exec @ARGV' "${UPLOAD_SYMBOLS_TIMEOUT_SEC}" "$@"
}

if [[ ${PODS_ROOT} && -f "${PODS_ROOT}/FirebaseCrashlytics/run" ]]; then
  echo "info: Exec FirebaseCrashlytics Run from Pods"
  if ! "${PODS_ROOT}/FirebaseCrashlytics/run"; then
    echo "warning: FirebaseCrashlytics run (CocoaPods) failed; continuing without failing the build. Common causes: no network, invalid/placeholder GoogleService-Info.plist credentials, or Firebase project mismatch."
  fi
elif [[ -f "${PROJECT_DIR}/FirebaseCrashlytics.framework/run" ]]; then
  echo "info: Exec FirebaseCrashlytics Run from framework"
  if ! "${PROJECT_DIR}/FirebaseCrashlytics.framework/run"; then
    echo "warning: FirebaseCrashlytics run (framework) failed; continuing without failing the build. Common causes: no network, invalid/placeholder GoogleService-Info.plist credentials, or Firebase project mismatch."
  fi
else
  # SPM: upload-symbols is at a known path in the SourcePackages checkout.
  # BUILD_DIR is typically DerivedData/Project-hash/Build/Products — strip from /Build onward
  # to get the DerivedData project root where SourcePackages lives.
  SPM_CRASHLYTICS_DIR="${BUILD_DIR%Build/*}SourcePackages/checkouts/firebase-ios-sdk/Crashlytics"
  SPM_UPLOAD_SYMBOLS="${SPM_CRASHLYTICS_DIR}/upload-symbols"

  # GoogleService-Info.plist normally lives in the target folder
  # (ios/<TargetName>/GoogleService-Info.plist) — that's where both Expo's config
  # plugin and RNFB's documented manual/CLI setup place it. Fall back to the
  # PROJECT_DIR root for setups that put it there instead.
  if [[ -n "${TARGET_NAME}" && -f "${PROJECT_DIR}/${TARGET_NAME}/GoogleService-Info.plist" ]]; then
    GSP_PATH="${PROJECT_DIR}/${TARGET_NAME}/GoogleService-Info.plist"
  elif [[ -f "${PROJECT_DIR}/GoogleService-Info.plist" ]]; then
    GSP_PATH="${PROJECT_DIR}/GoogleService-Info.plist"
  else
    GSP_PATH=""
  fi

  if [[ -z "${GSP_PATH}" ]]; then
    echo "warning: GoogleService-Info.plist not found at ${PROJECT_DIR}/${TARGET_NAME}/GoogleService-Info.plist or ${PROJECT_DIR}/GoogleService-Info.plist. Skipping dSYM upload."
  elif [[ -x "${SPM_UPLOAD_SYMBOLS}" ]]; then
    echo "info: Exec FirebaseCrashlytics upload-symbols from SPM"
    if ! run_upload_symbols "${SPM_UPLOAD_SYMBOLS}" -gsp "${GSP_PATH}" -p ios "${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}"; then
      echo "warning: FirebaseCrashlytics upload-symbols (SPM) failed or timed out; continuing without failing the build. Common causes: no network, invalid/placeholder GoogleService-Info.plist credentials, or Firebase project mismatch."
    fi
  elif [[ -f "${SPM_UPLOAD_SYMBOLS}" ]]; then
    echo "info: Exec FirebaseCrashlytics upload-symbols from SPM (chmod +x)"
    chmod +x "${SPM_UPLOAD_SYMBOLS}"
    if ! run_upload_symbols "${SPM_UPLOAD_SYMBOLS}" -gsp "${GSP_PATH}" -p ios "${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}"; then
      echo "warning: FirebaseCrashlytics upload-symbols (SPM) failed or timed out; continuing without failing the build. Common causes: no network, invalid/placeholder GoogleService-Info.plist credentials, or Firebase project mismatch."
    fi
  else
    echo "warning: FirebaseCrashlytics run script not found at CocoaPods, framework, or SPM paths. Skipping dSYM upload."
    echo "warning: Checked: \${PODS_ROOT}/FirebaseCrashlytics/run, \${PROJECT_DIR}/FirebaseCrashlytics.framework/run, ${SPM_UPLOAD_SYMBOLS}"
  fi
fi
