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
const scriptPath = path.join(repoRoot, 'scripts/e2e/run-slotted-packager.sh');
const helperPath = path.join(repoRoot, 'scripts/e2e/lib/exec-new-session.py');

describe('run-slotted-packager.sh Metro process-group survival', function () {
  const src = fs.readFileSync(scriptPath, 'utf8');
  const helper = fs.readFileSync(helperPath, 'utf8');
  const combined = `${src}\n${helper}`;

  it('ignores SIGHUP on the starter shell', function () {
    expect(src).toContain("trap '' HUP");
  });

  it('launches Metro in a new session (setsid(2) / setsid -w), not nohup', function () {
    expect(combined).toMatch(/os\.setsid|setsid -w|setsid\(/);
    expect(src).not.toMatch(/\bexec\s+nohup\b/);
    expect(helper).toContain('os.setsid');
  });

  it('does not add a reuse-if-already-up path', function () {
    expect(src).toMatch(/Do not add a "reuse if already up" path/);
    expect(src).not.toMatch(/curl\s+-sf.*\/status/);
  });
});
