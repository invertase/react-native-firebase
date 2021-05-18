import * as utils from '../src/utils';
import { StringFormat } from '../src';

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('partsFromHttpUrl', () => {
    it('returns valid url parts', async () => {
      const url = utils.partsFromHttpUrl(
        'https://firebasestorage.googleapis.com/v0/b/project-nameappspot.com/o/example-image-path.png',
      );

      expect(url.bucket).toEqual('gs://project-nameappspot.com');
      expect(url.path).toEqual('example-image-path.png');
    });

    it('returns null with invalid url parts', async () => {
      const url = utils.partsFromHttpUrl('https://test.com');

      expect(url).toBeNull();
    });
  });

  describe('partsFromGsUrl', () => {
    it('returns valid url', async () => {
      const url = utils.partsFromGsUrl(
        'gs://react-native-firebase-testing.appspot.com/example-image-path.png',
      );

      expect(url.bucket).toEqual('gs://react-native-firebase-testing.appspot.com');
      expect(url.path).toEqual('example-image-path.png');
    });
  });

  describe('decodeFilePath', () => {
    it('returns valid filepath', async () => {
      const url = utils.decodeFilePath('file://example.example-image-path.png');

      expect(url).toEqual('example.example-image-path.png');
    });

    it('returns valid decoded filepath', async () => {
      const url = utils.decodeFilePath('file://example%20image%20path.png');

      expect(url).toEqual('example image path.png');
    });
  });

  describe('decodeStringFormat', () => {
    it('returns valid RAW format', async () => {
      const result = utils.decodeStringFormat('test', StringFormat.RAW);

      expect(result.format).toEqual('base64');
      expect(result.value).toEqual('dGVzdA==');
    });

    it('returns valid format with MetaData', async () => {
      const result = utils.decodeStringFormat('test', StringFormat.RAW, { example: 'test' });

      expect(result.format).toEqual('base64');
      expect(result.value).toEqual('dGVzdA==');
      expect(result.metadata).toEqual({ example: 'test' });
    });

    it('returns valid DATA_URL format', async () => {
      const result = utils.decodeStringFormat(
        'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
        StringFormat.DATA_URL,
      );

      expect(result.format).toEqual('base64');
      expect(result.value).toEqual('SGVsbG8sIFdvcmxkIQ==');
    });

    it('throws an error with an invalid DATA_URL format', async () => {
      expect(() => utils.decodeStringFormat('test', StringFormat.DATA_URL)).toThrow(
        'decodeStringFormat: an invalid data_url string was provided',
      );
    });
  });
});
