import { describe, expect, it } from '@jest/globals';

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
} from '../lib';

describe('Storage', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.storage).toBeDefined();
      expect(app.storage().useEmulator).toBeDefined();
    });
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
  });
});
