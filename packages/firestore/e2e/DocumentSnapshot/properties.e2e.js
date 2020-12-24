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
const COLLECTION = 'firestore';

describe('firestore().doc() -> snapshot', function () {
  before(function () {
    return wipe();
  });
  it('.exists -> returns a boolean for exists', async function () {
    const ref1 = firebase.firestore().doc(`${COLLECTION}/exists`);
    const ref2 = firebase.firestore().doc(`${COLLECTION}/idonotexist`);
    await ref1.set({ foo: ' bar' });
    const snapshot1 = await ref1.get();
    const snapshot2 = await ref2.get();

    snapshot1.exists.should.equal(true);
    snapshot2.exists.should.equal(false);
    await ref1.delete();
  });

  it('.id -> returns the correct id', async function () {
    const ref1 = firebase.firestore().doc(`${COLLECTION}/exists`);
    const ref2 = firebase.firestore().doc(`${COLLECTION}/idonotexist`);
    await ref1.set({ foo: ' bar' });
    const snapshot1 = await ref1.get();
    const snapshot2 = await ref2.get();

    snapshot1.id.should.equal('exists');
    snapshot2.id.should.equal('idonotexist');
    await ref1.delete();
  });

  it('.metadata -> returns a SnapshotMetadata instance', async function () {
    const ref = firebase.firestore().doc(`${COLLECTION}/exists`);
    const snapshot = await ref.get();
    snapshot.metadata.constructor.name.should.eql('FirestoreSnapshotMetadata');
  });

  it('.ref -> returns the correct document ref', async function () {
    const ref1 = firebase.firestore().doc(`${COLLECTION}/exists`);
    const ref2 = firebase.firestore().doc(`${COLLECTION}/idonotexist`);
    await ref1.set({ foo: ' bar' });
    const snapshot1 = await ref1.get();
    const snapshot2 = await ref2.get();

    snapshot1.ref.path.should.equal(`${COLLECTION}/exists`);
    snapshot2.ref.path.should.equal(`${COLLECTION}/idonotexist`);
    await ref1.delete();
  });
});
