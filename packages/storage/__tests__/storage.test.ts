import { describe, expect, it } from '@jest/globals';

import {
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
  setMaxOperationRetryTime,
  setMaxUploadRetryTime,
  putFile,
  writeToFile,
  setMaxDownloadRetryTime,
  StringFormat,
  TaskEvent,
  TaskState,
} from '../lib';

describe('Storage', function () {
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

    it('`ref` supports full URLs (gs:// or https://) like firebase-js-sdk', function () {
      expect(ref).toBeDefined();
      const storage = getStorage();
      const refFromUrl = ref(storage, 'gs://bucket/path/to/file');
      expect(refFromUrl).toBeDefined();
      expect(refFromUrl.fullPath).toBeDefined();
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

    it('storage reference `toString` is available', function () {
      const storage = getStorage();
      expect(ref(storage, 'path').toString()).toBeDefined();
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
});
