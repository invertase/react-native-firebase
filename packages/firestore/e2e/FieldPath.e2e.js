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

describe('firestore.FieldPath', () => {
  it('should throw if no segments', () => {
    try {
      new firebase.firestore.FieldPath();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('cannot construct FieldPath with no segments');
      return Promise.resolve();
    }
  });

  it('should throw if any segments are empty strings', () => {
    try {
      new firebase.firestore.FieldPath('foo', '');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('invalid segment at index');
      return Promise.resolve();
    }
  });

  it('should throw if any segments are not strings', () => {
    try {
      new firebase.firestore.FieldPath('foo', 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('invalid segment at index');
      return Promise.resolve();
    }
  });

  it('should throw if string fieldPath is invalid', () => {
    try {
      // Dummy create
      firebase
        .firestore()
        .collection('foo')
        .where('.foo', '<', 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Invalid field path');
      return Promise.resolve();
    }
  });

  it('should throw if string fieldPath contains invalid characters', () => {
    try {
      // Dummy create
      firebase
        .firestore()
        .collection('foo')
        .where('foo/bar', '<', 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Paths must not contain');
      return Promise.resolve();
    }
  });

  it('should provide access to segments as array', () => {
    const expect = ['foo', 'bar', 'baz'];
    const path = new firebase.firestore.FieldPath('foo', 'bar', 'baz');
    path._segments.should.eql(jet.contextify(expect));
  });

  it('should provide access to string dot notated path', () => {
    const expect = 'foo.bar.baz';
    const path = new firebase.firestore.FieldPath('foo', 'bar', 'baz');
    path._toPath().should.equal(expect);
  });

  it('should return document ID path', () => {
    const expect = '__name__';
    const path = firebase.firestore.FieldPath.documentId();
    path._segments.length.should.equal(1);
    path._toPath().should.equal(expect);
  });

  describe('isEqual()', () => {
    it('throws if other isnt a FieldPath', () => {
      try {
        const path = new firebase.firestore.FieldPath('foo');
        path.isEqual({});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'other' expected instance of FieldPath");
        return Promise.resolve();
      }
    });

    it('should return true if isEqual', () => {
      const path1 = new firebase.firestore.FieldPath('foo', 'bar');
      const path2 = new firebase.firestore.FieldPath('foo', 'bar');
      path1.isEqual(path2).should.equal(true);
    });

    it('should return false if not isEqual', () => {
      const path1 = new firebase.firestore.FieldPath('foo', 'bar');
      const path2 = new firebase.firestore.FieldPath('foo', 'baz');
      path1.isEqual(path2).should.equal(false);
    });
  });
});
