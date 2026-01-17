#!/bin/bash

SOURCE_PACKAGE_DIR="$1"
TARGET_PACKAGE_DIR="$2"

echo "Creating local npm packages from source '${SOURCE_PACKAGE_DIR}' in '${TARGET_PACKAGE_DIR}'..."

# Make sure our target directory exists and is clean from previous runs
if ! [ -d "${TARGET_PACKAGE_DIR}" ]; then
  mkdir "${TARGET_PACKAGE_DIR}"
else
  rm -f "${TARGET_PACKAGE_DIR}"/*.tgz
fi

if ! [ -d "${SOURCE_PACKAGE_DIR}" ]; then
  echo "Source package dir '${SOURCE_PACKAGE_DIR} not found."
  exit 1;
fi

# Get our full list of packages, except any we specifically ignore
IGNORED_PACKAGE_NAMES='template|invites'
PACKAGE_LIST=`find ${SOURCE_PACKAGE_DIR} -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | egrep -v "${IGNORED_PACKAGE_NAMES}"`

# Pack up each package
for PACKAGE in $PACKAGE_LIST; do
  echo "Creating package for $PACKAGE from local source"
  pushd "${SOURCE_PACKAGE_DIR}/${PACKAGE}";
  yarn pack;
  mv package.tgz "${TARGET_PACKAGE_DIR}/react-native-firebase-${PACKAGE}.tgz";
  ls -la "${TARGET_PACKAGE_DIR}/react-native-firebase-${PACKAGE}.tgz"
  popd;
done
ls -la "${TARGET_PACKAGE_DIR}"