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
describe('firestore().collection().withConverter()', function () {
  before(function () {
    return wipe();
  });
  it('throws if an invalid argument provided', function () {
    try {
      firebase.firestore().collection(COLLECTION).withConverter('foo');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('expected an object value');
      return Promise.resolve();
    }
  });

  it('throws if toFirestore is not a function', function () {
    try {
      firebase.firestore().collection(COLLECTION).withConverter({
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
      firebase.firestore().collection(COLLECTION).withConverter({
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
      .collection(COLLECTION)
      .withConverter({
        toFirestore() {},
        fromFirestore() {},
      });
  });

  it('fromFirestore overwrites all snapshots', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/withConverter/collection`);
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([
      doc1.set({ foo: 1, bar: { value: 1 } }),
      doc2.set({ foo: 2, bar: { value: 2 } }),
      doc3.set({ foo: 3, bar: { value: 3 } }),
    ]);

    const expected = {
      foo: 'bar',
    };

    const qs = await colRef
      .orderBy('bar.value', 'desc')
      .withConverter({
        toFirestore() {},
        fromFirestore() {
          return expected;
        },
      })
      .get();

    qs.docs.length.should.eql(3);
    qs.docs[0].data().foo.should.eql('bar');
    qs.docs[1].data().foo.should.eql('bar');
    qs.docs[2].data().foo.should.eql('bar');
  });

  it('fromFirestore provides & mutates a snapshot', async function () {
    const colRef = firebase.firestore().collection(`${COLLECTION}/withConverter/collection`);
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([doc1.set({ foo: 1 }), doc2.set({ foo: 2 }), doc3.set({ foo: 3 })]);

    const qs = await colRef
      .orderBy('foo')
      .withConverter({
        toFirestore() {},
        fromFirestore(snapshot) {
          return {
            foo: snapshot.data().foo - 1,
          };
        },
      })
      .get();

    qs.docs.length.should.eql(3);
    qs.docs[0].data().foo.should.eql(0);
    qs.docs[1].data().foo.should.eql(1);
    qs.docs[2].data().foo.should.eql(2);
  });

  it('toFirestore overwrites all data', async function () {
    const colRef = firebase
      .firestore()
      .collection(`${COLLECTION}/withConverter/collection`)
      .withConverter({
        toFirestore() {
          return {
            foo: 'bar',
          };
        },
        fromFirestore() {},
      });
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([
      doc1.set({ bar: 'baz' }),
      doc2.set({ bar: 'baz' }),
      doc3.set({ bar: 'baz' }),
    ]);

    const qs = await colRef.get();

    qs.docs.length.should.eql(3);
    qs.docs[0].data().foo.should.eql('bar');
    qs.docs[1].data().foo.should.eql('bar');
    qs.docs[2].data().foo.should.eql('bar');
  });

  it('toFirestore mutates data', async function () {
    const colRef = firebase
      .firestore()
      .collection(`${COLLECTION}/withConverter/collection`)
      .withConverter({
        toFirestore(data) {
          return {
            foo: data.foo + 1,
          };
        },
        fromFirestore() {},
      });
    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([doc1.set({ foo: 0 }), doc2.set({ foo: 1 }), doc3.set({ foo: 2 })]);

    const qs = await colRef.get();

    qs.docs.length.should.eql(3);
    qs.docs[0].data().foo.should.eql(1);
    qs.docs[1].data().foo.should.eql(2);
    qs.docs[2].data().foo.should.eql(3);
  });

  it('proving null or undefined removes a converter', async function () {
    const colRef = firebase
      .firestore()
      .collection(`${COLLECTION}/withConverter/collection`)
      .withConverter({
        toFirestore(data) {
          return {
            foo: data.foo + 1,
          };
        },
        fromFirestore() {},
      });

    colRef = colRef.withConverter(null);

    const doc1 = colRef.doc('doc1');
    const doc2 = colRef.doc('doc2');
    const doc3 = colRef.doc('doc3');

    await Promise.all([doc1.set({ foo: 0 }), doc2.set({ foo: 1 }), doc3.set({ foo: 2 })]);

    const qs = await colRef.get();

    qs.docs.length.should.eql(3);
    qs.docs[0].data().foo.should.eql(0);
    qs.docs[1].data().foo.should.eql(1);
    qs.docs[2].data().foo.should.eql(2);
  });
});
