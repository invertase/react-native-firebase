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

const { PATH, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/on`;

describe('onChildMoved', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  // FIXME super flaky on ios simulator
  // FIXME errors on 'Other' platforms with a missing index on 'nuggets'
  it('should stop listening if ListeningOptions.onlyOnce is true', async function () {
    if (Platform.ios || Platform.other) {
      this.skip();
    }

    const { getDatabase, ref, query, orderByChild, set, child, onChildMoved } = databaseModular;
    const dbRef = ref(getDatabase(), `${TEST_PATH}/childMoved`);
    const orderedRef = query(dbRef, orderByChild('nuggets'));

    const callback = sinon.spy();

    const initial = {
      alex: { nuggets: 60 },
      rob: { nuggets: 56 },
      vassili: { nuggets: 55.5 },
      tony: { nuggets: 52 },
      greg: { nuggets: 52 },
    };

    onChildMoved(
      orderedRef,
      $ => {
        callback($.val());
      },
      { onlyOnce: true },
    );

    await set(dbRef, initial);
    await set(child(dbRef, 'greg/nuggets'), 57);
    await set(child(dbRef, 'rob/nuggets'), 61);
    await Utils.spyToBeCalledTimesAsync(callback, 1);
    callback.should.be.calledWith({ nuggets: 57 });
  });

  // FIXME errors on 'Other' platforms with a missing index on 'nuggets'
  it('subscribe to child moved events', async function () {
    if (Platform.other) {
      this.skip();
    }
    const { getDatabase, ref, query, orderByChild, onChildMoved, set, child } = databaseModular;

    const callback = sinon.spy();
    const dbRef = ref(getDatabase(), `${TEST_PATH}/childMoved2`);
    const orderedRef = query(dbRef, orderByChild('nuggets'));

    const initial = {
      alex: { nuggets: 60 },
      rob: { nuggets: 56 },
      vassili: { nuggets: 55.5 },
      tony: { nuggets: 52 },
      greg: { nuggets: 52 },
    };

    const unsubscribe = onChildMoved(orderedRef, $ => {
      callback($.val());
    });

    await set(dbRef, initial);
    await set(child(dbRef, 'greg/nuggets'), 57);
    await set(child(dbRef, 'rob/nuggets'), 61);
    await Utils.spyToBeCalledTimesAsync(callback, 2);
    unsubscribe();

    callback.getCall(0).args[0].should.be.eql(jet.contextify({ nuggets: 57 }));
    callback.getCall(1).args[0].should.be.eql(jet.contextify({ nuggets: 61 }));
  });
});
