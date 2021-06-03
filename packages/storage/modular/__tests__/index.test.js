import { listAll, list, deleteObject, getDownloadURL, getMetadata, getStorage, ref } from '../src';
import * as impl from '../src/impl';

import { createStorageReference, createStorageService } from './helpers';

jest.mock('../src/impl');

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStorage', () => {
    it('returns a storage implementation', async () => {
      const ref = createStorageReference('foo');
      impl.getStorage.mockResolvedValue([]);
      await expect(impl.getStorage(ref)).resolves.toBeDefined();
      expect(impl.getStorage.mock.calls).toHaveLength(1);
    });

    it('returns a storage implementation with a bucketUrl', async () => {
      const ref = createStorageReference('foo');
      impl.getStorage.mockResolvedValue([]);
      await expect(impl.getStorage(ref, 'myBucketUrl')).resolves.toBeDefined();
      expect(impl.getStorage.mock.calls).toHaveLength(1);
    });

    it('throws with an invalid storage reference', async () => {
      await expect(() => getStorage('foo')).toThrowError(
        "Invalid argument 'app'. Expected a valid FirebaseApp instance..",
      );
    });
  });

  describe('list', () => {
    it('returns a list of references', async () => {
      const ref = createStorageReference('foo');
      impl.list.mockResolvedValue([]);
      await expect(list(ref)).resolves.toBeDefined();
      expect(impl.list.mock.calls).toHaveLength(1);
    });

    it('throws with an invalid storage reference', async () => {
      await expect(() => list('foo')).toThrowError(
        "Invalid argument 'ref'. Expected a StorageReference instance.",
      );
    });

    it('throws with an invalid max results', async () => {
      const ref = createStorageReference('foo', 'bar');

      await expect(() => list(ref, { maxResults: 'foo' })).toThrowError(
        "Invalid argument 'options.maxResults'. Expected a number value.",
      );
    });

    it('throws with an invalid page token', async () => {
      const ref = createStorageReference('foo', 'bar');

      await expect(() => list(ref, { pageToken: 0 })).toThrowError(
        "Invalid argument 'options.pageToken'. Expected a string value.",
      );
    });
  });

  describe('listAll', () => {
    it('returns a list of all references', async () => {
      const ref = createStorageReference('foo');
      impl.listAll.mockResolvedValue([]);
      await expect(listAll(ref)).resolves.toBeDefined();
      expect(impl.listAll.mock.calls).toHaveLength(1);
    });

    it('throws with an invalid storage reference', async () => {
      await expect(() => listAll('foo')).toThrowError(
        "Invalid argument 'ref'. Expected a StorageReference instance.",
      );
    });
  });

  describe('deleteObject', () => {
    it('returns a list of references', async () => {
      const ref = createStorageReference('foo');
      impl.deleteObject.mockResolvedValue({});
      await expect(impl.deleteObject(ref)).resolves.toBeDefined();
      expect(impl.deleteObject.mock.calls).toHaveLength(1);
    });

    it('throws with an invalid storage reference', async () => {
      await expect(() => deleteObject('foo')).toThrowError(
        "Invalid argument 'ref'. Expected a StorageReference instance.",
      );
    });
  });

  describe('getDownloadURL', () => {
    it('returns a download url', async () => {
      const ref = createStorageReference('foo');
      impl.getDownloadURL.mockResolvedValue({});
      await expect(impl.getDownloadURL(ref)).resolves.toBeDefined();
      expect(impl.getDownloadURL.mock.calls).toHaveLength(1);
    });

    it('throws with an invalid storage reference', async () => {
      await expect(() => getDownloadURL('foo')).toThrowError(
        "Invalid argument 'ref'. Expected a StorageReference instance.",
      );
    });
  });

  describe('getMetaData', () => {
    it('returns metadata', async () => {
      const ref = createStorageReference('foo');
      impl.getMetadata.mockResolvedValue({});
      await expect(impl.getMetadata(ref)).resolves.toBeDefined();
      expect(impl.getMetadata.mock.calls).toHaveLength(1);
    });

    it('throws with an invalid storage reference', async () => {
      await expect(() => getMetadata('foo')).toThrowError(
        "Invalid argument 'ref'. Expected a StorageReference instance.",
      );
    });
  });

  describe('setMaxDownloadRetryTime', () => {
    it('sets max download retry time', async () => {
      const ref = createStorageReference('foo');
      impl.setMaxUploadRetryTime.mockResolvedValue({});

      await impl.setMaxUploadRetryTime(ref, 10);
      expect(impl.setMaxUploadRetryTime.mock.calls).toHaveLength(1);
    });
  });

  describe('updateMetadata', () => {
    it('returns updated metadata', async () => {
      const ref = createStorageReference('foo');
      impl.updateMetadata.mockResolvedValue({});

      await impl.updateMetadata(ref, {});
      expect(impl.updateMetadata.mock.calls).toHaveLength(1);
    });
  });

  describe('toUploadResult', () => {
    it('returns an uploaded result', async () => {
      const ref = createStorageReference('foo');
      impl.uploadBytes.mockResolvedValue({});

      await impl.uploadBytes(ref, {});
      expect(impl.uploadBytes.mock.calls).toHaveLength(1);
    });
  });

  describe('ref', () => {
    it('returns a storage implementation from a reference, without a url or path', async () => {
      const storageReference = createStorageReference();

      const instance = ref(storageReference);
      expect(instance._storage.app.name).toBe('myApp');
    });
    it('returns a storage implementation with a valid http storage url', async () => {
      const storageReference = createStorageService('foo');

      const instance = ref(
        storageReference,
        'https://firebasestorage.googleapis.com/b/bucket/o/images%20stars.jpg',
      );

      expect(instance._storage.app).toBe('foo');
    });

    it('returns a storage implementation with a valid gs storage url', async () => {
      const storageReference = createStorageService('foo');

      const instance = ref(
        storageReference,
        'gs://firebasestorage.googleapis.com/b/bucket/o/images%20stars.jpg',
      );

      expect(instance._storage.app).toBe('foo');
    });
    it('throws an error with a valid instance and invalid http storage url', async () => {
      const storageReference = createStorageService('foo');

      await expect(() => ref(storageReference, 'http')).toThrowError(
        "Invalid argument 'url'. Unable to parse provided URL, ensure it's a valid storage url.",
      );
    });

    it('throws an error with an invalid service instance and non http or gs storage url', async () => {
      const storageReference = createStorageService('foo');

      await expect(() => ref(null, 'unknown')).toThrowError(
        "Invalid argument 'storage'. Expected a StorageService instance.",
      );
    });

    it('throws an error with a valid instance and invalid gs storage url', async () => {
      const storageReference = createStorageService('foo');

      await expect(() => ref(storageReference, 'gs://')).toThrowError(
        "Invalid argument 'url'. Unable to parse provided URL, ensure it's a valid Google Storage url.",
      );
    });

    it('throws with no valid service or reference with an invalid gs reference', async () => {
      const storageReference = createStorageReference('foo');

      await expect(() => ref(null, 'gs://')).toThrowError(
        "Invalid argument 'storageOrRef'. Expected either a StorageService or StorageReference instance.",
      );
    });

    it('throws with no valid service or reference with an invalid http reference', async () => {
      const storageReference = createStorageReference('foo');

      await expect(() => ref(null, 'http://')).toThrowError(
        "Invalid argument 'storageOrRef'. Expected either a StorageService or StorageReference instance.",
      );
    });
  });
});
