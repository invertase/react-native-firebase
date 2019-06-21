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

describe('firestore.collection()', () => {
  // TODO inherits from query
  it('returns the firestore instance', () => {
    const instance = firebase.firestore().collection('foo');
    instance.firestore.app.name.should.eql('[DEFAULT]');
  });

  it('returns the collection id', () => {
    const id = 'foobar';
    const instance1 = firebase.firestore().collection(id);
    const instance2 = firebase.firestore().collection(`${id}/bar/baz`);
    instance1.id.should.eql(id);
    instance2.id.should.eql('baz');
  });

  it('returns the collection parent', () => {
    const instance1 = firebase.firestore().collection('foo');
    should.equal(instance1.parent, null);
    // TODO nested from doc
  });

  it('returns the firestore path', () => {
    const instance1 = firebase.firestore().collection('foo');
    instance1.path.should.eql('foo');
    // TODO nested from doc
  });

  describe('add()', () => {
    it('throws if data is not an object', () => {
      try {
        firebase.firestore().collection('foo').add(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'data' must be an object`);
        return Promise.resolve();
      }
    });

    // TODO test adding
  });

  describe('doc()', () => {
    it('throws if path is not a document', () => {
      try {
        firebase.firestore().collection('foo').doc('bar/baz');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'documentPath' must point to a document`);
        return Promise.resolve();
      }
    });

    it('generates an ID if no path is provided', () => {
      const instance = firebase.firestore().collection('foo').doc();
      should.equal(20, instance.id.length);
    });

    it('uses path if provided', () => {
      const instance = firebase.firestore().collection('foo').doc('bar');
      instance.id.should.eql('bar');
    });
  });
});
