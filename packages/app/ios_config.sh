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
  _SEARCH_RESULT=$(find "$_CURRENT_SEARCH_DIR" -maxdepth 2 -name ${_JSON_FILE_NAME} -print | head -n 1)
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
    _JSON_OUTPUT_BASE64=$(python -c 'import json,sys,base64;print(base64.b64encode(json.dumps(json.loads(open('"'${_SEARCH_RESULT}'"').read())['${_JSON_ROOT}'])))' || echo "e30=")
  fi

  _PLIST_ENTRY_KEYS+=("firebase_json_raw")
  _PLIST_ENTRY_TYPES+=("string")
  _PLIST_ENTRY_VALUES+=("$_JSON_OUTPUT_BASE64")

  # config.analytics_auto_collection_enabled
  _ANALYTICS_AUTO_COLLECTION=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "analytics_auto_collection_enabled")
  if [[ $_ANALYTICS_AUTO_COLLECTION ]]; then
    _PLIST_ENTRY_KEYS+=("FIREBASE_ANALYTICS_COLLECTION_ENABLED")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_ANALYTICS_AUTO_COLLECTION")")
  fi

  # config.perf_auto_collection_enabled
  _PERF_AUTO_COLLECTION=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "perf_auto_collection_enabled")
  if [[ $_PERF_AUTO_COLLECTION ]]; then
    _PLIST_ENTRY_KEYS+=("firebase_performance_collection_enabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_PERF_AUTO_COLLECTION")")
  fi

  # config.messaging_auto_init_enabled
  _MESSAGING_AUTO_INIT=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "messaging_auto_init_enabled")
  if [[ $_MESSAGING_AUTO_INIT ]]; then
    _PLIST_ENTRY_KEYS+=("FirebaseMessagingAutoInitEnabled")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("$(jsonBoolToYesNo "$_MESSAGING_AUTO_INIT")")
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

  # config.admob_delay_app_measurement_init
  _ADMOB_DELAY_APP_MEASUREMENT=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "admob_delay_app_measurement_init")
  if [[ $_ADMOB_DELAY_APP_MEASUREMENT == "true" ]]; then
    _PLIST_ENTRY_KEYS+=("GADDelayAppMeasurementInit")
    _PLIST_ENTRY_TYPES+=("bool")
    _PLIST_ENTRY_VALUES+=("YES")
  fi

  # config.admob_ios_app_id
  _ADMOB_IOS_APP_ID=$(getFirebaseJsonKeyValue "$_JSON_OUTPUT_RAW" "admob_ios_app_id")
  if [[ $_ADMOB_IOS_APP_ID ]]; then
    _PLIST_ENTRY_KEYS+=("GADApplicationIdentifier")
    _PLIST_ENTRY_TYPES+=("string")
    _PLIST_ENTRY_VALUES+=("$_ADMOB_IOS_APP_ID")
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
