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
const NO_RULE_COLLECTION = 'no_rules';

describe('firestore.Transaction', function () {
  it('should throw if updateFunction is not a Promise', async function () {
    try {
      await firebase.firestore().runTransaction(() => 123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'updateFunction' must return a Promise");
      return Promise.resolve();
    }
  });

  it('should return an instance of FirestoreTransaction', async function () {
    await firebase.firestore().runTransaction(async transaction => {
      transaction.constructor.name.should.eql('FirestoreTransaction');
      return null;
    });
  });

  it('should resolve with user value', async function () {
    const expected = Date.now();

    const value = await firebase.firestore().runTransaction(async () => {
      return expected;
    });

    value.should.eql(expected);
  });

  it('should reject with user Error', async function () {
    const message = `Error: ${Date.now()}`;

    try {
      await firebase.firestore().runTransaction(async () => {
        throw new Error(message);
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (error) {
      error.message.should.eql(message);
      return Promise.resolve();
    }
  });

  it('should reject a native error', async function () {
    const docRef = firebase.firestore().doc(`${NO_RULE_COLLECTION}/foo`);

    try {
      await firebase.firestore().runTransaction(async t => {
        t.set(docRef, {
          foo: 'bar',
        });
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (error) {
      error.code.should.eql('firestore/permission-denied');
      return Promise.resolve();
    }
  });

  describe('transaction.get()', function () {
    it('should throw if not providing a document reference', async function () {
      try {
        await firebase.firestore().runTransaction(t => {
          return t.get(123);
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'documentRef' expected a DocumentReference");
        return Promise.resolve();
      }
    });

    it('should get a document and return a DocumentSnapshot', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/transactions/transaction/get-delete`);
      await docRef.set({});

      await firebase.firestore().runTransaction(async t => {
        const docSnapshot = await t.get(docRef);
        docSnapshot.constructor.name.should.eql('FirestoreDocumentSnapshot');
        docSnapshot.exists.should.eql(true);
        docSnapshot.id.should.eql('get-delete');

        t.delete(docRef);
      });
    });
  });

  describe('transaction.delete()', function () {
    it('should throw if not providing a document reference', async function () {
      try {
        await firebase.firestore().runTransaction(async t => {
          t.delete(123);
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'documentRef' expected a DocumentReference");
        return Promise.resolve();
      }
    });

    it('should delete documents', async function () {
      const docRef1 = firebase
        .firestore()
        .doc(`${COLLECTION}/transactions/transaction/delete-delete1`);
      await docRef1.set({});

      const docRef2 = firebase
        .firestore()
        .doc(`${COLLECTION}/transactions/transaction/delete-delete2`);
      await docRef2.set({});

      await firebase.firestore().runTransaction(async t => {
        t.delete(docRef1);
        t.delete(docRef2);
      });

      const snapshot1 = await docRef1.get();
      snapshot1.exists.should.eql(false);

      const snapshot2 = await docRef2.get();
      snapshot2.exists.should.eql(false);
    });
  });

  describe('transaction.update()', function () {
    it('should throw if not providing a document reference', async function () {
      try {
        await firebase.firestore().runTransaction(async t => {
          t.update(123);
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'documentRef' expected a DocumentReference");
        return Promise.resolve();
      }
    });

    it('should throw if update args are invalid', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

      try {
        await firebase.firestore().runTransaction(async t => {
          t.update(docRef, 123);
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('it must be an object');
        return Promise.resolve();
      }
    });

    it('should update documents', async function () {
      const value = Date.now();

      const docRef1 = firebase
        .firestore()
        .doc(`${COLLECTION}/transactions/transaction/delete-delete1`);
      await docRef1.set({
        foo: 'bar',
        bar: 'baz',
      });

      const docRef2 = firebase
        .firestore()
        .doc(`${COLLECTION}/transactions/transaction/delete-delete2`);
      await docRef2.set({
        foo: 'bar',
        bar: 'baz',
      });

      await firebase.firestore().runTransaction(async t => {
        t.update(docRef1, {
          bar: value,
        });
        t.update(docRef2, 'bar', value);
      });

      const expected = {
        foo: 'bar',
        bar: value,
      };

      const snapshot1 = await docRef1.get();
      snapshot1.exists.should.eql(true);
      snapshot1.data().should.eql(jet.contextify(expected));

      const snapshot2 = await docRef2.get();
      snapshot2.exists.should.eql(true);
      snapshot2.data().should.eql(jet.contextify(expected));
    });
  });

  describe('transaction.set()', function () {
    it('should throw if not providing a document reference', async function () {
      try {
        await firebase.firestore().runTransaction(async t => {
          t.set(123);
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'documentRef' expected a DocumentReference");
        return Promise.resolve();
      }
    });

    it('should throw if set data is invalid', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

      try {
        await firebase.firestore().runTransaction(async t => {
          t.set(docRef, 123);
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'data' must be an object.");
        return Promise.resolve();
      }
    });

    it('should throw if set options are invalid', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/foo`);

      try {
        await firebase.firestore().runTransaction(async t => {
          t.set(
            docRef,
            {},
            {
              merge: true,
              mergeFields: [],
            },
          );
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'options' must not contain both 'merge' & 'mergeFields'");
        return Promise.resolve();
      }
    });

    it('should set data', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/transactions/transaction/set`);
      await docRef.set({
        foo: 'bar',
      });
      const expected = {
        foo: 'baz',
      };

      await firebase.firestore().runTransaction(async t => {
        t.set(docRef, expected);
      });

      const snapshot = await docRef.get();
      snapshot.data().should.eql(jet.contextify(expected));
    });

    it('should set data with merge', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/transactions/transaction/set-merge`);
      await docRef.set({
        foo: 'bar',
        bar: 'baz',
      });
      const expected = {
        foo: 'bar',
        bar: 'foo',
      };

      await firebase.firestore().runTransaction(async t => {
        t.set(
          docRef,
          {
            bar: 'foo',
          },
          {
            merge: true,
          },
        );
      });

      const snapshot = await docRef.get();
      snapshot.data().should.eql(jet.contextify(expected));
    });

    it('should set data with merge fields', async function () {
      const docRef = firebase
        .firestore()
        .doc(`${COLLECTION}/transactions/transaction/set-mergefields`);
      await docRef.set({
        foo: 'bar',
        bar: 'baz',
        baz: 'ben',
      });
      const expected = {
        foo: 'bar',
        bar: 'foo',
        baz: 'foo',
      };

      await firebase.firestore().runTransaction(async t => {
        t.set(
          docRef,
          {
            bar: 'foo',
            baz: 'foo',
          },
          {
            mergeFields: ['bar', new firebase.firestore.FieldPath('baz')],
          },
        );
      });

      const snapshot = await docRef.get();
      snapshot.data().should.eql(jet.contextify(expected));
    });

    it('should roll back any updates that failed', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/transactions/transaction/rollback`);

      await docRef.set({
        turn: 0,
      });

      const prop1 = 'prop1';
      const prop2 = 'prop2';
      const turn = 0;
      const errorMessage = 'turn cannot exceed 1';

      const createTransaction = prop => {
        return firebase.firestore().runTransaction(async transaction => {
          const doc = await transaction.get(docRef);
          const data = doc.data();

          if (data.turn !== turn) {
            throw new Error(errorMessage);
          }

          const update = {
            turn: turn + 1,
            [prop]: 1,
          };

          transaction.update(docRef, update);
        });
      };

      const promises = [createTransaction(prop1), createTransaction(prop2)];

      try {
        await Promise.all(promises);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(errorMessage);
      }
      const result = await docRef.get();
      should(result.data()).not.have.properties([prop1, prop2]);
    });
  });
});
