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

import { validatePassword } from '../lib/';

describe('auth() -> validatePassword()', function () {
  it('isValid is false if password is too short', async function () {
    let status = await validatePassword(firebase.auth(), 'Pa1$');
    status.isValid.should.equal(false);
  });

  it('isValid is false if password is empty string', async function () {
    let status = await validatePassword(firebase.auth(), '');
    status.isValid.should.equal(false);
  });

  it('isValid is false if password has no digits', async function () {
    let status = await validatePassword(firebase.auth(), 'Password$');
    status.isValid.should.equal(false);
  });

  it('isValid is false if password has no capital letters', async function () {
    let status = await validatePassword(firebase.auth(), 'password123$');
    status.isValid.should.equal(false);
  });

  it('isValid is false if password has no lowercase letters', async function () {
    let status = await validatePassword(firebase.auth(), 'PASSWORD123$');
    status.isValid.should.equal(false);
  });

  it('isValid is true if given a password that satisfies the policy', async function () {
    let status = await validatePassword(firebase.auth(), 'Password123$');
    status.isValid.should.equal(true);
  });

  it('validatePassword throws an error if password is null', async function () {
    try {
      const status = await validatePassword(firebase.auth(), null);
      console.log(status);
    } catch (e) {
      e.message.should.equal(
        'Failed to fetch password policy: Failed to fetch password policy: . Details: {\n  "error": {\n    "code": 400,\n    "message": "QUOTA_EXCEEDED : Exceeded quota for getting password policy.",\n    "status": "INVALID_ARGUMENT"\n  }\n}\n',
      );
    }
  });

  it('validatePassword throws an error if given a bad auth instance', async function () {
    const auth = undefined;
    try {
      const status = await validatePassword(auth, 'Testing123$');
      console.log(status);
    } catch (e) {
      e.message.should.equal(
        "Failed to fetch password policy: Cannot read property 'app' of undefined",
      );
    }
  });
});
