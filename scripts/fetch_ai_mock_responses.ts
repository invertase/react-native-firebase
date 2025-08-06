//  Copyright (c) 2016-present Invertase Limited & Contributors

//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this library except in compliance with the License.
//  You may obtain a copy of the License at

//    http://www.apache.org/licenses/LICENSE-2.0

//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

//  This script replaces mock response files for Vertex AI unit tests with a fresh
//  clone of the shared repository of Vertex AI test data.

// eslint-disable-next-line @typescript-eslint/no-require-imports
import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { rimrafSync } from 'rimraf';

// Our test data repository
const REPO_NAME = 'vertexai-sdk-test-data';
const REPO_LINK = `https://github.com/FirebaseExtended/${REPO_NAME}.git`;
const TEST_DATA_ROOT = join(__dirname, '..', 'packages', 'ai', '__tests__', 'test-utils');

// Get tags from repository, sorted by tag name, and coerce result to a string, then trim it
const repoTags = (
  execSync(`git ls-remote --tags --sort=version:refname "${REPO_LINK}"`) + ''
).trim();

// Fish out just the tag name from the last line (since they are sorted already)
const latestTag = repoTags.split('/').at(-1);
if (latestTag === undefined) {
  console.error('Unable to determine latest test data tag.');
  process.exit(1);
}

// Create the test data directory based on the latest tag
const cloneDirName = `${REPO_NAME}_${latestTag}`;
const cloneDirPath = join(TEST_DATA_ROOT, cloneDirName);

// Clean out any test data that isn't the latest test data
rimrafSync(TEST_DATA_ROOT, {
  preserveRoot: false,
  filter: (path: string, _) => !path.endsWith('.ts') && !path.includes(cloneDirName),
});

// Exit if our intended latest data clone target already exists
if (existsSync(cloneDirPath)) {
  console.log('AI mock responses data exists locally already. Exiting fetch script.');
  process.exit(0);
}

// Clone the latest test data
console.log(`Fetching AI mock responses data...`);
execSync(
  `git -c advice.detachedHead=false clone --branch ${latestTag} ${REPO_LINK} ${cloneDirPath}`,
);
