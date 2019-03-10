#!/usr/bin/env bash
set -e

_JSON_ROOT="'react-native'"
_JSON_FILE_NAME='firebase.json'
_PLIST_BUDDY=/usr/libexec/PlistBuddy
_TARGET_PLIST="${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH}"
_DSYM_PLIST="${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Info.plist"

_PLIST_ENTRY_KEYS=(
  'firebase_crashlytics_collection_enabled'            #1
  'rnfb_firebase_json'                                 #2 - must always be last entry
)
_PLIST_ENTRY_TYPES=(
  'bool'                                               #1
  'string'                                             #2
)
_PLIST_ENTRY_VALUES=(
  'NO'                                                 #1
  '{}'                                                 #2
)

function setPlistValue {
  echo "info: setting plist entry '$1' of type '$2' in file '$4'"
  ${_PLIST_BUDDY} -c "Add :$1 $2 $3" $4 >/dev/null
}

echo "info: -------- START - RNFB Build Script ----------"
for plist in ${_TARGET_PLIST} ${_DSYM_PLIST} ; do
  if [[ -f ${plist} ]]; then
    for i in "${!_PLIST_ENTRY_KEYS[@]}"; do
      setPlistValue ${_PLIST_ENTRY_KEYS[$i]} ${_PLIST_ENTRY_TYPES[$i]} ${_PLIST_ENTRY_VALUES[$i]} ${plist}
    done
  fi
done

_MAX_LOOKUPS=5;
_SEARCH_RESULT=''
_CURRENT_LOOKUPS=1
_CURRENT_SEARCH_DIR=${PROJECT_DIR}

if [[ -z ${_CURRENT_SEARCH_DIR} ]]; then
  _CURRENT_SEARCH_DIR=`pwd`
fi;

while true; do
  _CURRENT_SEARCH_DIR=`dirname "$_CURRENT_SEARCH_DIR"`
  if [[ "$_CURRENT_SEARCH_DIR" == "/" ]] || [[ ${_CURRENT_LOOKUPS} -gt ${_MAX_LOOKUPS} ]]; then break; fi;

  echo "info: ($_CURRENT_LOOKUPS of $_MAX_LOOKUPS) Searching in '$_CURRENT_SEARCH_DIR' for a ${_JSON_FILE_NAME} file."
  _SEARCH_RESULT=`find "$_CURRENT_SEARCH_DIR" -maxdepth 2 -name ${_JSON_FILE_NAME} -print | head -n 1`

  if [[ ${_SEARCH_RESULT} ]]; then
    echo "info: ${_JSON_FILE_NAME} found at $_SEARCH_RESULT"
    break;
  fi;

  _CURRENT_LOOKUPS=$((_CURRENT_LOOKUPS+1))
done

if [[ ${_SEARCH_RESULT} ]]; then
  _SEARCH_RESULT="'$_SEARCH_RESULT'"
  _JSON_OUTPUT=`python -c 'import json,sys; print(json.dumps(json.loads(open('${_SEARCH_RESULT}').read())['${_JSON_ROOT}']))' || echo "{}"`
  _PLIST_ENTRY_VALUES[${#_PLIST_ENTRY_VALUES[@]}-1]=${_JSON_OUTPUT}
  echo ${_PLIST_ENTRY_VALUES[1]}
fi;

echo "info: --------- END - RNFB Build Script -----------"


