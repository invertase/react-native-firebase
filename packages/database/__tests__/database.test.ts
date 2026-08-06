import { describe, expect, it } from '@jest/globals';

import {
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
  enableLogging,
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
  off,
  child,
  onDisconnect,
  keepSynced,
  push,
  remove,
  update,
} from '../lib';

describe('Database', function () {
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

    it('`enableLogging` function is properly exposed to end user', function () {
      expect(enableLogging).toBeDefined();
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

    it('`off` function is properly exposed to end user', function () {
      expect(off).toBeDefined();
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

  describe('synchronous connection control parity', function () {
    it('`goOnline()` and `goOffline()` return synchronously (not Promises)', function () {
      const db = getDatabase();

      const onlineResult = goOnline(db);
      expect(onlineResult).toBeUndefined();
      expect(onlineResult).not.toBeInstanceOf(Promise);

      const offlineResult = goOffline(db);
      expect(offlineResult).toBeUndefined();
      expect(offlineResult).not.toBeInstanceOf(Promise);
    });

    it('database instance `goOnline()` / `goOffline()` return synchronously (not Promises)', function () {
      const db = getDatabase() as ReturnType<typeof getDatabase> & {
        goOnline(): void;
        goOffline(): void;
      };

      const onlineResult = db.goOnline();
      expect(onlineResult).toBeUndefined();
      expect(onlineResult).not.toBeInstanceOf(Promise);

      const offlineResult = db.goOffline();
      expect(offlineResult).toBeUndefined();
      expect(offlineResult).not.toBeInstanceOf(Promise);
    });
  });
});
