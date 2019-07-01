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

describe('firestore.collection()', () => {
  before(() => wipe());

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
    const instance2 = firebase
      .firestore()
      .collection('foo')
      .doc('bar')
      .collection('baz');
    should.equal(instance2.parent.id, 'bar');
  });

  it('returns the firestore path', () => {
    const instance1 = firebase.firestore().collection('foo');
    instance1.path.should.eql('foo');
    const instance2 = firebase
      .firestore()
      .collection('foo')
      .doc('bar')
      .collection('baz');
    instance2.path.should.eql('foo/bar/baz');
  });
});
