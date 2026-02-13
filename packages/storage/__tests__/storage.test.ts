import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

import storage, {
  firebase,
  getStorage,
  connectStorageEmulator,
  ref,
  deleteObject,
  getBlob,
  getBytes,
  getDownloadURL,
  getMetadata,
  getStream,
  list,
  listAll,
  updateMetadata,
  uploadBytes,
  uploadBytesResumable,
  uploadString,
  refFromURL,
  setMaxOperationRetryTime,
  setMaxUploadRetryTime,
  putFile,
  writeToFile,
  toString,
  child,
  setMaxDownloadRetryTime,
  StringFormat,
  TaskEvent,
  TaskState,
} from '../lib';

import {
  createCheckV9Deprecation,
  CheckV9DeprecationFunction,
} from '../../app/lib/common/unitTestUtils';

// @ts-ignore test
import FirebaseModule from '../../app/lib/internal/FirebaseModule';

describe('Storage', function () {
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
      expect(app.storage).toBeDefined();
      expect(app.storage().useEmulator).toBeDefined();
    });

    describe('useEmulator()', function () {
      it('useEmulator requires a string host', function () {
        // @ts-ignore because we pass an invalid argument...
        expect(() => storage().useEmulator()).toThrow(
          'firebase.storage().useEmulator() takes a non-empty host',
        );
        expect(() => storage().useEmulator('', -1)).toThrow(
          'firebase.storage().useEmulator() takes a non-empty host',
        );
        // @ts-ignore because we pass an invalid argument...
        expect(() => storage().useEmulator(123)).toThrow(
          'firebase.storage().useEmulator() takes a non-empty host',
        );
      });

      it('useEmulator requires a host and port', function () {
        expect(() => storage().useEmulator('', 9000)).toThrow(
          'firebase.storage().useEmulator() takes a non-empty host and port',
        );
        // No port
        // @ts-ignore because we pass an invalid argument...
        expect(() => storage().useEmulator('localhost')).toThrow(
          'firebase.storage().useEmulator() takes a non-empty host and port',
        );
      });

      it('useEmulator -> remaps Android loopback to host', function () {
        const foo = storage().useEmulator('localhost', 9000);
        expect(foo).toEqual(['10.0.2.2', 9000]);

        const bar = storage().useEmulator('127.0.0.1', 9000);
        expect(bar).toEqual(['10.0.2.2', 9000]);
      });
    });
  });

  describe('modular', function () {
    it('`getStorage` function is properly exposed to end user', function () {
      expect(getStorage).toBeDefined();
    });

    it('`connectStorageEmulator` function is properly exposed to end user', function () {
      expect(connectStorageEmulator).toBeDefined();
    });

    it('`ref` function is properly exposed to end user', function () {
      expect(ref).toBeDefined();
    });

    it('`deleteObject` function is properly exposed to end user', function () {
      expect(deleteObject).toBeDefined();
    });

    it('`getBlob` function is properly exposed to end user', function () {
      expect(getBlob).toBeDefined();
    });

    it('`getBytes` function is properly exposed to end user', function () {
      expect(getBytes).toBeDefined();
    });

    it('`getDownloadURL` function is properly exposed to end user', function () {
      expect(getDownloadURL).toBeDefined();
    });

    it('`getMetadata` function is properly exposed to end user', function () {
      expect(getMetadata).toBeDefined();
    });

    it('`getStream` function is properly exposed to end user', function () {
      expect(getStream).toBeDefined();
    });

    it('`list` function is properly exposed to end user', function () {
      expect(list).toBeDefined();
    });

    it('`listAll` function is properly exposed to end user', function () {
      expect(listAll).toBeDefined();
    });

    it('`updateMetadata` function is properly exposed to end user', function () {
      expect(updateMetadata).toBeDefined();
    });

    it('`uploadBytes` function is properly exposed to end user', function () {
      expect(uploadBytes).toBeDefined();
    });

    it('`uploadBytesResumable` function is properly exposed to end user', function () {
      expect(uploadBytesResumable).toBeDefined();
    });

    it('`uploadString` function is properly exposed to end user', function () {
      expect(uploadString).toBeDefined();
    });

    it('`refFromURL` function is properly exposed to end user', function () {
      expect(refFromURL).toBeDefined();
    });

    it('`setMaxOperationRetryTime` function is properly exposed to end user', function () {
      expect(setMaxOperationRetryTime).toBeDefined();
    });

    it('`setMaxUploadRetryTime` function is properly exposed to end user', function () {
      expect(setMaxUploadRetryTime).toBeDefined();
    });

    it('`putFile` function is properly exposed to end user', function () {
      expect(putFile).toBeDefined();
    });

    it('`writeToFile` function is properly exposed to end user', function () {
      expect(writeToFile).toBeDefined();
    });

    it('`toString` function is properly exposed to end user', function () {
      expect(toString).toBeDefined();
    });

    it('`child` function is properly exposed to end user', function () {
      expect(child).toBeDefined();
    });

    it('`setMaxDownloadRetryTime` function is properly exposed to end user', function () {
      expect(setMaxDownloadRetryTime).toBeDefined();
    });

    it('`StringFormat` is properly exposed to end user', function () {
      expect(StringFormat.BASE64).toBeDefined();
      expect(StringFormat.BASE64URL).toBeDefined();
      expect(StringFormat.DATA_URL).toBeDefined();
      expect(StringFormat.RAW).toBeDefined();
    });

    it('`TaskEvent` is properly exposed to end user', function () {
      expect(TaskEvent.STATE_CHANGED).toBeDefined();
    });

    it('`TaskState` is properly exposed to end user', function () {
      expect(TaskState.CANCELLED).toBeDefined();
      expect(TaskState.ERROR).toBeDefined();
      expect(TaskState.PAUSED).toBeDefined();
      expect(TaskState.RUNNING).toBeDefined();
      expect(TaskState.SUCCESS).toBeDefined();
    });
  });

  describe('test `console.warn` is called for RNFB v8 API & not called for v9 API', function () {
    let storageV9Deprecation: CheckV9DeprecationFunction;
    let storageRefV9Deprecation: CheckV9DeprecationFunction;
    let staticsV9Deprecation: CheckV9DeprecationFunction;

    beforeEach(function () {
      storageV9Deprecation = createCheckV9Deprecation(['storage']);

      storageRefV9Deprecation = createCheckV9Deprecation(['storage', 'Reference']);

      staticsV9Deprecation = createCheckV9Deprecation(['storage', 'statics']);

      // @ts-ignore test
      jest.spyOn(FirebaseModule.prototype, 'native', 'get').mockImplementation(() => {
        return new Proxy(
          {},
          {
            get: (_target, prop) => {
              // Handle list operations specially
              if (prop === 'list' || prop === 'listAll') {
                return jest.fn().mockResolvedValue({
                  items: [],
                  prefixes: [],
                  nextPageToken: null,
                } as never);
              }
              // Default mock for other operations
              return jest.fn().mockResolvedValue({
                source: 'cache',
                changes: [],
                documents: [],
                metadata: {},
                path: 'foo',
              } as never);
            },
          },
        );
      });
    });

    describe('Storage', function () {
      it('useStorageEmulator()', function () {
        const storage = getStorage();
        storageV9Deprecation(
          () => connectStorageEmulator(storage, 'localhost', 8080),
          // @ts-expect-error Combines modular and namespace API
          () => storage.useEmulator('localhost', 8080),
          'useEmulator',
        );
      });

      it('ref()', function () {
        const storage = getStorage();
        storageV9Deprecation(
          () => ref(storage, 'foo'),
          // @ts-expect-error Combines modular and namespace API
          () => storage.ref('foo'),
          'ref',
        );
      });

      it('refFromURL()', function () {
        const storage = getStorage();
        storageV9Deprecation(
          () => refFromURL(storage, 'gs://flutterfire-e2e-tests.appspot.com/flutter-tsts'),
          // @ts-expect-error Combines modular and namespace API
          () => storage.refFromURL('gs://flutterfire-e2e-tests.appspot.com/flutter-tsts'),
          'refFromURL',
        );
      });

      it('setMaxOperationRetryTime()', function () {
        const storage = getStorage();
        storageV9Deprecation(
          () => setMaxOperationRetryTime(storage, 1000),
          // @ts-expect-error Combines modular and namespace API
          () => storage.setMaxOperationRetryTime(1000),
          'setMaxOperationRetryTime',
        );
      });

      it('setMaxUploadRetryTime()', function () {
        const storage = getStorage();
        storageV9Deprecation(
          () => setMaxUploadRetryTime(storage, 1000),
          // @ts-expect-error Combines modular and namespace API
          () => storage.setMaxUploadRetryTime(1000),
          'setMaxUploadRetryTime',
        );
      });

      it('setMaxDownloadRetryTime()', function () {
        const storage = getStorage();
        storageV9Deprecation(
          () => setMaxDownloadRetryTime(storage, 1000),
          // @ts-expect-error Combines modular and namespace API
          () => storage.setMaxDownloadRetryTime(1000),
          'setMaxDownloadRetryTime',
        );
      });

      it('delete()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => deleteObject(storageRef),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.delete(),
          'delete',
        );
      });

      it('getDownloadURL()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => getDownloadURL(storageRef),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.getDownloadURL(),
          'getDownloadURL',
        );
      });

      it('getMetadata()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => getMetadata(storageRef),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.getMetadata(),
          'getMetadata',
        );
      });

      it('list()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => list(storageRef),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.list(),
          'list',
        );
      });

      it('listAll()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => listAll(storageRef),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.listAll(),
          'listAll',
        );
      });

      it('updateMetadata()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => updateMetadata(storageRef, {}),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.updateMetadata({}),
          'updateMetadata',
        );
      });

      it('put()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => uploadBytesResumable(storageRef, new Blob(['foo']), {}),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.put(new Blob(['foo']), {}),
          'put',
        );
      });

      it('putString()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => uploadString(storageRef, 'foo', StringFormat.RAW),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.putString('foo', StringFormat.RAW),
          'putString',
        );
      });

      it('putFile()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => putFile(storageRef, 'foo', {}),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.putFile('foo', {}),
          'putFile',
        );
      });

      it('writeToFile()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => writeToFile(storageRef, 'foo'),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.writeToFile('foo'),
          'writeToFile',
        );
      });

      it('toString()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => toString(storageRef),
          () => storageRef.toString(),
          'toString',
        );
      });

      it('child()', function () {
        const storage = getStorage();
        const storageRef = ref(storage, 'foo');
        storageRefV9Deprecation(
          () => child(storageRef, 'bar'),
          // @ts-expect-error Combines modular and namespace API
          () => storageRef.child('bar'),
          'child',
        );
      });
    });

    describe('statics', function () {
      it('StringFormat static', function () {
        staticsV9Deprecation(
          () => StringFormat.RAW,
          () => firebase.storage.StringFormat.RAW,
          'StringFormat',
        );
      });

      it('TaskEvent static', function () {
        staticsV9Deprecation(
          () => TaskEvent.STATE_CHANGED,
          () => firebase.storage.TaskEvent.STATE_CHANGED,
          'TaskEvent',
        );
      });

      it('TaskState static', function () {
        staticsV9Deprecation(
          () => TaskState.SUCCESS,
          () => firebase.storage.TaskState.SUCCESS,
          'TaskState',
        );
      });
    });
  });
});
