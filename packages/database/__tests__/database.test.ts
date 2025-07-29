import { afterAll, beforeAll, describe, expect, it, beforeEach, jest } from '@jest/globals';

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
  ServerValue,
} from '../lib';

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

describe('Database', function () {
  describe('namespace', function () {
    beforeAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
    });

    afterAll(async function () {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.database).toBeDefined();
      expect(app.database().useEmulator).toBeDefined();
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

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let databaseV9Deprecation: CheckV9DeprecationFunction;
    let staticsV9Deprecation: CheckV9DeprecationFunction;
    let referenceV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      databaseV9Deprecation = createCheckV9Deprecation(['database']);
      staticsV9Deprecation = createCheckV9Deprecation(['database', 'statics']);
      referenceV9Deprecation = createCheckV9Deprecation(['database', 'DatabaseReference']);
      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: (_target, prop) => {
              if (prop === 'constants') {
                return {
                  isDatabaseCollectionEnabled: true,
                  url: 'https://test.firebaseio.com',
                  ref: 'ref()',
                };
              }
              // Mock the once method to return proper snapshot data
              if (prop === 'once') {
                return jest.fn().mockResolvedValue({
                  key: 'test',
                  value: 'mock_value',
                  exists: true,
                  childKeys: [],
                  priority: null,
                } as never);
              }
              return jest.fn().mockResolvedValue({
                constants: {
                  isDatabaseCollectionEnabled: true,
                  url: 'https://test.firebaseio.com',
                },
              } as never);
            },
          },
        );
      });
    });

    it('useEmulator', function () {
      const db = getDatabase();
      databaseV9Deprecation(
        () => connectDatabaseEmulator(db, 'localhost', 9000),
        () => db.useEmulator('localhost', 9000),
        'useEmulator',
      );
    });

    it('goOffline', function () {
      const db = getDatabase();
      databaseV9Deprecation(
        () => goOffline(db),
        () => db.goOffline(),
        'goOffline',
      );
    });

    it('goOnline', function () {
      const db = getDatabase();
      databaseV9Deprecation(
        () => goOnline(db),
        () => db.goOnline(),
        'goOnline',
      );
    });

    it('ref', function () {
      const db = getDatabase();
      databaseV9Deprecation(
        () => ref(db, 'test'),
        () => db.ref('test'),
        'ref',
      );
    });

    it('refFromURL', function () {
      const db = getDatabase();
      // Mock the _customUrlOrRegion property directly on the database instance
      (db as any)._customUrlOrRegion = 'https://test.firebaseio.com';
      databaseV9Deprecation(
        () => refFromURL(db, 'https://test.firebaseio.com'),
        () => db.refFromURL('https://test.firebaseio.com'),
        'refFromURL',
      );
    });

    it('setPersistenceEnabled', function () {
      const db = getDatabase();
      databaseV9Deprecation(
        () => setPersistenceEnabled(db, true),
        () => db.setPersistenceEnabled(true),
        'setPersistenceEnabled',
      );
    });

    it('setLoggingEnabled', function () {
      const db = getDatabase();
      databaseV9Deprecation(
        () => setLoggingEnabled(db, true),
        () => db.setLoggingEnabled(true),
        'setLoggingEnabled',
      );
    });

    it('setPersistenceCacheSizeBytes', function () {
      const db = getDatabase();
      databaseV9Deprecation(
        () => setPersistenceCacheSizeBytes(db, 10000000),
        () => db.setPersistenceCacheSizeBytes(10000000),
        'setPersistenceCacheSizeBytes',
      );
    });

    it('getServerTime', function () {
      const db = getDatabase();
      databaseV9Deprecation(
        () => getServerTime(db),
        () => db.getServerTime(),
        'getServerTime',
      );
    });

    describe('statics', function () {
      it('ServerValue', function () {
        staticsV9Deprecation(
          () => ServerValue,
          () => firebase.database.ServerValue,
          'ServerValue',
        );
      });
    });

    describe('DatabaseReference', function () {
      it('child', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => child(testRef, 'child'),
          () => testRef.child('child'),
          'child',
        );
      });

      it('set', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => set(testRef, 'value'),
          () => testRef.set('value'),
          'set',
        );
      });

      it('update', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => update(testRef, { value: 'value' }),
          () => testRef.update({ value: 'value' }),
          'update',
        );
      });

      it('setWithPriority', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => setWithPriority(testRef, 'value', 1),
          () => testRef.setWithPriority('value', 1),
          'setWithPriority',
        );
      });

      it('remove', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => remove(testRef),
          () => testRef.remove(),
          'remove',
        );
      });

      it('onValue', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => onValue(testRef, () => {}),
          () => testRef.on('value', () => {}),
          'on',
        );
      });

      it('get', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => get(testRef),
          () => testRef.once('value'),
          'once',
        );
      });

      it('endAt', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => query(testRef, endAt('value')),
          () => testRef.endAt('value'),
          'endAt',
        );
      });

      it('startAt', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => query(testRef, startAt('value')),
          () => testRef.startAt('value'),
          'startAt',
        );
      });

      it('limitToFirst', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => query(testRef, limitToFirst(10)),
          () => testRef.limitToFirst(10),
          'limitToFirst',
        );
      });

      it('limitToLast', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => query(testRef, limitToLast(10)),
          () => testRef.limitToLast(10),
          'limitToLast',
        );
      });

      it('orderByChild', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => query(testRef, orderByChild('name')),
          () => testRef.orderByChild('name'),
          'orderByChild',
        );
      });

      it('orderByKey', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => query(testRef, orderByKey()),
          () => testRef.orderByKey(),
          'orderByKey',
        );
      });

      it('orderByValue', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => query(testRef, orderByValue()),
          () => testRef.orderByValue(),
          'orderByValue',
        );
      });

      it('equalTo', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => query(testRef, equalTo('value')),
          () => testRef.equalTo('value'),
          'equalTo',
        );
      });

      it('setPriority', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => setPriority(testRef, 'value'),
          () => testRef.setPriority('value'),
          'setPriority',
        );
      });

      it('push', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => push(testRef, 'value'),
          () => testRef.push('value'),
          'push',
        );
      });

      it('onDisconnect', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => onDisconnect(testRef),
          () => testRef.onDisconnect(),
          'onDisconnect',
        );
      });

      it('keepSynced', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => keepSynced(testRef, true),
          () => testRef.keepSynced(true),
          'keepSynced',
        );
      });
    });

    describe('DatabaseTransaction', function () {
      it('runTransaction', function () {
        const db = getDatabase();
        const testRef = ref(db, 'test');
        referenceV9Deprecation(
          () => runTransaction(testRef, currentData => currentData, { applyLocally: true }),
          () => testRef.transaction(currentData => currentData, undefined, true),
          'transaction',
        );
      });
    });
  });
});
