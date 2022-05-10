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

_MAX_LOOKUPS=2;
_SEARCH_RESULT=''
_RN_ROOT_EXISTS=''
_CURRENT_LOOKUPS=1
_JSON_ROOT="'react-native'"
_JSON_FILE_NAME='firebase.json'
_JSON_OUTPUT_BASE64='e30=' # { }
_CURRENT_SEARCH_DIR=${PROJECT_DIR}
_PLIST_BUDDY=/usr/libexec/PlistBuddy
_TARGET_PLIST="${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH}"
_DSYM_PLIST="${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Info.plist"

# plist arrays
_PLIST_ENTRY_KEYS=()
_PLIST_ENTRY_TYPES=()
_PLIST_ENTRY_VALUES=()

function setPlistValue {
  echo "info:      setting plist entry '$1' of type '$2' in file '$4'"
  ${_PLIST_BUDDY} -c "Add :$1 $2 '$3'" $4 || echo "info:      '$1' already exists"
}

function getFirebaseJsonKeyValue () {
  if [[ ${_RN_ROOT_EXISTS} ]]; then
    ruby -e "require 'rubygems';require 'json'; output=JSON.parse('$1'); puts output[$_JSON_ROOT]['$2']"
  else
    echo ""
  fi;
}

function jsonBoolToYesNo () {
  if [[ $1 == "false" ]]; then
    echo "NO"
  elif [[ $1 == "true" ]]; then
    echo "YES"
  else echo "NO"
  fi
}

echo "info: -> RNFB build script started"
echo "info: 1) Locating ${_JSON_FILE_NAME} file:"

if [[ -z ${_CURRENT_SEARCH_DIR} ]]; then
  _CURRENT_SEARCH_DIR=$(pwd)
fi;

while true; do
  _CURRENT_SEARCH_DIR=$(dirname "$_CURRENT_SEARCH_DIR")
  if [[ "$_CURRENT_SEARCH_DIR" == "/" ]] || [[ ${_CURRENT_LOOKUPS} -gt ${_MAX_LOOKUPS} ]]; then break; fi;
  echo "info:      ($_CURRENT_LOOKUPS of $_MAX_LOOKUPS) Searching in '$_CURRENT_SEARCH_DIR' for a ${_JSON_FILE_NAME} file."
  _SEARCH_RESULT=$(find "$_CURRENT_SEARCH_DIR" -maxdepth 2 -name ${_JSON_FILE_NAME} -print | /usr/bin/head -n 1)
  if [[ ${_SEARCH_RESULT} ]]; then
    echo "info:      ${_JSON_FILE_NAME} found at $_SEARCH_RESULT"
    break;
  fi;
  _CURRENT_LOOKUPS=$((_CURRENT_LOOKUPS+1))
done

if [[ ${_SEARCH_RESULT} ]]; then
  _JSON_OUTPUT_RAW=$(cat "${_SEARCH_RESULT}")
  _RN_ROOT_EXISTS=$(ruby -e "require 'rubygems';require 'json'; output=JSON.parse('$_JSON_OUTPUT_RAW'); puts output[$_JSON_ROOT]" || echo '')

  if [[ ${_RN_ROOT_EXISTS} ]]; then
    if ! python3 --version >/dev/null 2>&1; then echo "python3 not found, firebase.json file processing error." && exit 1; fi
    _JSON_OUTPUT_BASE64=$(python3 -c 'import json,sys,base64;print(base64.b64encode(bytes(json.dumps(json.loads(open('"'${_SEARCH_RESULT}'"', '"'rb'"').read())['${_JSON_ROOT}']), '"'utf-8'"')).decode())' || echo "e30=")
  fi

  _PLIST_ENTRY_KEYS+=("firebase_json_raw")
  _PLIST_ENTRY_TYPES+=("string")
  _PLIST_ENTRY_VALUES+=("$_JSON_OUTPUT_BASE64")

  # config.app_data_collection_default_enabled
  _APP_DATA_COLLECTION_ENABLED=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "app_data_collection_default_enabled")
  if [[ $_APP_DATA_COLLECTION_ENABLED ]]; then
    _PLIST_ENTRY_KEYS+=("FirebaseDataCollectionDefaultEnabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_APP_DATA_COLLECTION_ENABLED")")
  fi

  # config.analytics_auto_collection_enabled
  _ANALYTICS_AUTO_COLLECTION=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "analytics_auto_collection_enabled")
  if [[ $_ANALYTICS_AUTO_COLLECTION ]]; then
    _PLIST_ENTRY_KEYS+=("FIREBASE_ANALYTICS_COLLECTION_ENABLED")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_ANALYTICS_AUTO_COLLECTION")")
  fi

  # config.analytics_collection_deactivated
  _ANALYTICS_DEACTIVATED=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "analytics_collection_deactivated")
  if [[ $_ANALYTICS_DEACTIVATED ]]; then
    _PLIST_ENTRY_KEYS+=("FIREBASE_ANALYTICS_COLLECTION_DEACTIVATED")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_ANALYTICS_DEACTIVATED")")
  fi

  # config.analytics_idfv_collection_enabled
  _ANALYTICS_IDFV_COLLECTION=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "analytics_idfv_collection_enabled")
  if [[ $_ANALYTICS_IDFV_COLLECTION ]]; then
    _PLIST_ENTRY_KEYS+=("GOOGLE_ANALYTICS_IDFV_COLLECTION_ENABLED")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_ANALYTICS_IDFV_COLLECTION")")
  fi

  # config.analytics_default_allow_ad_personalization_signals
  _ANALYTICS_PERSONALIZATION=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "analytics_default_allow_ad_personalization_signals")
  if [[ $_ANALYTICS_PERSONALIZATION ]]; then
    _PLIST_ENTRY_KEYS+=("GOOGLE_ANALYTICS_DEFAULT_ALLOW_AD_PERSONALIZATION_SIGNALS")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_ANALYTICS_PERSONALIZATION")")
  fi

  # config.google_analytics_automatic_screen_reporting_enabled
  _ANALYTICS_AUTO_SCREEN_REPORTING=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "google_analytics_automatic_screen_reporting_enabled")
  if [[ $_ANALYTICS_AUTO_SCREEN_REPORTING ]]; then
    _PLIST_ENTRY_KEYS+=("FirebaseAutomaticScreenReportingEnabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_ANALYTICS_AUTO_SCREEN_REPORTING")")
  fi

  # config.perf_auto_collection_enabled
  _PERF_AUTO_COLLECTION=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "perf_auto_collection_enabled")
  if [[ $_PERF_AUTO_COLLECTION ]]; then
    _PLIST_ENTRY_KEYS+=("firebase_performance_collection_enabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_PERF_AUTO_COLLECTION")")
  fi

  # config.perf_collection_deactivated
  _PERF_DEACTIVATED=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "perf_collection_deactivated")
  if [[ $_PERF_DEACTIVATED ]]; then
    _PLIST_ENTRY_KEYS+=("firebase_performance_collection_deactivated")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_PERF_DEACTIVATED")")
  fi

  # config.messaging_auto_init_enabled
  _MESSAGING_AUTO_INIT=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "messaging_auto_init_enabled")
  if [[ $_MESSAGING_AUTO_INIT ]]; then
    _PLIST_ENTRY_KEYS+=("FirebaseMessagingAutoInitEnabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_MESSAGING_AUTO_INIT")")
  fi

  # config.in_app_messaging_auto_colllection_enabled
  _FIAM_AUTO_INIT=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "in_app_messaging_auto_collection_enabled")
  if [[ $_FIAM_AUTO_INIT ]]; then
    _PLIST_ENTRY_KEYS+=("FirebaseInAppMessagingAutomaticDataCollectionEnabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_FIAM_AUTO_INIT")")
  fi

  # config.app_check_token_auto_refresh
  _APP_CHECK_TOKEN_AUTO_REFRESH=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "app_check_token_auto_refresh")
  if [[ $_APP_CHECK_TOKEN_AUTO_REFRESH ]]; then
    _PLIST_ENTRY_KEYS+=("FirebaseAppCheckTokenAutoRefreshEnabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_APP_CHECK_TOKEN_AUTO_REFRESH")")
  fi

  # config.crashlytics_disable_auto_disabler - undocumented for now - mainly for debugging, document if becomes useful
  _CRASHLYTICS_AUTO_DISABLE_ENABLED=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "crashlytics_disable_auto_disabler")
  if [[ $_CRASHLYTICS_AUTO_DISABLE_ENABLED == "true" ]]; then
    echo "Disabled Crashlytics auto disabler." # do nothing
  else
    _PLIST_ENTRY_KEYS+=("FirebaseCrashlyticsCollectionEnabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("NO")
  fi
else
  _PLIST_ENTRY_KEYS+=("firebase_json_raw")
  _PLIST_ENTRY_TYPES+=("string")
  _PLIST_ENTRY_VALUES+=("$_JSON_OUTPUT_BASE64")
  echo "warning:   A firebase.json file was not found, whilst this file is optional it is recommended to include it to configure firebase services in React Native Firebase."
fi;

echo "info: 2) Injecting Info.plist entries: "

# Log out the keys we're adding
for i in "${!_PLIST_ENTRY_KEYS[@]}"; do
  echo "    ->  $i) ${_PLIST_ENTRY_KEYS[$i]}" "${_PLIST_ENTRY_TYPES[$i]}" "${_PLIST_ENTRY_VALUES[$i]}"
done

for plist in "${_TARGET_PLIST}" "${_DSYM_PLIST}" ; do
  if [[ -f "${plist}" ]]; then

    # paths with spaces break the call to setPlistValue. temporarily modify
    # the shell internal field separator variable (IFS), which normally
    # includes spaces, to consist only of line breaks
    oldifs=$IFS
    IFS="
"

    for i in "${!_PLIST_ENTRY_KEYS[@]}"; do
      setPlistValue "${_PLIST_ENTRY_KEYS[$i]}" "${_PLIST_ENTRY_TYPES[$i]}" "${_PLIST_ENTRY_VALUES[$i]}" "${plist}"
    done

    # restore the original internal field separator value
    IFS=$oldifs
  else
    echo "warning:   A Info.plist build output file was not found (${plist})"
  fi
done

echo "info: <- RNFB build script finished"
