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

describe('database().ref().child()', () => {
  it('throws if path is not a string', async () => {
    try {
      firebase
        .database()
        .ref()
        .child({ foo: 'bar' });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'path' must be a string value");
      return Promise.resolve();
    }
  });

  it('throws if path is not a valid string', async () => {
    try {
      firebase
        .database()
        .ref()
        .child('$$$$$');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql(
        "'Paths must be non-empty strings and can't contain #, $, [, ], ' or ?'",
      );
      return Promise.resolve();
    }
  });
});
