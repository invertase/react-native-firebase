import { describe, expect, it } from '@jest/globals';
import { parseSnapshotArgs } from '../lib/utils';

import {
  Filter,
  getFirestore,
  getAggregateFromServer,
  count,
  average,
  sum,
  addDoc,
  doc,
  collection,
  collectionGroup,
  setDoc,
  updateDoc,
  enableNetwork,
  disableNetwork,
  clearPersistence,
  terminate,
  waitForPendingWrites,
  initializeFirestore,
  setLogLevel,
  runTransaction,
  getCountFromServer,
  loadBundle,
  namedQuery,
  writeBatch,
  Bytes,
  FieldPath,
  FieldValue,
  deleteField,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  GeoPoint,
  query,
  where,
  or,
  and,
  orderBy,
  startAt,
  startAfter,
  endAt,
  endBefore,
  limit,
  limitToLast,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  deleteDoc,
  onSnapshot,
  Timestamp,
  getPersistentCacheIndexManager,
  deleteAllPersistentCacheIndexes,
  disablePersistentCacheIndexAutoCreation,
  enablePersistentCacheIndexAutoCreation,
  onSnapshotsInSync,
  documentId,
  vector,
  VectorValue,
  SDK_VERSION,
} from '../lib';

describe('Firestore', function () {
  describe('onSnapshot()', function () {
    it("accepts { source: 'cache' } listener options", function () {
      const parsed = parseSnapshotArgs([{ source: 'cache' }, () => {}]);

      expect(parsed.snapshotListenOptions).toEqual({
        includeMetadataChanges: false,
        source: 'cache',
      });
    });

    it("accepts { source: 'default', includeMetadataChanges: true } listener options", function () {
      const parsed = parseSnapshotArgs([
        { source: 'default', includeMetadataChanges: true },
        () => {},
      ]);

      expect(parsed.snapshotListenOptions).toEqual({
        includeMetadataChanges: true,
        source: 'default',
      });
    });

    it("throws for unsupported listener source value 'server'", function () {
      expect(() =>
        parseSnapshotArgs([{ source: 'server' as 'default' | 'cache' }, () => {}]),
      ).toThrow("'options' SnapshotOptions.source must be one of 'default' or 'cache'.");
    });
  });

  describe('modular', function () {
    it('`SDK_VERSION` is exported', function () {
      expect(SDK_VERSION).toBeDefined();
    });

    it('`getFirestore` function is properly exposed to end user', function () {
      expect(getFirestore).toBeDefined();
    });

    it('`Filter` is properly exposed to end user', async function () {
      const filter1 = Filter('name', '==', 'Tim');
      const filter2 = Filter('age', '>', 21);

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const query = Filter.and(filter1, filter2);
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const query2 = Filter.or(filter1, filter2);
    });

    it('`doc` function is properly exposed to end user', function () {
      expect(doc).toBeDefined();
    });

    it('`collection` function is properly exposed to end user', function () {
      expect(collection).toBeDefined();
    });

    it('`collectionGroup` function is properly exposed to end user', function () {
      expect(collectionGroup).toBeDefined();
    });

    it('`setDoc` function is properly exposed to end user', function () {
      expect(setDoc).toBeDefined();
    });

    it('`updateDoc` function is properly exposed to end user', function () {
      expect(updateDoc).toBeDefined();
    });

    it('`addDoc` function is properly exposed to end user', function () {
      expect(addDoc).toBeDefined();
    });

    it('`enableNetwork` function is properly exposed to end user', function () {
      expect(enableNetwork).toBeDefined();
    });

    it('`disableNetwork` function is properly exposed to end user', function () {
      expect(disableNetwork).toBeDefined();
    });

    it('`clearPersistence` function is properly exposed to end user', function () {
      expect(clearPersistence).toBeDefined();
    });

    it('`terminate` function is properly exposed to end user', function () {
      expect(terminate).toBeDefined();
    });

    it('`waitForPendingWrites` function is properly exposed to end user', function () {
      expect(waitForPendingWrites).toBeDefined();
    });

    it('`initializeFirestore` function is properly exposed to end user', function () {
      expect(initializeFirestore).toBeDefined();
    });

    it('`setLogLevel` function is properly exposed to end user', function () {
      expect(setLogLevel).toBeDefined();
    });

    it('`runTransaction` function is properly exposed to end user', function () {
      expect(runTransaction).toBeDefined();
    });

    it('`getCountFromServer` function is properly exposed to end user', function () {
      expect(getCountFromServer).toBeDefined();
    });

    it('`loadBundle` function is properly exposed to end user', function () {
      expect(loadBundle).toBeDefined();
    });

    it('`namedQuery` function is properly exposed to end user', function () {
      expect(namedQuery).toBeDefined();
    });

    it('`writeBatch` function is properly exposed to end user', function () {
      expect(writeBatch).toBeDefined();
    });

    it('`Bytes` class is properly exposed to end user', function () {
      expect(Bytes).toBeDefined();
    });

    it('`FieldPath` class is properly exposed to end user', function () {
      expect(FieldPath).toBeDefined();
    });

    it('`FieldValue` is properly exposed to end user', function () {
      expect(FieldValue).toBeDefined();
    });

    it('`deleteField` function is properly exposed to end user', function () {
      expect(deleteField).toBeDefined();
    });

    it('`serverTimestamp` function is properly exposed to end user', function () {
      expect(serverTimestamp).toBeDefined();
    });

    it('`arrayUnion` function is properly exposed to end user', function () {
      expect(arrayUnion).toBeDefined();
    });

    it('`arrayRemove` function is properly exposed to end user', function () {
      expect(arrayRemove).toBeDefined();
    });

    it('`increment` function is properly exposed to end user', function () {
      expect(increment).toBeDefined();
    });

    it('`GeoPoint` is properly exposed to end user', function () {
      expect(GeoPoint).toBeDefined();
    });

    it('`query` function is properly exposed to end user', function () {
      expect(query).toBeDefined();
    });

    it('`where` function is properly exposed to end user', function () {
      expect(where).toBeDefined();
    });

    it('`or` function is properly exposed to end user', function () {
      expect(or).toBeDefined();
    });

    it('`and` function is properly exposed to end user', function () {
      expect(and).toBeDefined();
    });

    it('`orderBy` function is properly exposed to end user', function () {
      expect(orderBy).toBeDefined();
    });

    it('`startAt` function is properly exposed to end user', function () {
      expect(startAt).toBeDefined();
    });

    it('`startAfter` function is properly exposed to end user', function () {
      expect(startAfter).toBeDefined();
    });

    it('`endAt` function is properly exposed to end user', function () {
      expect(endAt).toBeDefined();
    });

    it('`endBefore` function is properly exposed to end user', function () {
      expect(endBefore).toBeDefined();
    });

    it('`limit` function is properly exposed to end user', function () {
      expect(limit).toBeDefined();
    });

    it('`limitToLast` function is properly exposed to end user', function () {
      expect(limitToLast).toBeDefined();
    });

    it('`getDoc` function is properly exposed to end user', function () {
      expect(getDoc).toBeDefined();
    });

    it('`getDocFromCache` function is properly exposed to end user', function () {
      expect(getDocFromCache).toBeDefined();
    });

    it('`getDocFromServer` function is properly exposed to end user', function () {
      expect(getDocFromServer).toBeDefined();
    });

    it('`getDocs` function is properly exposed to end user', function () {
      expect(getDocs).toBeDefined();
    });

    it('`getDocsFromCache` function is properly exposed to end user', function () {
      expect(getDocsFromCache).toBeDefined();
    });

    it('`getDocsFromServer` function is properly exposed to end user', function () {
      expect(getDocsFromServer).toBeDefined();
    });

    it('`deleteDoc` function is properly exposed to end user', function () {
      expect(deleteDoc).toBeDefined();
    });

    it('`onSnapshot` function is properly exposed to end user', function () {
      expect(onSnapshot).toBeDefined();
    });

    it('`Timestamp` is properly exposed to end user', function () {
      expect(Timestamp).toBeDefined();
    });

    it('`getPersistentCacheIndexManager` is properly exposed to end user', function () {
      expect(getPersistentCacheIndexManager).toBeDefined();
      const indexManager = getPersistentCacheIndexManager(getFirestore());
      expect(indexManager).toBeDefined();
      expect(indexManager!.constructor.name).toEqual('PersistentCacheIndexManager');
    });

    it('`deleteAllPersistentCacheIndexes` is properly exposed to end user', function () {
      expect(deleteAllPersistentCacheIndexes).toBeDefined();
    });

    it('`disablePersistentCacheIndexAutoCreation` is properly exposed to end user', function () {
      expect(disablePersistentCacheIndexAutoCreation).toBeDefined();
    });

    it('`enablePersistentCacheIndexAutoCreation` is properly exposed to end user', function () {
      expect(enablePersistentCacheIndexAutoCreation).toBeDefined();
    });

    it('`getAggregateFromServer` is properly exposed to end user', function () {
      expect(getAggregateFromServer).toBeDefined();
    });

    it('`count` is properly exposed to end user', function () {
      expect(count).toBeDefined();
    });

    it('`average` is properly exposed to end user', function () {
      expect(average).toBeDefined();
    });

    it('`sum` is properly exposed to end user', function () {
      expect(sum).toBeDefined();
    });

    it('`onSnapshotsInSync` is properly exposed to end user', function () {
      expect(onSnapshotsInSync).toBeDefined();
    });

    it('`documentId` is properly exposed to end user', function () {
      expect(documentId).toBeDefined();
    });

    it('`VectorValue` is properly exposed to end user', function () {
      expect(VectorValue).toBeDefined();
    });

    it('`vector()` is properly exposed to end user', function () {
      expect(vector).toBeDefined();
    });
  });

  describe('VectorValue (unit serializer)', function () {
    it('constructs and validates values', function () {
      const v = vector([0, 1.5, -2]);
      expect(v.toArray()).toEqual([0, 1.5, -2]);
      expect(v.isEqual(vector([0, 1.5, -2]))).toBe(true);
      expect(v.isEqual(vector([0, 1.5]))).toBe(false);
    });

    it('serializes to type map and parses back', function () {
      const serialize = require('../lib/utils/serialize');
      const { getTypeMapName } = require('../lib/utils/typemap');

      const v = vector([0.1, 0.2, 0.3]);
      const typed = serialize.generateNativeData(v, false);
      expect(Array.isArray(typed)).toBe(true);
      expect(getTypeMapName(typed[0])).toBe('vector');
      const parsed = serialize.parseNativeData(null, typed);
      expect(parsed.toArray()).toEqual([0.1, 0.2, 0.3]);
    });

    it('serializes inside objects and arrays', function () {
      const serialize = require('../lib/utils/serialize');
      const { getTypeMapName } = require('../lib/utils/typemap');

      const v = vector([1, 2, 3]);
      const map = serialize.buildNativeMap({ a: v }, false);
      expect(getTypeMapName(map.a[0])).toBe('vector');

      const arr = serialize.buildNativeArray([v], false);
      expect(getTypeMapName(arr[0][0])).toBe('vector');
    });
  });

  describe('FieldValue (unit serializer)', function () {
    it('serializes arrayUnion as fieldvalue without nested arrays', function () {
      const serialize = require('../lib/utils/serialize');
      const { getTypeMapName } = require('../lib/utils/typemap');

      const fieldValue = arrayUnion(3, 4);
      const typed = serialize.generateNativeData(fieldValue, false);
      expect(getTypeMapName(typed[0])).toBe('fieldvalue');

      const payload = typed[1] as [string, unknown[]];
      expect(payload[0]).toBe('array_union');
      expect(Array.isArray(payload[1])).toBe(true);
      expect(payload[1].every(element => Array.isArray(element) && element.length === 2)).toBe(
        true,
      );
      expect(
        payload[1].every(element => {
          const typeMap = element as [number, unknown?];
          return getTypeMapName(typeMap[0]) !== 'array';
        }),
      ).toBe(true);

      const updatePayload = serialize.buildNativeMap({ foo: fieldValue }, false);
      expect(getTypeMapName(updatePayload.foo[0])).toBe('fieldvalue');
    });
  });
});
