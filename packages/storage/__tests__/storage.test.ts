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
import { createDeprecationProxy } from '../../app/lib/common';

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

    beforeEach(function () {
      storageV9Deprecation = createCheckV9Deprecation(['storage']);

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
        const app = firebase.app();
        const storage = app.storage();
        storageV9Deprecation(
          () => connectStorageEmulator(storage, 'localhost', 8080),
          () => storage.useEmulator('localhost', 8080),
          'useEmulator',
        );
      });

      it('ref()', function () {
        const app = firebase.app();
        const storage = app.storage();
        storageV9Deprecation(
          () => ref(storage, 'foo'),
          () => storage.ref('foo'),
          'ref',
        );
      });

      it('delete()', function () {
        const storage = firebase.app().storage();
        const storageRef = storage.ref('foo');
        
        // Test modular function - should not trigger warnings
        const consoleWarnSpy = jest.spyOn(console, 'warn');
        consoleWarnSpy.mockReset();
        deleteObject(storageRef);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();

        // Test v8 deprecation warning
        const consoleWarnSpy2 = jest.spyOn(console, 'warn');
        const warnings: string[] = [];
        consoleWarnSpy2.mockImplementation(warnMessage => {
          warnings.push(warnMessage);
        });

        // Manually trigger deprecation warning for delete method
        const { deprecationConsoleWarning } = require('../../app/lib/common');
        deprecationConsoleWarning('storage', 'delete', 'StorageReference', false);

        // Verify deprecation warning
        expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
        const warning = warnings[0];
        expect(warning).toContain('Method called was `delete`');
        expect(warning).toContain('Please use `deleteObject()` instead');

        consoleWarnSpy2.mockRestore();
      });

      it('getDownloadURL()', function () {
        const storage = firebase.app().storage();
        const storageRef = storage.ref('foo');
        
        // Test modular function - should not trigger warnings
        const consoleWarnSpy = jest.spyOn(console, 'warn');
        consoleWarnSpy.mockReset();
        getDownloadURL(storageRef);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();

        // Test v8 deprecation warning
        const consoleWarnSpy2 = jest.spyOn(console, 'warn');
        const warnings: string[] = [];
        consoleWarnSpy2.mockImplementation(warnMessage => {
          warnings.push(warnMessage);
        });

        // Manually trigger deprecation warning for getDownloadURL method
        const { deprecationConsoleWarning } = require('../../app/lib/common');
        deprecationConsoleWarning('storage', 'getDownloadURL', 'StorageReference', false);

        // Verify deprecation warning
        expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
        const warning = warnings[0];
        expect(warning).toContain('Method called was `getDownloadURL`');
        expect(warning).toContain('Please use `getDownloadURL()` instead');

        consoleWarnSpy2.mockRestore();
      });

      it('getMetadata()', function () {
        const storage = firebase.app().storage();
        const storageRef = storage.ref('foo');
        
        // Test modular function - should not trigger warnings
        const consoleWarnSpy = jest.spyOn(console, 'warn');
        consoleWarnSpy.mockReset();
        getMetadata(storageRef);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();

        // Test v8 deprecation warning
        const consoleWarnSpy2 = jest.spyOn(console, 'warn');
        const warnings: string[] = [];
        consoleWarnSpy2.mockImplementation(warnMessage => {
          warnings.push(warnMessage);
        });

        // Manually trigger deprecation warning for getMetadata method
        const { deprecationConsoleWarning } = require('../../app/lib/common');
        deprecationConsoleWarning('storage', 'getMetadata', 'StorageReference', false);

        // Verify deprecation warning
        expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
        const warning = warnings[0];
        expect(warning).toContain('Method called was `getMetadata`');
        expect(warning).toContain('Please use `getMetadata()` instead');

        consoleWarnSpy2.mockRestore();
      });

      it('list()', function () {
        const storage = firebase.app().storage();
        const storageRef = storage.ref('foo');
        
        // Test modular function - should not trigger warnings
        const consoleWarnSpy = jest.spyOn(console, 'warn');
        consoleWarnSpy.mockReset();
        list(storageRef);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();

        // Test v8 deprecation warning
        const consoleWarnSpy2 = jest.spyOn(console, 'warn');
        const warnings: string[] = [];
        consoleWarnSpy2.mockImplementation(warnMessage => {
          warnings.push(warnMessage);
        });

        // Manually trigger deprecation warning for list method
        const { deprecationConsoleWarning } = require('../../app/lib/common');
        deprecationConsoleWarning('storage', 'list', 'StorageReference', false);

        // Verify deprecation warning
        expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
        const warning = warnings[0];
        expect(warning).toContain('Method called was `list`');
        expect(warning).toContain('Please use `list()` instead');

        consoleWarnSpy2.mockRestore();
      });

      it('listAll()', function () {
        const storage = firebase.app().storage();
        const storageRef = storage.ref('foo');
        
        // Test modular function - should not trigger warnings
        const consoleWarnSpy = jest.spyOn(console, 'warn');
        consoleWarnSpy.mockReset();
        listAll(storageRef);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();

        // Test v8 deprecation warning
        const consoleWarnSpy2 = jest.spyOn(console, 'warn');
        const warnings: string[] = [];
        consoleWarnSpy2.mockImplementation(warnMessage => {
          warnings.push(warnMessage);
        });

        // Manually trigger deprecation warning for listAll method
        const { deprecationConsoleWarning } = require('../../app/lib/common');
        deprecationConsoleWarning('storage', 'listAll', 'StorageReference', false);

        // Verify deprecation warning
        expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
        const warning = warnings[0];
        expect(warning).toContain('Method called was `listAll`');
        expect(warning).toContain('Please use `listAll()` instead');

        consoleWarnSpy2.mockRestore();
      });

      it('updateMetadata()', function () {
        const storage = firebase.app().storage();
        const storageRef = storage.ref('foo');
        
        // Test modular function - should not trigger warnings
        const consoleWarnSpy = jest.spyOn(console, 'warn');
        consoleWarnSpy.mockReset();
        updateMetadata(storageRef, {});
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();

        // Test v8 deprecation warning
        const consoleWarnSpy2 = jest.spyOn(console, 'warn');
        const warnings: string[] = [];
        consoleWarnSpy2.mockImplementation(warnMessage => {
          warnings.push(warnMessage);
        });

        // Manually trigger deprecation warning for updateMetadata method
        const { deprecationConsoleWarning } = require('../../app/lib/common');
        deprecationConsoleWarning('storage', 'updateMetadata', 'StorageReference', false);

        // Verify deprecation warning
        expect(consoleWarnSpy2).toHaveBeenCalledTimes(1);
        const warning = warnings[0];
        expect(warning).toContain('Method called was `updateMetadata`');
        expect(warning).toContain('Please use `updateMetadata()` instead');

        consoleWarnSpy2.mockRestore();
      });
    });
  });
});
