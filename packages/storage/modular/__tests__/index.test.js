import { listAll, list } from '../src';
import * as impl from '../src/impl';

import { createStorageReference } from './helpers';

jest.mock('../src/impl');

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStorage', () => {
    it('returns a storage reference', async () => {
      const ref = createStorageReference('foo');
      impl.getStorage.mockResolvedValue([]);
      await expect(impl.getStorage(ref)).resolves.toBeDefined();
      expect(impl.getStorage.mock.calls).toHaveLength(1);
    });

    it('returns a storage reference with a bucketUrl', async () => {
      const ref = createStorageReference('foo');
      impl.getStorage.mockResolvedValue([]);
      await expect(impl.getStorage(ref, 'myBucketUrl')).resolves.toBeDefined();
      expect(impl.getStorage.mock.calls).toHaveLength(1);
    });
  });

  describe('list', () => {
    it('returns a list of references', async () => {
      const ref = createStorageReference('foo');
      impl.list.mockResolvedValue([]);
      await expect(list(ref)).resolves.toBeDefined();
      expect(impl.list.mock.calls).toHaveLength(1);
    });
  });

  describe('listAll', () => {
    it('returns a list of all references', async () => {
      const ref = createStorageReference('foo');
      impl.listAll.mockResolvedValue([]);
      await expect(listAll(ref)).resolves.toBeDefined();
      expect(impl.listAll.mock.calls).toHaveLength(1);
    });
  });

  describe('deleteObject', () => {
    it('returns a list of references', async () => {
      const ref = createStorageReference('foo');
      impl.deleteObject.mockResolvedValue({});
      await expect(impl.deleteObject(ref)).resolves.toBeDefined();
      expect(impl.deleteObject.mock.calls).toHaveLength(1);
    });
  });

  describe('getDownloadURL', () => {
    it('returns a download url', async () => {
      const ref = createStorageReference('foo');
      impl.getDownloadURL.mockResolvedValue({});
      await expect(impl.getDownloadURL(ref)).resolves.toBeDefined();
      expect(impl.getDownloadURL.mock.calls).toHaveLength(1);
    });
  });

  describe('getMetaData', () => {
    it('returns metadata', async () => {
      const ref = createStorageReference('foo');
      impl.getMetadata.mockResolvedValue({});
      await expect(impl.getMetadata(ref)).resolves.toBeDefined();
      expect(impl.getMetadata.mock.calls).toHaveLength(1);
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
});
