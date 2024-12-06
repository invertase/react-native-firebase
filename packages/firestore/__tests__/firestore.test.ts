import { describe, expect, it, jest, beforeEach } from '@jest/globals';
// @ts-ignore test
import { createDeprecationProxy } from '../../app/lib/common';
// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';
// @ts-ignore test
import FirestoreQuery from '../lib/FirestoreQuery';
// @ts-ignore test
import FirestoreDocumentSnapshot from '../lib/FirestoreDocumentSnapshot';

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

import firestore, {
  firebase,
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
} from '../lib';

const COLLECTION = 'firestore';

describe('Firestore', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.firestore).toBeDefined();
      expect(app.firestore().settings).toBeDefined();
    });
  });

  describe('batch()', function () {
    it('returns a new WriteBatch instance', function () {
      const instance = firebase.firestore().batch();
      return expect(instance.constructor.name).toEqual('FirestoreWriteBatch');
    });
  });

  describe('settings', function () {
    it('throws if settings is not an object', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'settings' must be an object");
      }
    });

    it('throws if passing an incorrect setting key', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'settings.foo' is not a valid settings field");
      }
    });

    it('throws if cacheSizeBytes is not a number', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ cacheSizeBytes: 'foo' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'settings.cacheSizeBytes' must be a number value");
      }
    });

    it('throws if cacheSizeBytes is less than 1MB', async function () {
      try {
        await firebase.firestore().settings({ cacheSizeBytes: 123 });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'settings.cacheSizeBytes' the minimum cache size");
      }
    });

    it('accepts an unlimited cache size', async function () {
      await firebase
        .firestore()
        .settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
    });

    it('throws if host is not a string', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ host: 123 });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'settings.host' must be a string value");
      }
    });

    it('throws if host is an empty string', async function () {
      try {
        await firebase.firestore().settings({ host: '' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'settings.host' must not be an empty string");
      }
    });

    it('throws if persistence is not a boolean', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ persistence: 'true' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'settings.persistence' must be a boolean value");
      }
    });

    it('throws if ssl is not a boolean', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ ssl: 'true' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'settings.ssl' must be a boolean value");
      }
    });

    it('throws if ignoreUndefinedProperties is not a boolean', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firestore().settings({ ignoreUndefinedProperties: 'bogus' });
        return Promise.reject(new Error('Should throw'));
      } catch (e: any) {
        return expect(e.message).toContain("ignoreUndefinedProperties' must be a boolean value.");
      }
    });

    it("throws if serverTimestampBehavior is not one of 'estimate', 'previous', 'none'", async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firestore().settings({ serverTimestampBehavior: 'bogus' });
        return Promise.reject(new Error('Should throw'));
      } catch (e: any) {
        return expect(e.message).toContain(
          "serverTimestampBehavior' must be one of 'estimate', 'previous', 'none'",
        );
      }
    });
  });

  describe('runTransaction()', function () {
    it('throws if updateFunction is not a function', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().runTransaction('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'updateFunction' must be a function");
      }
    });
  });

  describe('collectionGroup()', function () {
    it('returns a new query instance', function () {
      const query = firebase.firestore().collectionGroup(COLLECTION);
      expect(query.constructor.name).toEqual('FirestoreQuery');
    });

    it('throws if id is not a string', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        firebase.firestore().collectionGroup(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'collectionId' must be a string value");
      }
    });

    it('throws if id is empty', async function () {
      try {
        firebase.firestore().collectionGroup('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'collectionId' must be a non-empty string");
      }
    });

    it('throws if id contains forward-slash', async function () {
      try {
        firebase.firestore().collectionGroup(`someCollection/bar`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'collectionId' must not contain '/'");
      }
    });
  });

  describe('collection()', function () {
    it('throws if path is not a string', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        firebase.firestore().collection(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'collectionPath' must be a string value");
      }
    });

    it('throws if path is empty string', async function () {
      try {
        firebase.firestore().collection('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'collectionPath' must be a non-empty string");
      }
    });

    it('throws if path does not point to a collection', async function () {
      try {
        firebase.firestore().collection(`firestore/bar`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'collectionPath' must point to a collection");
      }
    });

    it('returns a new CollectionReference', async function () {
      const collectionReference = firebase.firestore().collection('firestore');
      expect(collectionReference.constructor.name).toEqual('FirestoreCollectionReference');
      expect(collectionReference.path).toEqual('firestore');
    });
  });

  describe('doc()', function () {
    it('throws if path is not a string', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        firebase.firestore().doc(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'documentPath' must be a string value");
      }
    });

    it('throws if path is empty string', async function () {
      try {
        firebase.firestore().doc('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'documentPath' must be a non-empty string");
      }
    });

    it('throws if path does not point to a document', async function () {
      try {
        firebase.firestore().doc(`${COLLECTION}/bar/baz`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'documentPath' must point to a document");
      }
    });

    it('returns a new DocumentReference', async function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      expect(docRef.constructor.name).toEqual('FirestoreDocumentReference');
      expect(docRef.path).toEqual(`${COLLECTION}/bar`);
    });

    it('throws when undefined value provided and ignored undefined is false', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: false });
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      try {
        await docRef.set({
          field1: 1,
          field2: undefined,
        });

        return Promise.reject(new Error('Expected set() to throw'));
      } catch (e: any) {
        return expect(e.message).toEqual('Unsupported field value: undefined');
      }
    });

    it('throws when nested undefined object value provided and ignored undefined is false', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: false });
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      try {
        await docRef.set({
          field1: 1,
          field2: {
            shouldNotWork: undefined,
          },
        });
        return Promise.reject(new Error('Expected set() to throw'));
      } catch (e: any) {
        return expect(e.message).toEqual('Unsupported field value: undefined');
      }
    });

    it('throws when nested undefined array value provided and ignored undefined is false', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: false });
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      try {
        await docRef.set({
          myArray: [{ name: 'Tim', location: { state: undefined, country: 'United Kingdom' } }],
        });
        return Promise.reject(new Error('Expected set() to throw'));
      } catch (e: any) {
        return expect(e.message).toEqual('Unsupported field value: undefined');
      }
    });

    it('does not throw when nested undefined array value provided and ignore undefined is true', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: true });
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      await docRef.set({
        myArray: [{ name: 'Tim', location: { state: undefined, country: 'United Kingdom' } }],
      });
    });

    it('does not throw when nested undefined object value provided and ignore undefined is true', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: true });
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      await docRef.set({
        field1: 1,
        field2: {
          shouldNotWork: undefined,
        },
      });
    });

    it('does not throw when Date is provided instead of Timestamp', async function () {
      // type BarType = {
      //   myDate: FirebaseFirestoreTypes.Timestamp;
      // };

      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      await docRef.set({
        myDate: new Date(),
      });
    });

    it('does not throw when serverTimestamp is provided instead of Timestamp', async function () {
      // type BarType = {
      //   myDate: FirebaseFirestoreTypes.Timestamp;
      // };

      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      await docRef.set({
        myDate: firestore.FieldValue.serverTimestamp(),
      });
    });
  });

  describe('loadBundle()', function () {
    it('throws if bundle is not a string', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        firebase.firestore().loadBundle(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'bundle' must be a string value");
      }
    });

    it('throws if bundle is empty string', async function () {
      try {
        firebase.firestore().loadBundle('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'bundle' must be a non-empty string");
      }
    });
  });

  describe('namedQuery()', function () {
    it('throws if queryName is not a string', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        firebase.firestore().namedQuery(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'queryName' must be a string value");
      }
    });

    it('throws if queryName is empty string', async function () {
      try {
        firebase.firestore().namedQuery('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e: any) {
        return expect(e.message).toContain("'queryName' must be a non-empty string");
      }
    });
  });

  describe('modular', function () {
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
      const indexManager = getPersistentCacheIndexManager(firebase.firestore());
      expect(indexManager!.constructor.name).toEqual('FirestorePersistentCacheIndexManager');
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
  });

  describe('FirestorePersistentCacheIndexManager', function () {
    it('is exposed to end user', function () {
      const firestore1 = firebase.firestore();
      firestore1.settings({ persistence: true });
      const indexManager = firestore1.persistentCacheIndexManager();
      expect(indexManager).toBeDefined();
      expect(indexManager.constructor.name).toEqual('FirestorePersistentCacheIndexManager');

      expect(indexManager.enableIndexAutoCreation).toBeInstanceOf(Function);
      expect(indexManager.disableIndexAutoCreation).toBeInstanceOf(Function);
      expect(indexManager.deleteAllIndexes).toBeInstanceOf(Function);

      const firestore2 = firebase.firestore();
      firestore2.settings({ persistence: false });

      const nullIndexManager = firestore2.persistentCacheIndexManager();

      expect(nullIndexManager).toBeNull();

      const nullIndexManagerModular = getPersistentCacheIndexManager(firestore2);
      expect(nullIndexManagerModular).toBeNull();
    });
  });

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let collectionRefV9Deprecation: CheckV9DeprecationFunction;
    let docRefV9Deprecation: CheckV9DeprecationFunction;
    let fieldValueV9Deprecation: CheckV9DeprecationFunction;
    let filterV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      collectionRefV9Deprecation = createCheckV9Deprecation([
        'firestore',
        'FirestoreCollectionReference',
      ]);

      docRefV9Deprecation = createCheckV9Deprecation(['firestore', 'FirestoreDocumentReference']);

      fieldValueV9Deprecation = createCheckV9Deprecation(['firestore', 'FirestoreFieldValue']);
      filterV9Deprecation = createCheckV9Deprecation(['firestore', 'Filter']);

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: () =>
              jest.fn().mockResolvedValue({
                source: 'cache',
                changes: [],
                documents: [],
                metadata: {},
                path: 'foo',
              } as never),
          },
        );
      });

      jest
        .spyOn(FirestoreQuery.prototype, '_handleQueryCursor')
        // @ts-ignore test
        .mockImplementation((cursor, docOrField, fields) => {
          return [];
        });
    });

    it('CollectionReference.count()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => getCountFromServer(query),
        () => query.count(),
        'count',
      );
    });

    it('CollectionReference.countFromServer()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => getCountFromServer(query),
        () => query.countFromServer(),
        'count',
      );
    });

    it('CollectionReference.endAt()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => endAt('foo'),
        () => query.endAt('foo'),
        'endAt',
      );
    });

    it('CollectionReference.endBefore()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => endBefore('foo'),
        () => query.endBefore('foo'),
        'endBefore',
      );
    });

    it('CollectionReference.get()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => getDocs(query),
        () => query.get(),
        'get',
      );
    });

    it('CollectionReference.isEqual()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        // no equivalent method
        () => {},
        () => query.isEqual(query),
        'isEqual',
      );
    });

    it('CollectionReference.limit()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => limit(9),
        () => query.limit(9),
        'limit',
      );
    });

    it('CollectionReference.limitToLast()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => limitToLast(9),
        () => query.limitToLast(9),
        'limitToLast',
      );
    });

    it('CollectionReference.onSnapshot()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => onSnapshot(query, () => {}),
        () => query.onSnapshot(() => {}),
        'onSnapshot',
      );
    });

    it('CollectionReference.orderBy()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => orderBy('foo', 'asc'),
        () => query.orderBy('foo', 'asc'),
        'orderBy',
      );
    });

    it('CollectionReference.startAfter()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => startAfter('foo'),
        () => query.startAfter('foo'),
        'startAfter',
      );
    });

    it('CollectionReference.startAt()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => startAt('foo'),
        () => query.startAt('foo'),
        'startAt',
      );
    });

    it('CollectionReference.where()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => where('foo', '==', 'bar'),
        () => query.where('foo', '==', 'bar'),
        'where',
      );
    });

    it('CollectionReference.add()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => addDoc(query, { foo: 'bar' }),
        () => query.add({ foo: 'bar' }),
        'add',
      );
    });

    it('CollectionReference.doc()', function () {
      const firestore = getFirestore();

      const query = collection(firestore, 'test');

      collectionRefV9Deprecation(
        () => doc(query, 'bar'),
        () => query.doc('foo'),
        'doc',
      );
    });

    it('DocumentReference.collection()', function () {
      const firestore = getFirestore();

      const docRef = firestore.doc('some/foo');

      docRefV9Deprecation(
        () => collection(firestore, 'bar'),
        () => docRef.collection('bar'),
        'collection',
      );
    });

    it('DocumentReference.delete()', function () {
      const firestore = getFirestore();

      const docRef = firestore.doc('some/foo');

      docRefV9Deprecation(
        () => deleteDoc(docRef),
        () => docRef.delete(),
        'delete',
      );
    });

    it('DocumentReference.get()', function () {
      const firestore = getFirestore();

      const docRef = firestore.doc('some/foo');

      docRefV9Deprecation(
        () => getDoc(docRef),
        () => docRef.get(),
        'get',
      );
    });

    it('DocumentReference.isEqual()', function () {
      const firestore = getFirestore();

      const docRef = firestore.doc('some/foo');

      docRefV9Deprecation(
        // no equivalent method
        () => {},
        () => docRef.isEqual(docRef),
        'isEqual',
      );
    });

    it('DocumentReference.onSnapshot()', function () {
      const firestore = getFirestore();

      const docRef = firestore.doc('some/foo');

      docRefV9Deprecation(
        () => onSnapshot(docRef, () => {}),
        () => docRef.onSnapshot(() => {}),
        'onSnapshot',
      );
    });

    it('DocumentReference.set()', function () {
      const firestore = getFirestore();

      const docRef = firestore.doc('some/foo');

      docRefV9Deprecation(
        () => setDoc(docRef, { foo: 'bar' }),
        () => docRef.set({ foo: 'bar' }),
        'set',
      );
    });

    it('DocumentReference.update()', function () {
      const firestore = getFirestore();

      const docRef = firestore.doc('some/foo');

      docRefV9Deprecation(
        () => updateDoc(docRef, { foo: 'bar' }),
        () => docRef.update({ foo: 'bar' }),
        'update',
      );
    });

    it('FirestoreDocumentSnapshot.isEqual()', function () {
      const firestore = getFirestore();
      // Every `FirestoreDocumentSnapshot` has been wrapped in deprecation proxy, so we use constructor directly
      // for ease of mocking
      const snapshot = createDeprecationProxy(
        new FirestoreDocumentSnapshot(firestore, {
          source: 'cache',
          changes: [],
          documents: [],
          metadata: {},
          path: 'foo',
        }),
      );

      docRefV9Deprecation(
        // no equivalent method
        () => {},
        () => snapshot.isEqual(snapshot),
        'isEqual',
      );
    });

    it('FirestoreFieldValue.delete()', function () {
      fieldValueV9Deprecation(
        () => deleteField(),
        () => firestore.FieldValue.delete(),
        'delete',
      );
    });

    it('FirestoreFieldValue.increment()', function () {
      fieldValueV9Deprecation(
        () => increment(3),
        () => firestore.FieldValue.increment(4),
        'increment',
      );
    });

    it('FirestoreFieldValue.serverTimestamp()', function () {
      fieldValueV9Deprecation(
        () => serverTimestamp(),
        () => firestore.FieldValue.serverTimestamp(),
        'serverTimestamp',
      );
    });

    it('FirestoreFieldValue.arrayUnion()', function () {
      fieldValueV9Deprecation(
        () => arrayUnion('foo'),
        () => firestore.FieldValue.arrayUnion('bar'),
        'arrayUnion',
      );
    });

    it('FirestoreFieldValue.arrayRemove()', function () {
      fieldValueV9Deprecation(
        () => arrayRemove('foo'),
        () => firestore.FieldValue.arrayRemove('bar'),
        'arrayRemove',
      );
    });

    it('Filter.or()', function () {
      filterV9Deprecation(
        () => or(where('foo.bar', '==', null), where('foo.bar', '==', null)),
        () =>
          firestore.Filter.or(
            firestore.Filter('foo', '==', 'bar'),
            firestore.Filter('baz', '==', 'qux'),
          ),
        'or',
      );
    });

    it('Filter.and()', function () {
      filterV9Deprecation(
        () => and(where('foo.bar', '==', null), where('foo.bar', '==', null)),
        () =>
          firestore.Filter.and(
            firestore.Filter('foo', '==', 'bar'),
            firestore.Filter('baz', '==', 'qux'),
          ),
        'and',
      );
    });

    // it('FirestoreGeoPoint.and()', function () {
    //   filterV9Deprecation(
    //     () => or(firestore.Filter('foo.bar', '==', null), firestore.Filter('foo.bar', '==', null)),
    //     () =>
    //       firestore.Filter.and(
    //         firestore.Filter('foo', '==', 'bar'),
    //         firestore.Filter('baz', '==', 'qux'),
    //       ),
    //     'and',
    //   );
    // });
  });
});
