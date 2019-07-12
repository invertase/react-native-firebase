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

describe('firestore.doc().delete()', () => {
  before(() => wipe());

  it('deletes a document', async () => {
    const ref = firebase.firestore().doc('v6/deleteme');
    await ref.set({ foo: 'bar' });
    const snapshot1 = await ref.get();
    snapshot1.id.should.equal('deleteme');
    snapshot1.exists.should.equal(true);
    await ref.delete();
    const snapshot2 = await ref.get();
    snapshot2.id.should.equal('deleteme');
    snapshot2.exists.should.equal(false);
  });
});
