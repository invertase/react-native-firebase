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

describe('firestore.QuerySnapshot', () => {
  it('is returned from a collection get()', async () => {
    const snapshot = await firebase.firestore().collection('v6')
      .get();

    snapshot.constructor.name.should.eql('FirestoreQuerySnapshot');
  });

  it('is returned from a collection onSnapshot()', async () => {
    const callback = sinon.spy();
    firebase.firestore().collection('v6')
      .onSnapshot(callback);
    await Utils.sleep(800);
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
    // TODO is this correct? CollectionReference extends Query?
    snapshot.query.constructor.name.should.eql('FirestoreCollectionReference');
  });

  it('returns size as a number', async () => {
    const colRef = firebase.firestore().collection('v6');
    const snapshot = await colRef.get();
    snapshot.size.should.be.Number();
  });

  // TODO
  xdescribe('docChanges()', () => {

  });

  describe('forEach()', () => {
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

  // TODO
  xdescribe('isEqual()', () => {

  });
});
