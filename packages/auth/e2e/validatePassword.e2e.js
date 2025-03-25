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

describe('auth() -> validatePassword()', function () {
  it('isValid is false if password is too short', async function () {
    const auth = getAuth();
    let status = await firebase.auth().validatePassword(auth, 'Pa1$');
    expect(status.isValid).toBe(false);
  });

  it('isValid is false if password is empty string', async function () {
    const auth = getAuth();
    let status = await firebase.auth().validatePassword(auth, '');
    expect(status.isValid).toBe(false);
  });

  it('isValid is false if password has no digits', async function () {
    const auth = getAuth();
    let status = await firebase.auth().validatePassword(auth, 'Password$');
    expect(status.isValid).toBe(false);
  });

  it('isValid is false if password has no capital letters', async function () {
    const auth = getAuth();
    let status = await firebase.auth().validatePassword(auth, 'password123$');
    expect(status.isValid).toBe(false);
  });

  it('isValid is false if password has no lowercase letters', async function () {
    const auth = getAuth();
    let status = await firebase.auth().validatePassword(auth, 'PASSWORD123$');
    expect(status.isValid).toBe(false);
  });

  it('isValid is true if given a password that satisfies the policy', async function () {
    const auth = getAuth();
    let status = await firebase.auth().validatePassword(auth, 'Password123$');
    expect(status.isValid).toBe(true);
  });

  it('isValid is true if given another password that satisfies the policy', async function () {
    const auth = getAuth();
    let status = await firebase.auth().validatePassword(auth, 'Testing123$');
    expect(status.isValid).toBe(true);
  });

  it('validatePassword throws an error if given a bad auth instance', async function () {
    const auth = undefined;
    try {
      await firebase.auth().validatePassword(auth, 'Testing123$');
    } catch (e) {
      expect(e.code).toBe(
        "Failed to fetch password policy: Cannot read property 'options' of undefined",
      );
    }
  });
});
