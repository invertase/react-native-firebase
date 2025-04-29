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
        const unsubscribe = firestore.onSnapshotsInSync(function () {});
    
        expect(unsubscribe).to.be.a('function');
        expect(unsubscribe()).to.equal(undefined);
    });
  });
});
