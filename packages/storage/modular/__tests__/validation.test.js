import { StringFormat } from '../src';
import * as validation from '../src/validation';
import { createStorageReference, createStorageService } from './helpers';

describe('validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isStorageService', () => {
    it('returns true with a valid storage service', async () => {
      const ref = createStorageService('foo');
      const result = validation.isStorageService(ref);

      expect(result).toBeTruthy();
    });

    it('returns false when not a storage service', async () => {
      const result = validation.isStorageService({});

      expect(result).toBeFalsy();
    });
  });

  describe('isStorageReference', () => {
    it('returns true with a valid storage reference', async () => {
      const ref = createStorageReference('foo');
      const result = validation.isStorageReference(ref);

      expect(result).toBeTruthy();
    });

    it('returns false when not a storage reference', async () => {
      const result = validation.isStorageReference({});

      expect(result).toBeFalsy();
    });
  });

  describe('isStringFormat', () => {
    it('returns true with a valid string format', async () => {
      const result = validation.isStringFormat(StringFormat.BASE64);

      expect(result).toBeTruthy();
    });

    it('returns false when not a valid string format', async () => {
      const result = validation.isStringFormat();

      expect(result).toBeFalsy();
    });
  });

  describe('toSettableMetadata', () => {
    it('returns default metadata', async () => {
      const result = validation.toSettableMetadata({});

      expect(result.cacheControl).toBeUndefined();
      expect(result.contentDisposition).toBeUndefined();
      expect(result.contentEncoding).toBeUndefined();
      expect(result.contentLanguage).toBeUndefined();
      expect(result.contentType).toBeUndefined();
      expect(result.customMetadata).toEqual({});
    });

    it('returns updated metadata', async () => {
      const result = validation.toSettableMetadata({ cacheControl: 'test' });

      expect(result.cacheControl).toEqual('test');
    });

    it('returns updated custom metadata', async () => {
      const result = validation.toSettableMetadata({ customMetadata: { example: 'test' } });

      expect(result.customMetadata).toEqual({ example: 'test' });
    });
  });

  describe('toUploadMetadata', () => {
    it('returns default metadata', async () => {
      const result = validation.toUploadMetadata({});

      expect(result.cacheControl).toBeUndefined();
      expect(result.contentDisposition).toBeUndefined();
      expect(result.contentEncoding).toBeUndefined();
      expect(result.contentLanguage).toBeUndefined();
      expect(result.contentType).toBeUndefined();
      expect(result.md5Hash).toBeUndefined();
      expect(result.customMetadata).toEqual({});
    });
  });

  describe('toFullMetadata', () => {
    it('returns full metatdata', async () => {
      const ref = createStorageService('foo');
      const result = validation.toFullMetadata({ customMetadata: { foo: 'bar' } }, ref);

      expect(result.customMetadata.foo).toBe('bar');
      expect(result.ref.app).toBe('foo');
    });
  });

  describe('toUploadResult', () => {
    it('returns uploaded result metadata', async () => {
      const ref = createStorageService('foo');
      const result = validation.toUploadResult(ref, { customMetadata: { foo: 'bar' } });

      expect(result.metadata.customMetadata.foo).toBe('bar');
      expect(result.ref.app).toBe('foo');
    });
  });
});
