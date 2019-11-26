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

const { PATH, wipe } = require('./helpers');

const TEST_PATH = `${PATH}/issues`;

describe('database issues', () => {
  after(() => wipe(TEST_PATH));

  it('#2813 should return a null snapshot key if path is root', async () => {
    const ref = firebase.database().ref();
    const snapshot = await ref.once('value');
    should.equal(snapshot.key, null);
  });

  it('#100 array should return null where key is missing', async () => {
    const ref = firebase.database().ref(`${TEST_PATH}/issue_100`);

    const data = {
      1: {
        someKey: 'someValue',
        someOtherKey: 'someOtherValue',
      },
      2: {
        someKey: 'someValue',
        someOtherKey: 'someOtherValue',
      },
      3: {
        someKey: 'someValue',
        someOtherKey: 'someOtherValue',
      },
    };

    await ref.set(data);
    const snapshot = await ref.once('value');

    snapshot
      .val()
      .should.eql(
        jet.contextify([
          null,
          jet.contextify(data[1]),
          jet.contextify(data[2]),
          jet.contextify(data[3]),
        ]),
      );
  });

  describe('#108 filters correctly by float values', () => {
    it('returns filtered results', async () => {
      const ref = firebase.database().ref(`${TEST_PATH}/issue_108/filter`);

      const data = {
        foobar: {
          name: 'Foobar Pizzas',
          latitude: 34.1013717,
        },
        notTheFoobar: {
          name: "Not the pizza you're looking for",
          latitude: 34.456787,
        },
        notAFloat: {
          name: 'Not a float',
          latitude: 37,
        },
      };

      await ref.set(data);
      const snapshot = await ref
        .orderByChild('latitude')
        .startAt(34.00867000999119)
        .endAt(34.17462960866099)
        .once('value');

      const val = snapshot.val();
      val.foobar.should.eql(jet.contextify(data.foobar));

      should.equal(Object.keys(val).length, 1);
    });

    it('returns correct results when not using float values', async () => {
      const ref = firebase.database().ref(`${TEST_PATH}/issue_108/integer`);

      const data = {
        foobar: {
          name: 'Foobar Pizzas',
          latitude: 34.1013717,
        },
        notTheFoobar: {
          name: "Not the pizza you're looking for",
          latitude: 34.456787,
        },
        notAFloat: {
          name: 'Not a float',
          latitude: 37,
        },
      };

      await ref.set(data);
      const snapshot = await ref
        .orderByChild('latitude')
        .equalTo(37)
        .once('value');

      const val = snapshot.val();

      val.notAFloat.should.eql(jet.contextify(data.notAFloat));

      should.equal(Object.keys(val).length, 1);
    });
  });

  it('#489 reutrns long numbers correctly', async () => {
    const LONG = 1508777379000;
    const ref = firebase.database().ref(`${TEST_PATH}/issue_489`);
    await ref.set(LONG);
    const snapshot = await ref.once('value');
    snapshot.val().should.eql(LONG);
  });
});
