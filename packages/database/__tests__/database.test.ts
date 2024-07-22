import { describe, expect, it } from '@jest/globals';

import database, {
  firebase,
  runTransaction,
  getDatabase,
  connectDatabaseEmulator,
  goOffline,
  goOnline,
  ref,
  refFromURL,
  setPersistenceEnabled,
  setLoggingEnabled,
  setPersistenceCacheSizeBytes,
  forceLongPolling,
  forceWebSockets,
  getServerTime,
  serverTimestamp,
  increment,
  endAt,
  endBefore,
  startAt,
  startAfter,
  limitToFirst,
  limitToLast,
  orderByChild,
  orderByKey,
  orderByPriority,
  orderByValue,
  equalTo,
  query,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
  set,
  setPriority,
  setWithPriority,
  get,
  child,
  onDisconnect,
  keepSynced,
  push,
  remove,
  update,
} from '../lib';

describe('Database', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.database).toBeDefined();
      expect(app.database().useEmulator).toBeDefined();
    });
  });

  describe('useEmulator()', function () {
    it('useEmulator requires a string host', function () {
      // @ts-ignore because we pass an invalid argument...
      expect(() => database().useEmulator()).toThrow(
        'firebase.database().useEmulator() takes a non-empty host',
      );
      expect(() => database().useEmulator('', -1)).toThrow(
        'firebase.database().useEmulator() takes a non-empty host',
      );
      // @ts-ignore because we pass an invalid argument...
      expect(() => database().useEmulator(123)).toThrow(
        'firebase.database().useEmulator() takes a non-empty host',
      );
    });

    it('useEmulator requires a host and port', function () {
      expect(() => database().useEmulator('', 9000)).toThrow(
        'firebase.database().useEmulator() takes a non-empty host and port',
      );
      // No port
      // @ts-ignore because we pass an invalid argument...
      expect(() => database().useEmulator('localhost')).toThrow(
        'firebase.database().useEmulator() takes a non-empty host and port',
      );
    });

    it('useEmulator -> remaps Android loopback to host', function () {
      const foo = database().useEmulator('localhost', 9000);
      expect(foo).toEqual(['10.0.2.2', 9000]);

      const bar = database().useEmulator('127.0.0.1', 9000);
      expect(bar).toEqual(['10.0.2.2', 9000]);
    });
  });

  describe('modular', function () {
    it('`onValue` query method is properly exposed to end user', function () {
      expect(onValue).toBeDefined();
    });

    it('`runTransaction` transaction method is properly exposed to end user', function () {
      expect(runTransaction).toBeDefined();
    });

    it('`getDatabase` function is properly exposed to end user', function () {
      expect(getDatabase).toBeDefined();
    });

    it('`connectDatabaseEmulator` function is properly exposed to end user', function () {
      expect(connectDatabaseEmulator).toBeDefined();
    });

    it('`goOffline` function is properly exposed to end user', function () {
      expect(goOffline).toBeDefined();
    });

    it('`goOnline` function is properly exposed to end user', function () {
      expect(goOnline).toBeDefined();
    });

    it('`ref` function is properly exposed to end user', function () {
      expect(ref).toBeDefined();
    });

    it('`refFromURL` function is properly exposed to end user', function () {
      expect(refFromURL).toBeDefined();
    });

    it('`setPersistenceEnabled` function is properly exposed to end user', function () {
      expect(setPersistenceEnabled).toBeDefined();
    });

    it('`setLoggingEnabled` function is properly exposed to end user', function () {
      expect(setLoggingEnabled).toBeDefined();
    });

    it('`setPersistenceCacheSizeBytes` function is properly exposed to end user', function () {
      expect(setPersistenceCacheSizeBytes).toBeDefined();
    });

    it('`forceLongPolling` function is properly exposed to end user', function () {
      expect(forceLongPolling).toBeDefined();
    });

    it('`forceWebSockets` function is properly exposed to end user', function () {
      expect(forceWebSockets).toBeDefined();
    });

    it('`getServerTime` function is properly exposed to end user', function () {
      expect(getServerTime).toBeDefined();
    });

    it('`serverTimestamp` function is properly exposed to end user', function () {
      expect(serverTimestamp).toBeDefined();
    });

    it('`increment` function is properly exposed to end user', function () {
      expect(increment).toBeDefined();
    });

    it('`endAt` function is properly exposed to end user', function () {
      expect(endAt).toBeDefined();
    });

    it('`endBefore` function is properly exposed to end user', function () {
      expect(endBefore).toBeDefined();
    });

    it('`startAt` function is properly exposed to end user', function () {
      expect(startAt).toBeDefined();
    });

    it('`startAfter` function is properly exposed to end user', function () {
      expect(startAfter).toBeDefined();
    });

    it('`limitToFirst` function is properly exposed to end user', function () {
      expect(limitToFirst).toBeDefined();
    });

    it('`limitToLast` function is properly exposed to end user', function () {
      expect(limitToLast).toBeDefined();
    });

    it('`orderByChild` function is properly exposed to end user', function () {
      expect(orderByChild).toBeDefined();
    });

    it('`orderByKey` function is properly exposed to end user', function () {
      expect(orderByKey).toBeDefined();
    });

    it('`orderByPriority` function is properly exposed to end user', function () {
      expect(orderByPriority).toBeDefined();
    });

    it('`orderByValue` function is properly exposed to end user', function () {
      expect(orderByValue).toBeDefined();
    });

    it('`equalTo` function is properly exposed to end user', function () {
      expect(equalTo).toBeDefined();
    });

    it('`query` function is properly exposed to end user', function () {
      expect(query).toBeDefined();
    });

    it('`onValue` function is properly exposed to end user', function () {
      expect(onValue).toBeDefined();
    });

    it('`onChildAdded` function is properly exposed to end user', function () {
      expect(onChildAdded).toBeDefined();
    });

    it('`onChildChanged` function is properly exposed to end user', function () {
      expect(onChildChanged).toBeDefined();
    });

    it('`onChildMoved` function is properly exposed to end user', function () {
      expect(onChildMoved).toBeDefined();
    });

    it('`onChildRemoved` function is properly exposed to end user', function () {
      expect(onChildRemoved).toBeDefined();
    });

    it('`set` function is properly exposed to end user', function () {
      expect(set).toBeDefined();
    });

    it('`setPriority` function is properly exposed to end user', function () {
      expect(setPriority).toBeDefined();
    });

    it('`setWithPriority` function is properly exposed to end user', function () {
      expect(setWithPriority).toBeDefined();
    });

    it('`get` function is properly exposed to end user', function () {
      expect(get).toBeDefined();
    });

    it('`child` function is properly exposed to end user', function () {
      expect(child).toBeDefined();
    });

    it('`onDisconnect` function is properly exposed to end user', function () {
      expect(onDisconnect).toBeDefined();
    });

    it('`keepSynced` function is properly exposed to end user', function () {
      expect(keepSynced).toBeDefined();
    });

    it('`push` function is properly exposed to end user', function () {
      expect(push).toBeDefined();
    });

    it('`remove` function is properly exposed to end user', function () {
      expect(remove).toBeDefined();
    });

    it('`update` function is properly exposed to end user', function () {
      expect(update).toBeDefined();
    });
  });
});
