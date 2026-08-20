/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, expect, it } from '@jest/globals';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const EXPLICIT_MODULES_OFF = 'SWIFT_ENABLE_EXPLICIT_MODULES=NO';

describe('Apple Detox/test build settings — explicit modules off', () => {
  it('ios.debug and ios.release xcodebuild disable Swift explicit modules', () => {
    const detox = require(join(REPO_ROOT, 'tests', '.detoxrc.js'));
    expect(detox.apps['ios.debug'].build).toContain(EXPLICIT_MODULES_OFF);
    expect(detox.apps['ios.release'].build).toContain(EXPLICIT_MODULES_OFF);
  });

  it('tests-macos build:macos xcodebuild disables Swift explicit modules', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'tests-macos', 'package.json'), 'utf8'));
    expect(pkg.scripts['build:macos']).toContain(EXPLICIT_MODULES_OFF);
  });
});
