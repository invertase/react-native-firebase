/*
 * Copyright (c) 2021-present Invertase Limited & Contributors
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
describe('firestore().doc().withConverter()', function () {
  before(function () {
    return wipe();
  });
  it('throws if an invalid argument provided', function () {
    try {
      firebase.firestore().doc(`${COLLECTION}/baz`).withConverter(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('expected an object value');
      return Promise.resolve();
    }
  });

  it('throws if toFirestore is not a function', function () {
    try {
      firebase.firestore().doc(`${COLLECTION}/baz`).withConverter({
        toFirestore: {},
      });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'toFirestore' expected a function");
      return Promise.resolve();
    }
  });

  it('throws if fromFirestore is not a function', function () {
    try {
      firebase.firestore().doc(`${COLLECTION}/baz`).withConverter({
        fromFirestore: {},
      });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'toFirestore' expected a function");
      return Promise.resolve();
    }
  });

  it('does not throw with valid properties', function () {
    firebase
      .firestore()
      .doc(`${COLLECTION}/baz`)
      .withConverter({
        toFirestore() {},
        fromFirestore() {},
      });
  });

  it('fromFirestore overwrites data', async function () {
    const docRef = firebase.firestore().doc(`${COLLECTION}/baz`);

    await docRef.set({
      foo: 'bar',
    });

    const snapshot = await docRef
      .withConverter({
        toFirestore() {},
        fromFirestore() {
          return {
            bar: 'baz',
          };
        },
      })
      .get();

    snapshot.data().bar.should.eql('baz');
  });

  it('fromFirestore provides & mutates a snapshot', async function () {
    const docRef = firebase.firestore().doc(`${COLLECTION}/baz`);

    await docRef.set({
      foo: 1,
    });

    const snapshot = await docRef
      .withConverter({
        toFirestore() {},
        fromFirestore(snapshot) {
          return {
            foo: snapshot.data().foo + 1,
          };
        },
      })
      .get();

    snapshot.data().bar.should.eql(2);
  });

  it('toFirestore overwrites all data', async function () {
    const docRef = firebase.firestore().doc(`${COLLECTION}/baz`);

    const snapshot = await docRef
      .withConverter({
        toFirestore() {
          return {
            bar: 'baz',
          };
        },
        fromFirestore() {},
      })
      .set({
        foo: 'bar',
      });

    snapshot.data().bar.should.eql('baz');
  });

  it('toFirestore mutates data', async function () {
    const docRef = firebase.firestore().doc(`${COLLECTION}/baz`);

    const snapshot = await docRef
      .withConverter({
        toFirestore(data) {
          return {
            foo: data.foo + 1,
            bar: 'baz',
          };
        },
        fromFirestore() {},
      })
      .set({
        foo: 0,
      });

    snapshot.data().foo.should.eql(1);
    snapshot.data().bar.should.eql('baz');
  });

  it('proving null or undefined removes a converter', async function () {
    const docRef = firebase
      .firestore()
      .doc(`${COLLECTION}/baz`)
      .withConverter({
        toFirestore() {
          return {
            bar: 'baz',
          };
        },
        fromFirestore() {},
      });

    docRef = docRef.withConverter(null);

    await docRef.set({
      foo: 'bar',
    });

    const snapshot = await docRef.get();
    snapshot.data().foo.should.eql(1);
  });
});
