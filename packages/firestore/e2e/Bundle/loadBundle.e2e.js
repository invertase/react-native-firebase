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
const { wipe, getBundle, BUNDLE_COLLECTION } = require('../helpers');

describe('firestore().loadBundle()', function () {
  // Not supported on web lite SDK.
  if (Platform.other) {
    return;
  }

  before(async function () {
    return await wipe();
  });

  describe('modular', function () {
    it('loads the bundle contents', async function () {
      const { getFirestore, loadBundle, collection, getDocsFromCache } = firestoreModular;
      const db = getFirestore();

      const bundle = getBundle();
      const task = loadBundle(db, bundle);
      task.onProgress();
      const progress = await task;
      const query = collection(db, BUNDLE_COLLECTION);
      const snapshot = await getDocsFromCache(query);

      progress.taskState.should.eql('Success');
      progress.documentsLoaded.should.eql(6);
      snapshot.size.should.eql(6);
    });

    it('throws if invalid bundle', async function () {
      const { getFirestore, loadBundle } = firestoreModular;

      try {
        await loadBundle(getFirestore(), 'not-a-bundle');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (_) {
        /*
         * Due to inconsistent error throws between Android and iOS Firebase SDK,
         * it is not able to test a specific error message.
         * Android SDK throws 'invalid-arguments', while iOS SDK throws 'unknown'
         */
        return Promise.resolve();
      }
    });
  });
});
