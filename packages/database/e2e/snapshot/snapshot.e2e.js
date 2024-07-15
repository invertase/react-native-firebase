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

const { PATH, CONTENT, seed, wipe } = require('../helpers');

const TEST_PATH = `${PATH}/snapshot`;

describe('database()...snapshot', function () {
  before(async function () {
    await seed(TEST_PATH);
  });

  after(async function () {
    await wipe(TEST_PATH);
  });

  describe('v8 compatibility', function () {
    it('returns the snapshot key', async function () {
      const snapshot = await firebase
        .database()
        .ref(TEST_PATH)
        .child('types/boolean')
        .once('value');

      snapshot.key.should.equal('boolean');
    });

    it('returns the snapshot reference', async function () {
      const snapshot = await firebase
        .database()
        .ref(TEST_PATH)
        .child('types/boolean')
        .once('value');

      snapshot.ref.key.should.equal('boolean');
    });

    it('returns the correct boolean for exists', async function () {
      const snapshot1 = await firebase
        .database()
        .ref(TEST_PATH)
        .child('types/boolean')
        .once('value');

      const snapshot2 = await firebase.database().ref(TEST_PATH).child('types/nope').once('value');

      snapshot1.exists().should.equal(true);
      snapshot2.exists().should.equal(false);
    });

    it('exports a valid object', async function () {
      const snapshot = await firebase.database().ref(TEST_PATH).child('types/string').once('value');

      const exported = snapshot.exportVal();

      exported.should.have.property('.value');
      exported.should.have.property('.priority');
      exported['.value'].should.equal('foobar');
      should.equal(exported['.priority'], null);
    });

    it('exports a valid object with a object value', async function () {
      const snapshot = await firebase.database().ref(TEST_PATH).child('types/object').once('value');

      const exported = snapshot.exportVal();

      exported.should.have.property('.value');
      exported.should.have.property('.priority');
      exported['.value'].should.eql(jet.contextify(CONTENT.TYPES.object));
      should.equal(exported['.priority'], null);
    });

    it('forEach throws if action param is not a function', async function () {
      const ref = firebase.database().ref(TEST_PATH).child('unorderedList');

      await ref.set({
        a: 3,
        b: 1,
        c: 2,
      });

      const snapshot = await ref.orderByValue().once('value');

      try {
        snapshot.forEach('foo');
      } catch (error) {
        error.message.should.containEql("'action' must be a function");
      }
    });

    it('forEach returns an ordered list of snapshots', async function () {
      const ref = firebase.database().ref(TEST_PATH).child('unorderedList');

      await ref.set({
        a: 3,
        b: 1,
        c: 2,
      });

      const snapshot = await ref.orderByValue().once('value');
      const expected = ['b', 'c', 'a'];

      snapshot.forEach((childSnap, i) => {
        childSnap.val().should.equal(i + 1);
        childSnap.key.should.equal(expected[i]);
      });
    });

    it('forEach works with arrays', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref(TEST_PATH).child('types');

      const snapshot = await ref.once('value');

      snapshot.child('array').forEach((childSnap, i) => {
        callback();
        childSnap.val().should.equal(i);
        childSnap.key.should.equal(i.toString());
      });

      callback.should.be.callCount(snapshot.child('array').numChildren());
    });

    it('forEach works with objects and cancels when returning true', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref(TEST_PATH).child('types/object').orderByKey();

      const snapshot = await ref.once('value');

      snapshot.forEach(childSnap => {
        callback();
        childSnap.key.should.equal('bar');
        childSnap.val().should.equal('baz');
        return true;
      });

      callback.should.be.calledOnce();
    });

    it('forEach works with arrays and cancels when returning true', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref(TEST_PATH).child('types');

      const snapshot = await ref.once('value');

      snapshot.child('array').forEach(childSnap => {
        callback();
        childSnap.val().should.equal(0);
        childSnap.key.should.equal('0');
        return true;
      });

      callback.should.be.calledOnce();
    });

    it('forEach returns false when no child keys', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref(TEST_PATH).child('types/boolean');

      const snapshot = await ref.once('value');

      const bool = snapshot.forEach(() => {
        callback();
      });

      bool.should.equal(false);
      callback.should.be.callCount(0);
    });

    it('forEach cancels iteration when returning true', async function () {
      const callback = sinon.spy();
      const ref = firebase.database().ref(TEST_PATH).child('types/array');

      const snapshot = await ref.orderByValue().once('value');

      const cancelled = snapshot.forEach(childSnap => {
        callback(childSnap.val());
        return true;
      });

      cancelled.should.equal(true);
      callback.should.be.callCount(1);
      callback.getCall(0).args[0].should.equal(0);
    });

    it('getPriority returns the correct value', async function () {
      const ref = firebase.database().ref(TEST_PATH).child('getPriority');

      await ref.setWithPriority('foo', 'bar');
      const snapshot = await ref.once('value');

      snapshot.getPriority().should.equal('bar');
    });

    it('hasChild throws if path is not a string value', async function () {
      const ref = firebase.database().ref(TEST_PATH).child('types/boolean');

      const snapshot = await ref.once('value');

      try {
        snapshot.hasChild({ foo: 'bar' });
      } catch (error) {
        error.message.should.containEql("'path' must be a string value");
      }
    });

    it('hasChild returns the correct boolean value', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      const snapshot1 = await ref.child('types/boolean').once('value');
      const snapshot2 = await ref.child('types').once('value');

      snapshot1.hasChild('foo').should.equal(false);
      snapshot2.hasChild('boolean').should.equal(true);
    });

    it('hasChildren returns the correct boolean value', async function () {
      const ref = firebase.database().ref(TEST_PATH);
      const snapshot = await ref.child('types/object').once('value');
      snapshot.hasChildren().should.equal(true);
    });

    it('numChildren returns the correct number value', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      const snapshot1 = await ref.child('types/boolean').once('value');
      const snapshot2 = await ref.child('types/array').once('value');
      const snapshot3 = await ref.child('types/object').once('value');

      snapshot1.numChildren().should.equal(0);
      snapshot2.numChildren().should.equal(CONTENT.TYPES.array.length);
      snapshot3.numChildren().should.equal(Object.keys(CONTENT.TYPES.object).length);
    });

    it('toJSON returns the value of the snapshot', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      const snapshot1 = await ref.child('types/string').once('value');
      const snapshot2 = await ref.child('types/object').once('value');

      snapshot1.toJSON().should.equal('foobar');
      snapshot2.toJSON().should.eql(jet.contextify(CONTENT.TYPES.object));
    });

    it('val returns the value of the snapshot', async function () {
      const ref = firebase.database().ref(TEST_PATH);

      const snapshot1 = await ref.child('types/string').once('value');
      const snapshot2 = await ref.child('types/object').once('value');

      snapshot1.val().should.equal('foobar');
      snapshot2.val().should.eql(jet.contextify(CONTENT.TYPES.object));
    });

    it('should return the correct priority for the child snapshots', async function () {
      if (Platform.other) {
        // TODO - remove once "other" is fully integrated
        this.skip();
      }
      const ref = firebase.database().ref(TEST_PATH).child('get-priority-children');
      const child1 = ref.child('child1');
      const child2 = ref.child('child2');
      const child3 = ref.child('child3');

      await Promise.all([
        child1.set({ foo: 'bar' }),
        child2.set({ foo: 'bar' }),
        child3.set({ foo: 'bar' }),
      ]);

      await child1.setPriority(1);
      await child2.setPriority(2);
      await child3.setPriority(3);

      const snapshot = await ref.once('value');
      snapshot.child('child1').getPriority().should.equal(1);
      snapshot.child('child2').getPriority().should.equal(2);
      snapshot.child('child3').getPriority().should.equal(3);
    });
  });

  describe('modular', function () {
    it('returns the snapshot key', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const snapshot = await get(child(ref(getDatabase(), TEST_PATH), 'types/boolean'));

      snapshot.key.should.equal('boolean');
    });

    it('returns the snapshot reference', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const snapshot = await get(child(ref(getDatabase(), TEST_PATH), 'types/boolean'));

      snapshot.ref.key.should.equal('boolean');
    });

    it('returns the correct boolean for exists', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const snapshot1 = await get(child(ref(getDatabase(), TEST_PATH), 'types/boolean'));

      const snapshot2 = await get(child(ref(getDatabase(), TEST_PATH), 'types/nope'));

      snapshot1.exists().should.equal(true);
      snapshot2.exists().should.equal(false);
    });

    it('exports a valid object', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const snapshot = await get(child(ref(getDatabase(), TEST_PATH), 'types/string'));

      const exported = snapshot.exportVal();

      exported.should.have.property('.value');
      exported.should.have.property('.priority');
      exported['.value'].should.equal('foobar');
      should.equal(exported['.priority'], null);
    });

    it('exports a valid object with a object value', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const snapshot = await get(child(ref(getDatabase(), TEST_PATH), 'types/object'));

      const exported = snapshot.exportVal();

      exported.should.have.property('.value');
      exported.should.have.property('.priority');
      exported['.value'].should.eql(jet.contextify(CONTENT.TYPES.object));
      should.equal(exported['.priority'], null);
    });

    it('forEach throws if action param is not a function', async function () {
      const { getDatabase, ref, child, set, get, orderByValue, query } = databaseModular;

      const dbRef = child(ref(getDatabase(), TEST_PATH), 'unorderedList');

      await set(dbRef, {
        a: 3,
        b: 1,
        c: 2,
      });

      const snapshot = await get(query(dbRef, orderByValue()));

      try {
        snapshot.forEach('foo');
      } catch (error) {
        error.message.should.containEql("'action' must be a function");
      }
    });

    it('forEach returns an ordered list of snapshots', async function () {
      const { getDatabase, ref, child, set, get, orderByValue, query } = databaseModular;

      const dbRef = child(ref(getDatabase(), TEST_PATH), 'unorderedList');

      await set(dbRef, {
        a: 3,
        b: 1,
        c: 2,
      });

      const snapshot = await get(query(dbRef, orderByValue()));
      const expected = ['b', 'c', 'a'];

      snapshot.forEach((childSnap, i) => {
        childSnap.val().should.equal(i + 1);
        childSnap.key.should.equal(expected[i]);
      });
    });

    it('forEach works with arrays', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const callback = sinon.spy();
      const dbRef = child(ref(getDatabase(), TEST_PATH), 'types');

      const snapshot = await get(dbRef);

      snapshot.child('array').forEach((childSnap, i) => {
        callback();
        childSnap.val().should.equal(i);
        childSnap.key.should.equal(i.toString());
      });

      callback.should.be.callCount(snapshot.child('array').numChildren());
    });

    it('forEach works with objects and cancels when returning true', async function () {
      const { getDatabase, ref, child, orderByKey, query, get } = databaseModular;

      const callback = sinon.spy();
      const dbRef = query(child(ref(getDatabase(), TEST_PATH), 'types/object'), orderByKey());

      const snapshot = await get(dbRef);

      snapshot.forEach(childSnap => {
        callback();
        childSnap.key.should.equal('bar');
        childSnap.val().should.equal('baz');
        return true;
      });

      callback.should.be.calledOnce();
    });

    it('forEach works with arrays and cancels when returning true', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const callback = sinon.spy();
      const dbRef = child(ref(getDatabase(), TEST_PATH), 'types');

      const snapshot = await get(dbRef);

      snapshot.child('array').forEach(childSnap => {
        callback();
        childSnap.val().should.equal(0);
        childSnap.key.should.equal('0');
        return true;
      });

      callback.should.be.calledOnce();
    });

    it('forEach returns false when no child keys', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const callback = sinon.spy();
      const dbRef = child(ref(getDatabase(), TEST_PATH), 'types/boolean');

      const snapshot = await get(dbRef);

      const bool = snapshot.forEach(() => {
        callback();
      });

      bool.should.equal(false);
      callback.should.be.callCount(0);
    });

    it('forEach cancels iteration when returning true', async function () {
      const { getDatabase, ref, child, orderByValue, query, get } = databaseModular;

      const callback = sinon.spy();
      const dbRef = child(ref(getDatabase(), TEST_PATH), 'types/array');

      const snapshot = await get(query(dbRef, orderByValue()));

      const cancelled = snapshot.forEach(childSnap => {
        callback(childSnap.val());
        return true;
      });

      cancelled.should.equal(true);
      callback.should.be.callCount(1);
      callback.getCall(0).args[0].should.equal(0);
    });

    it('getPriority returns the correct value', async function () {
      const { getDatabase, ref, child, setWithPriority, get } = databaseModular;

      const dbRef = child(ref(getDatabase(), TEST_PATH), 'getPriority');

      await setWithPriority(dbRef, 'foo', 'bar');
      const snapshot = await get(dbRef);

      snapshot.getPriority().should.equal('bar');
    });

    it('hasChild throws if path is not a string value', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const dbRef = child(ref(getDatabase(), TEST_PATH), 'types/boolean');

      const snapshot = await get(dbRef);

      try {
        snapshot.hasChild({ foo: 'bar' });
      } catch (error) {
        error.message.should.containEql("'path' must be a string value");
      }
    });

    it('hasChild returns the correct boolean value', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      const snapshot1 = await get(child(dbRef, 'types/boolean'));
      const snapshot2 = await get(child(dbRef, 'types'));

      snapshot1.hasChild('foo').should.equal(false);
      snapshot2.hasChild('boolean').should.equal(true);
    });

    it('hasChildren returns the correct boolean value', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);
      const snapshot = await get(child(dbRef, 'types/object'));
      snapshot.hasChildren().should.equal(true);
    });

    it('numChildren returns the correct number value', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      const snapshot1 = await get(child(dbRef, 'types/boolean'));
      const snapshot2 = await get(child(dbRef, 'types/array'));
      const snapshot3 = await get(child(dbRef, 'types/object'));

      snapshot1.numChildren().should.equal(0);
      snapshot2.numChildren().should.equal(CONTENT.TYPES.array.length);
      snapshot3.numChildren().should.equal(Object.keys(CONTENT.TYPES.object).length);
    });

    it('toJSON returns the value of the snapshot', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      const snapshot1 = await get(child(dbRef, 'types/string'));
      const snapshot2 = await get(child(dbRef, 'types/object'));

      snapshot1.toJSON().should.equal('foobar');
      snapshot2.toJSON().should.eql(jet.contextify(CONTENT.TYPES.object));
    });

    it('val returns the value of the snapshot', async function () {
      const { getDatabase, ref, child, get } = databaseModular;

      const dbRef = ref(getDatabase(), TEST_PATH);

      const snapshot1 = await get(child(dbRef, 'types/string'));
      const snapshot2 = await get(child(dbRef, 'types/object'));

      snapshot1.val().should.equal('foobar');
      snapshot2.val().should.eql(jet.contextify(CONTENT.TYPES.object));
    });

    it('should return the correct priority for the child snapshots', async function () {
      if (Platform.other) {
        // TODO - remove once "other" is fully integrated
        this.skip();
      }
      const { getDatabase, ref, child, set, setPriority, get } = databaseModular;
      const reference = child(ref(getDatabase(), TEST_PATH), 'get-priority-children-mod');

      const child1 = child(reference, 'child1');
      const child2 = child(reference, 'child2');
      const child3 = child(reference, 'child3');

      await Promise.all([
        set(child1, { foo: 'bar' }),
        set(child2, { foo: 'bar' }),
        set(child3, { foo: 'bar' }),
      ]);

      await setPriority(child1, 1);
      await setPriority(child2, 2);
      await setPriority(child3, 3);

      const snapshot = await get(reference);
      snapshot.child('child1').getPriority().should.equal(1);
      snapshot.child('child2').getPriority().should.equal(2);
      snapshot.child('child3').getPriority().should.equal(3);
    });
  });
});
