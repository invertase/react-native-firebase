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

const TEST_PATH = `${PATH}/transaction`;
const NOOP = () => {};

describe('database().ref().transaction()', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('v8 compatibility', function () {
    it('throws if no transactionUpdate is provided', async function () {
      try {
        await firebase.database().ref(TEST_PATH).transaction();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'transactionUpdate' must be a function");
        return Promise.resolve();
      }
    });

    it('throws if onComplete is not a function', async function () {
      try {
        await firebase.database().ref().transaction(NOOP, 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'onComplete' must be a function if provided");
        return Promise.resolve();
      }
    });

    it('throws if applyLocally is not a boolean', async function () {
      try {
        await firebase.database().ref().transaction(NOOP, NOOP, 'foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'applyLocally' must be a boolean value if provided");
        return Promise.resolve();
      }
    });

    it('updates the value via a transaction', async function () {
      const ref = firebase.database().ref(`${TEST_PATH}/transactionUpdate`);
      const beforeValue = (await ref.once('value')).val() || 0;
      const { committed, snapshot } = await ref.transaction(value => {
        if (!value) {
          return 1;
        }
        return value + 1;
      });

      should.equal(committed, true, 'Transaction did not commit.');
      snapshot.val().should.equal(beforeValue + 1);
    });

    it('aborts transaction if undefined returned', async function () {
      const ref = firebase.database().ref(`${TEST_PATH}/transactionAbort`);
      await ref.set(1);

      return new Promise((resolve, reject) => {
        ref.transaction(
          () => {
            return undefined;
          },
          (error, committed) => {
            if (error) {
              return reject(error);
            }

            if (!committed) {
              return resolve();
            }

            return reject(new Error('Transaction did not abort commit.'));
          },
        );
      });
    });

    // FIXME flaky on android local against emulator?
    it('passes valid data through the callback', async function () {
      if (Platform.ios || Platform.other) {
        const ref = firebase.database().ref(`${TEST_PATH}/transactionCallback`);
        await ref.set(1);

        return new Promise((resolve, reject) => {
          ref.transaction(
            $ => {
              return $ + 1;
            },
            (error, committed, snapshot) => {
              if (error) {
                return reject(error);
              }

              if (!committed) {
                return reject(new Error('Transaction aborted when it should not have done'));
              }

              should.equal(snapshot.val(), 2);
              return resolve();
            },
          );
        });
      } else {
        this.skip();
      }
    });

    // FIXME flaky on android local against emulator?
    it('throws when an error occurs', async function () {
      if (Platform.ios || Platform.other) {
        const ref = firebase.database().ref('nope');

        try {
          await ref.transaction($ => {
            return $ + 1;
          });
          return Promise.reject(new Error('Did not throw error.'));
        } catch (error) {
          error.message.should.containEql('permission');
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    // FIXME flaky on android in CI? works most of the time...
    it('passes error back to the callback', async function () {
      if (Platform.ios || !global.isCI || Platform.other) {
        const ref = firebase.database().ref('nope');

        return new Promise((resolve, reject) => {
          ref
            .transaction(
              $ => {
                return $ + 1;
              },
              (error, committed, snapshot) => {
                if (snapshot !== null) {
                  return reject(new Error('Snapshot should not be available'));
                }

                if (committed === true) {
                  return reject(new Error('Transaction should not have committed'));
                }

                error.message.should.containEql('permission');
                return resolve();
              },
            )
            .catch(e => {
              return reject(e);
            });
        });
      } else {
        this.skip();
      }
    });

    it('sets a value if one does not exist', async function () {
      const ref = firebase.database().ref(`${TEST_PATH}/transactionCreate`);
      await ref.remove();
      const value = Date.now();

      return new Promise((resolve, reject) => {
        ref.transaction(
          $ => {
            if ($ === null) {
              return { foo: value };
            }

            throw new Error('Value should not exist');
          },
          (error, committed, snapshot) => {
            if (error) {
              return reject(error);
            }

            if (!committed) {
              return reject(new Error('Transaction should have committed'));
            }

            snapshot.val().should.eql(
              jet.contextify({
                foo: value,
              }),
            );
            return resolve();
          },
        );
      });
    });
  });

  describe('modular', function () {
    it('throws if no transactionUpdate is provided', async function () {
      const { getDatabase, ref, runTransaction } = databaseModular;

      try {
        await runTransaction(ref(getDatabase(), TEST_PATH));
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'transactionUpdate' must be a function");
        return Promise.resolve();
      }
    });

    it('throws if options.applyLocally is not a boolean', async function () {
      const { getDatabase, ref, runTransaction } = databaseModular;

      try {
        await runTransaction(ref(getDatabase(), TEST_PATH), NOOP, { applyLocally: 'foo' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'applyLocally' must be a boolean value if provided");
        return Promise.resolve();
      }
    });

    it('updates the value via a transaction', async function () {
      const { getDatabase, get, ref, runTransaction } = databaseModular;
      const dbRef = ref(getDatabase(), `${TEST_PATH}/transactionUpdate`);
      const beforeValue = (await get(dbRef)).val() || 0;
      const { committed, snapshot } = await runTransaction(dbRef, value => {
        if (!value) {
          return 1;
        }
        return value + 1;
      });

      should.equal(committed, true, 'Transaction did not commit.');
      snapshot.val().should.equal(beforeValue + 1);
    });

    it('aborts transaction if undefined returned', async function () {
      const { getDatabase, set, ref, runTransaction } = databaseModular;

      const dbRef = ref(getDatabase(), `${TEST_PATH}/transactionAbort`);
      await set(dbRef, 1);

      const { committed } = await runTransaction(dbRef, () => {
        return undefined;
      });

      if (!committed) {
        return;
      }

      throw new Error('Transaction did not abort commit.');
    });

    // FIXME flaky on android local against emulator?
    it('throws when an error occurs', async function () {
      if (Platform.ios || Platform.other) {
        const { getDatabase, ref, runTransaction } = databaseModular;

        const dbRef = ref(getDatabase(), 'nope');

        try {
          await runTransaction(dbRef, $ => {
            return $ + 1;
          });
          return Promise.reject(new Error('Did not throw error.'));
        } catch (error) {
          error.message.should.containEql('permission');
          return Promise.resolve();
        }
      } else {
        this.skip();
      }
    });

    it('sets a value if one does not exist', async function () {
      const { getDatabase, ref, runTransaction } = databaseModular;

      const dbRef = ref(getDatabase(), `${TEST_PATH}/transactionCreate`);
      await dbRef.remove();

      const value = Date.now();

      const { committed, snapshot } = await runTransaction(dbRef, $ => {
        if ($ === null) {
          return { foo: value };
        }

        throw new Error('Value should not exist');
      });

      if (!committed) {
        throw new Error('Transaction should have committed');
      }

      snapshot.val().should.eql(
        jet.contextify({
          foo: value,
        }),
      );
    });
  });
});
