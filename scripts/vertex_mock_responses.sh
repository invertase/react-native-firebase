#!/bin/bash

# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This script replaces mock response files for Vertex AI unit tests with a fresh
# clone of the shared repository of Vertex AI test data.

REPO_NAME="vertexai-sdk-test-data"
REPO_LINK="https://github.com/FirebaseExtended/$REPO_NAME.git"
# Get the latest tag from the remote repository
LATEST_TAG=$(git ls-remote --tags "$REPO_LINK" | \
awk -F'/' '{print $3}' | \
sort -V | \
tail -n1)


# Define the directory name using REPO_NAME and LATEST_TAG.
CLONE_DIR="${REPO_NAME}_${LATEST_TAG//./_}"

cd "$(dirname "$0")/../packages/vertexai/__tests__/test-utils" || exit

# Remove any directories that start with REPO_NAME but are not CLONE_DIR
for dir in "${REPO_NAME}"*; do
  if [ "$dir" != "$CLONE_DIR" ] && [ -d "$dir" ]; then
    echo "Removing old directory: $dir"
    rm -rf "$dir"
  fi
done

# Check if CLONE_DIR exists, exit if it does
if [ -d "$CLONE_DIR" ]; then
  echo "Exiting vertex_mock_responses script as repo exists locally already."
  exit 0
fi


git clone "$REPO_LINK" "$CLONE_DIR" --quiet || exit
cd "$CLONE_DIR" || exit

git checkout "$LATEST_TAG" --quiet
