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

RESPONSES_VERSION='v5.*' # The major version of mock responses to use
REPO_NAME="vertexai-sdk-test-data"
REPO_LINK="https://github.com/FirebaseExtended/$REPO_NAME.git"

cd "$(dirname "$0")/packages/vertexai/__tests__/test-utils" || exit
rm -rf "$REPO_NAME"
git clone "$REPO_LINK" --quiet || exit
cd "$REPO_NAME" || exit

# Find and checkout latest tag matching major version
TAG=$(git tag -l "$RESPONSES_VERSION" --sort=v:refname | tail -n1)
if [ -z "$TAG" ]; then
  echo "Error: No tag matching '$RESPONSES_VERSION' found in $REPO_NAME"
  exit
fi
git checkout "$TAG" --quiet
