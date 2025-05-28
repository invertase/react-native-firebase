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

describe('firestore().onSnapshotsInSync() modular', function () {
  if (Platform.other) return;

  const { getFirestore, doc, onSnapshot, onSnapshotsInSync, setDoc } = firestoreModular;
  const TEST_DOC = `${COLLECTION}/modular_sync_test`;

  it('onSnapshotsInSync after a snapshot is delivered', async function () {
    const db = getFirestore();
    const docRef = doc(db, TEST_DOC);

    const snapshotSpy = sinon.spy();
    const syncSpy = sinon.spy();

    // Set initial data
    await setDoc(docRef, { foo: 'initial' });

    // Subscribe to snapshot and sync
    const unsubSnapshot = onSnapshot(docRef, snapshotSpy);
    const unsubSync = onSnapshotsInSync(db, syncSpy);

    // Trigger change
    await setDoc(docRef, { foo: 'updated' });

    // Wait for both
    await Utils.spyToBeCalledOnceAsync(snapshotSpy);
    await Utils.spyToBeCalledOnceAsync(syncSpy);

    snapshotSpy.should.be.calledOnce();
    syncSpy.should.be.calledOnce();

    unsubSnapshot();
    unsubSync();
  });

  it('should not fire sync after unsubscribe', async function () {
    const db = getFirestore();
    const syncSpy = sinon.spy();

    const unsubSync = onSnapshotsInSync(db, syncSpy);
    unsubSync();

    await Utils.sleep(1000);

    await setDoc(doc(db, `${COLLECTION}/modular_sync_test_unsub`), { foo: 'change' });

    await Utils.sleep(1000);

    syncSpy.should.not.be.called();
  });
});

