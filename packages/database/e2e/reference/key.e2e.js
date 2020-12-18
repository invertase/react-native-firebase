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

describe('database().ref().key', function() {
  it('returns null when no reference path is provides', function() {
    const ref = firebase.database().ref();
    should.equal(ref.key, null);
  });

  it('return last token in reference path', function() {
    const ref1 = firebase.database().ref('foo');
    const ref2 = firebase.database().ref('foo/bar/baz');
    ref1.key.should.equal('foo');
    ref2.key.should.equal('baz');
  });
});
