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
const { wipe } = require('../helpers');
const COLLECTION = 'firestore';

describe('firestore.collection().doc()', function () {
  before(function () {
    return wipe();
  });
  it('throws if path is not a document', function () {
    try {
      firebase.firestore().collection(COLLECTION).doc('bar/baz');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'documentPath' must point to a document");
      return Promise.resolve();
    }
  });

  it('generates an ID if no path is provided', function () {
    const instance = firebase.firestore().collection(COLLECTION).doc();
    should.equal(20, instance.id.length);
  });

  it('uses path if provided', function () {
    const instance = firebase.firestore().collection(COLLECTION).doc('bar');
    instance.id.should.eql('bar');
  });
});
