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

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const scriptPath = path.join(repoRoot, 'scripts/e2e/run-slotted-test-cover.sh');

describe('run-slotted-test-cover.sh Metro /status gate', function () {
  const src = fs.readFileSync(scriptPath, 'utf8');

  it('empty /status error hints overlapping pkill and that packager must still be running', function () {
    expect(src).toMatch(/last body: \$\{body:-<empty>\}/);
    const emptyHint = src.match(/if \[\[ -z "\$\{body\}" \]\]; then[\s\S]*?fi/);
    expect(emptyHint).not.toBeNull();
    expect(emptyHint[0]).toMatch(/overlapping pkill/i);
    expect(emptyHint[0]).toMatch(/packager must still be running/i);
  });
});
