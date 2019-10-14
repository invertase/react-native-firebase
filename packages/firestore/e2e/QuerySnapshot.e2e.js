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

const { wipe } = require('./helpers');

describe('firestore.QuerySnapshot', () => {
  before(() => wipe());

  it('is returned from a collection get()', async () => {
    const snapshot = await firebase
      .firestore()
      .collection('v6')
      .get();

    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
  });

  it('is returned from a collection onSnapshot()', async () => {
    const callback = sinon.spy();
    firebase
      .firestore()
      .collection('v6')
      .onSnapshot(callback);
    await Utils.spyToBeCalledOnceAsync(callback);
    callback.args[0][0].constructor.name.should.eql('FirestoreQuerySnapshot');
  });

  it('returns an array of DocumentSnapshots', async () => {
    const colRef = firebase.firestore().collection('v6');
    await colRef.add({});
    const snapshot = await colRef.get();
    snapshot.docs.should.be.Array();
    snapshot.docs.length.should.be.aboveOrEqual(1);
    snapshot.docs[0].constructor.name.should.eql('FirestoreDocumentSnapshot');
  });

  it('returns false if not empty', async () => {
    const colRef = firebase.firestore().collection('v6');
    await colRef.add({});
    const snapshot = await colRef.get();
    snapshot.empty.should.be.Boolean();
    snapshot.empty.should.be.False();
  });

  it('returns true if empty', async () => {
    const colRef = firebase.firestore().collection('v6/foo/emptycollection');
    const snapshot = await colRef.get();
    snapshot.empty.should.be.Boolean();
    snapshot.empty.should.be.True();
  });

  it('returns a SnapshotMetadata instance', async () => {
    const colRef = firebase.firestore().collection('v6');
    const snapshot = await colRef.get();
    snapshot.metadata.constructor.name.should.eql('FirestoreSnapshotMetadata');
  });

  it('returns a Query instance', async () => {
    const colRef = firebase.firestore().collection('v6');
    const snapshot = await colRef.get();
    snapshot.query.constructor.name.should.eql('FirestoreCollectionReference');
  });

  it('returns size as a number', async () => {
    const colRef = firebase.firestore().collection('v6');
    const snapshot = await colRef.get();
    snapshot.size.should.be.Number();
  });

  describe('docChanges()', () => {
    it('throws if options is not an object', async () => {
      try {
        const colRef = firebase.firestore().collection('v6');
        const snapshot = await colRef.limit(1).get();
        snapshot.docChanges(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'options' expected an object");
        return Promise.resolve();
      }
    });

    it('throws if options.includeMetadataChanges is not a boolean', async () => {
      try {
        const colRef = firebase.firestore().collection('v6');
        const snapshot = await colRef.limit(1).get();
        snapshot.docChanges({ includeMetadataChanges: 123 });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'options.includeMetadataChanges' expected a boolean");
        return Promise.resolve();
      }
    });

    it('throws if options.includeMetadataChanges is true, but snapshot does not include those changes', async () => {
      const callback = sinon.spy();
      const colRef = firebase.firestore().collection('v6');
      const unsub = colRef.onSnapshot(
        {
          includeMetadataChanges: false,
        },
        callback,
      );
      await Utils.spyToBeCalledOnceAsync(callback);
      unsub();
      const snapshot = callback.args[0][0];

      try {
        snapshot.docChanges({ includeMetadataChanges: true });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql('To include metadata changes with your document changes');
        return Promise.resolve();
      }
    });

    it('returns an array of DocumentChange instances', async () => {
      const colRef = firebase.firestore().collection('v6');
      colRef.add({});
      const snapshot = await colRef.limit(1).get();
      const changes = snapshot.docChanges();
      changes.should.be.Array();
      changes.length.should.be.eql(1);
      changes[0].constructor.name.should.eql('FirestoreDocumentChange');
    });

    // TODO: fixme @ehesp - flaky test: `AssertionError: expected 3 to equal 1` on  line 155
    xit('returns the correct number of document changes if listening to metadata changes', async () => {
      const callback = sinon.spy();
      const colRef = firebase.firestore().collection('v6/metadatachanges/true-true');
      const unsub = colRef.onSnapshot({ includeMetadataChanges: true }, callback);
      await colRef.add({ foo: 'bar' });
      await Utils.spyToBeCalledTimesAsync(callback, 3);
      unsub();

      const snap1 = callback.args[0][0];
      const snap2 = callback.args[1][0];
      const snap3 = callback.args[2][0];

      snap1.docChanges({ includeMetadataChanges: true }).length.should.be.eql(1);
      snap2.docChanges({ includeMetadataChanges: true }).length.should.be.eql(0);
      snap3.docChanges({ includeMetadataChanges: true }).length.should.be.eql(1);
    });

    // TODO: fixme @ehesp - flaky test: `AssertionError: expected 5 to equal 1`
    xit('returns the correct number of document changes if listening to metadata changes, but not including them in docChanges', async () => {
      const callback = sinon.spy();
      const colRef = firebase.firestore().collection('v6/metadatachanges/true-false');
      const unsub = colRef.onSnapshot({ includeMetadataChanges: true }, callback);
      await colRef.add({ foo: 'bar' });
      await Utils.spyToBeCalledTimesAsync(callback, 3);
      unsub();

      const snap1 = callback.args[0][0];
      const snap2 = callback.args[1][0];
      const snap3 = callback.args[2][0];

      snap1.docChanges({ includeMetadataChanges: false }).length.should.be.eql(1);
      snap2.docChanges({ includeMetadataChanges: false }).length.should.be.eql(0);
      snap3.docChanges({ includeMetadataChanges: false }).length.should.be.eql(0);
    });
  });

  describe('forEach()', () => {
    it('throws if callback is not a function', async () => {
      try {
        const colRef = firebase.firestore().collection('v6');
        const snapshot = await colRef.limit(1).get();
        snapshot.forEach(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'callback' expected a function");
        return Promise.resolve();
      }
    });

    it('calls back a function', async () => {
      const colRef = firebase.firestore().collection('v6');
      colRef.add({});
      colRef.add({});
      const snapshot = await colRef.limit(2).get();
      const callback = sinon.spy();
      snapshot.forEach.should.be.Function();
      snapshot.forEach(callback);
      callback.should.be.calledTwice();
      callback.args[0][0].constructor.name.should.eql('FirestoreDocumentSnapshot');
      callback.args[0][1].should.be.Number();
      callback.args[1][0].constructor.name.should.eql('FirestoreDocumentSnapshot');
      callback.args[1][1].should.be.Number();
    });

    it('provides context to the callback', async () => {
      const colRef = firebase.firestore().collection('v6');
      colRef.add({});
      const snapshot = await colRef.limit(1).get();
      const callback = sinon.spy();
      snapshot.forEach.should.be.Function();
      class Foo {}
      snapshot.forEach(callback, Foo);
      callback.should.be.calledOnce();
      callback.firstCall.thisValue.should.eql(Foo);
    });
  });

  describe('isEqual()', () => {
    it('throws if other is not a QuerySnapshot', async () => {
      try {
        const qs = await firebase
          .firestore()
          .collection('v6')
          .get();
        qs.isEqual(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'other' expected a QuerySnapshot instance");
        return Promise.resolve();
      }
    });

    it('returns false if not equal (simple checks)', async () => {
      const colRef = firebase.firestore().collection('v6');
      // Ensure a doc exists
      await colRef.add({});

      const qs = await colRef.get();

      const querySnap1 = await firebase
        .firestore()
        .collection('v6/querysnapshot/querySnapshotIsEqual')
        .get();

      const eq1 = qs.isEqual(querySnap1);

      eq1.should.be.False();
    });

    it('returns false if not equal (expensive checks)', async () => {
      const colRef = firebase.firestore().collection('v6/querysnapshot/querySnapshotIsEqual-False');
      // Ensure a doc exists
      const docRef = colRef.doc('firstdoc');
      await docRef.set({
        foo: 'bar',
        bar: {
          foo: 1,
        },
      });

      // Grab snapshot
      const qs1 = await colRef.get();

      // Update same collection
      await docRef.update({
        bar: {
          foo: 2,
        },
      });

      const qs2 = await colRef.get();

      const eq1 = qs1.isEqual(qs2);

      eq1.should.be.False();
    });

    it('returns true when equal', async () => {
      const colRef = firebase.firestore().collection('v6/querysnapshot/querySnapshotIsEqual-True');

      await Promise.all([
        colRef.add({ foo: 'bar' }),
        colRef.add({ foo: 1 }),
        colRef.add({
          foo: {
            foo: 'bar',
          },
        }),
      ]);

      const qs1 = await colRef.get();
      const qs2 = await colRef.get();

      const eq = qs1.isEqual(qs2);

      eq.should.be.True();
    });
  });
});
