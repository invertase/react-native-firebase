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

describe('firestore.DocumentChange', () => {
  before(() => wipe());

  it('.doc -> returns a DocumentSnapshot', async () => {
    const colRef = firebase.firestore().collection('v6');
    await colRef.add({});
    const snapshot = await colRef.limit(1).get();
    const changes = snapshot.docChanges();

    const docChange = changes[0];

    docChange.doc.constructor.name.should.eql('FirestoreDocumentSnapshot');
  });

  it('returns the correct metadata when adding and removing', async () => {
    const colRef = firebase.firestore().collection('v6/docChanges/docChangesCollection');
    const doc1 = firebase.firestore().doc('v6/docChanges/docChangesCollection/doc1');

    // Set something in the database
    await doc1.set({ name: 'doc1' });

    // Subscribe to changes
    const callback = sinon.spy();
    const unsub = colRef.onSnapshot(callback);
    await Utils.spyToBeCalledOnceAsync(callback);

    // Validate docChange item exists
    callback.should.be.calledOnce();
    const changes1 = callback.args[0][0].docChanges();
    changes1.length.should.eql(1);
    changes1[0].newIndex.should.eql(0);
    changes1[0].oldIndex.should.eql(-1);
    changes1[0].type.should.eql('added');
    changes1[0].doc.data().name.should.eql('doc1');

    // Delete the document
    await doc1.delete();
    await Utils.sleep(800);

    // The QuerySnapshot should be empty
    callback.args[1][0].size.should.eql(0);

    // The docChanges should keep removed doc
    const changes2 = callback.args[1][0].docChanges();
    changes2.length.should.eql(1);

    changes2[0].doc.data().name.should.eql('doc1');
    changes2[0].type.should.eql('removed');
    changes2[0].newIndex.should.eql(-1);
    changes2[0].oldIndex.should.eql(0);

    unsub();
  });

  it('returns the correct metadata when modifying documents', async () => {
    const colRef = firebase.firestore().collection('v6/docChanges/docMovedCollection');

    const doc1 = firebase.firestore().doc('v6/docChanges/docMovedCollection/doc1');
    const doc2 = firebase.firestore().doc('v6/docChanges/docMovedCollection/doc2');
    const doc3 = firebase.firestore().doc('v6/docChanges/docMovedCollection/doc3');

    await Promise.all([doc1.set({ value: 1 }), doc2.set({ value: 2 }), doc3.set({ value: 3 })]);

    // Subscribe to changes
    const callback = sinon.spy();
    const unsub = colRef.orderBy('value').onSnapshot(callback);
    await Utils.spyToBeCalledOnceAsync(callback);

    // Validate docChange item exists
    callback.should.be.calledOnce();
    const changes1 = callback.args[0][0].docChanges();
    changes1.length.should.eql(3);

    changes1.forEach((dc, i) => {
      dc.oldIndex.should.eql(-1);
      dc.newIndex.should.eql(i);
      dc.doc.data().value.should.eql(i + 1);
    });

    // Update a document
    await doc1.update({ value: 4 });

    await Utils.sleep(800);

    const changes2 = callback.args[1][0].docChanges();
    changes2.length.should.eql(1);

    const dc = changes2[0];
    dc.type.should.eql('modified');
    dc.oldIndex.should.eql(0);
    dc.newIndex.should.eql(2);

    unsub();
  });
});
