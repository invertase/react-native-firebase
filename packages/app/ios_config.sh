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

_MAX_LOOKUPS=3;
_SEARCH_RESULT=''
_CURRENT_LOOKUPS=1
_JSON_ROOT="'react-native'"
_JSON_FILE_NAME='firebase.json'
_CURRENT_SEARCH_DIR=${PROJECT_DIR}
_PLIST_BUDDY=/usr/libexec/PlistBuddy
_TARGET_PLIST="${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH}"
_DSYM_PLIST="${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Info.plist"

_PLIST_ENTRY_KEYS=(
  'firebase_crashlytics_collection_enabled'            #1
  'firebase_json_raw'                                  #2 - must always be last entry
)

_PLIST_ENTRY_TYPES=(
  'bool'                                               #1
  'string'                                             #2 - must always be last entry
)

_PLIST_ENTRY_VALUES=(
  'NO'                                                 #1
  'e30='                                               #2 - must always be last entry - base64 of {}
)

function setPlistValue {
  echo "info:      setting plist entry '$1' of type '$2' in file '$4'"
  ${_PLIST_BUDDY} -c "Add :$1 $2 '$3'" $4 || echo "info:      '$1' already exists"
}

echo "info: -> RNFB build script started"
echo "info: 1) Locating ${_JSON_FILE_NAME} file:"

if [[ -z ${_CURRENT_SEARCH_DIR} ]]; then
  _CURRENT_SEARCH_DIR=`pwd`
fi;

while true; do
  _CURRENT_SEARCH_DIR=`dirname "$_CURRENT_SEARCH_DIR"`
  if [[ "$_CURRENT_SEARCH_DIR" == "/" ]] || [[ ${_CURRENT_LOOKUPS} -gt ${_MAX_LOOKUPS} ]]; then break; fi;

  echo "info:      ($_CURRENT_LOOKUPS of $_MAX_LOOKUPS) Searching in '$_CURRENT_SEARCH_DIR' for a ${_JSON_FILE_NAME} file."
  _SEARCH_RESULT=`find "$_CURRENT_SEARCH_DIR" -maxdepth 2 -name ${_JSON_FILE_NAME} -print | head -n 1`

  if [[ ${_SEARCH_RESULT} ]]; then
    echo "info:      ${_JSON_FILE_NAME} found at $_SEARCH_RESULT"
    break;
  fi;

  _CURRENT_LOOKUPS=$((_CURRENT_LOOKUPS+1))
done

if [[ ${_SEARCH_RESULT} ]]; then
  _SEARCH_RESULT="'$_SEARCH_RESULT'"
  _JSON_OUTPUT=`python -c 'import json,sys,base64;print(base64.b64encode(json.dumps(json.loads(open('${_SEARCH_RESULT}').read())['${_JSON_ROOT}'])))' || echo "e30="`
  _PLIST_ENTRY_VALUES[${#_PLIST_ENTRY_VALUES[@]}-1]="${_JSON_OUTPUT}"
  echo "info:      firebase.json value: ${_JSON_OUTPUT}"
else
  echo "warning:   A firebase.json file was not found, whilst this file is optional it is recommended to include it to configure firebase services in React Native Firebase."
fi;

echo "info: 2) Adding Info.plist entries: "

for plist in ${_TARGET_PLIST} ${_DSYM_PLIST} ; do
  if [[ -f ${plist} ]]; then
    for i in "${!_PLIST_ENTRY_KEYS[@]}"; do
      setPlistValue ${_PLIST_ENTRY_KEYS[$i]} ${_PLIST_ENTRY_TYPES[$i]} ${_PLIST_ENTRY_VALUES[$i]} ${plist}
    done
  else
    echo "warning:   A Info.plist build output file was not found (${plist})"
  fi
done

echo "info: <- RNFB build script finished"



