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
const COLLECTION = 'firestore';
const { wipe } = require('../helpers');
describe('firestore().collection().orderBy()', function () {
  before(function () {
    return wipe();
  });
  it('throws if fieldPath is not valid', function () {
    try {
      firebase.firestore().collection(COLLECTION).orderBy(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' must be a string or instance of FieldPath");
      return Promise.resolve();
    }
  });

  it('throws if fieldPath string is invalid', function () {
    try {
      firebase.firestore().collection(COLLECTION).orderBy('.foo.bar');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'fieldPath' Invalid field path");
      return Promise.resolve();
    }
  });

  it('throws if direction string is not valid', function () {
    try {
      firebase.firestore().collection(COLLECTION).orderBy('foo', 'up');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'directionStr' must be one of 'asc' or 'desc'");
      return Promise.resolve();
    }
  });

  it('throws if a startAt()/startAfter() has already been set', async function () {
    try {
      const doc = firebase.firestore().doc(`${COLLECTION}/startATstartAfter`);
      await doc.set({ foo: 'bar' });
      const snapshot = await doc.get();

      firebase.firestore().collection(COLLECTION).startAt(snapshot).orderBy('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('You must not call startAt() or startAfter()');
      return Promise.resolve();
    }
  });

  it('throws if a endAt()/endBefore() has already been set', async function () {
    try {
      const doc = firebase.firestore().doc(`${COLLECTION}/endAtendBefore`);
      await doc.set({ foo: 'bar' });
      const snapshot = await doc.get();

      firebase.firestore().collection(COLLECTION).endAt(snapshot).orderBy('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('You must not call endAt() or endBefore()');
      return Promise.resolve();
    }
  });

  it('throws if duplicating the order field path', function () {
    try {
      firebase.firestore().collection(COLLECTION).orderBy('foo.bar').orderBy('foo.bar');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('Order by clause cannot contain duplicate fields');
      return Promise.resolve();
    }
  });

  // FIXME flaky in local tests
  xit('orders by a value ASC', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/order/asc`);

    await colRef.add({ value: 1 });
    await colRef.add({ value: 3 });
    await colRef.add({ value: 2 });

    const snapshot = await colRef.orderBy('value', 'asc').get();
    const expected = [1, 2, 3];

    snapshot.forEach((docSnap, i) => {
      docSnap.data().value.should.eql(expected[i]);
    });
  });

  // FIXME flaky in local tests
  xit('orders by a value DESC', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/order/desc`);

    await colRef.add({ value: 1 });
    await colRef.add({ value: 3 });
    await colRef.add({ value: 2 });

    const snapshot = await colRef.orderBy(new firebase.firestore.FieldPath('value'), 'desc').get();
    const expected = [3, 2, 1];

    snapshot.forEach((docSnap, i) => {
      docSnap.data().value.should.eql(expected[i]);
    });
  });
});
