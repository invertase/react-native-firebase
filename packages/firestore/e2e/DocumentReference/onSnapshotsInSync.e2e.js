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
const { wipe } = require('../helpers');
import { onSnapshotsInSync } from '../../lib/modular/snapshot';

describe('firestore().doc().onSnapshot()', function () {
  before(function () {
    return wipe();
  });

  describe('modular', function () {
    it('onSnapshotsInSync() returns an unsubscribe function', function () {
        const firestore = firebase.firestore();
        const unsubscribe = onSnapshotsInSync(firestore);
    
        expect(unsubscribe).to.be.a('function');
        expect(unsubscribe()).to.equal(undefined);
    });
  });

  it('onSnapshotsInSync fires after listeners are in sync', () => {
    const testDocs = {
      a: { foo: 1 }
    };
    return withTestCollection(persistence, testDocs, async (coll, db) => {
      let events = [];
      const gotInitialSnapshot = (() => {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return { promise, resolve, reject };
      })();
      const docA = doc(coll, 'a');

      onSnapshot(docA, snap => {
        events.push('doc');
        gotInitialSnapshot.resolve();
      });
      await gotInitialSnapshot.promise;
      events = [];

      const done = (() => {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return { promise, resolve, reject };
      })();
      onSnapshotsInSync(db, () => {
        events.push('snapshots-in-sync');
        if (events.length === 3) {
          // We should have an initial snapshots-in-sync event, then a snapshot
          // event for set(), then another event to indicate we're in sync
          // again.
          expect(events).to.deep.equal([
            'snapshots-in-sync',
            'doc',
            'snapshots-in-sync'
          ]);
          done.resolve();
        }
      });

      await setDoc(docA, { foo: 3 });
      await done.promise;
    });
  });
});
