import { describe, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
  'deleteObject',
  'getDownloadURL',
  'getMetadata',
  'updateMetadata',
  'list',
  'listAll',
  'setMaxDownloadRetryTime',
  'setMaxOperationRetryTime',
  'setMaxUploadRetryTime',
  'useEmulator',
  'writeToFile',
  'putFile',
  'putString',
  'setTaskStatus',
] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract(
      {
        namespace: 'storage',
        nativeModuleName: 'NativeRNFBTurboStorage',
        nativeEvents: ['storage_event'],
        hasMultiAppSupport: true,
        hasCustomUrlOrRegionSupport: true,
        disablePrependCustomUrlOrRegion: true,
        turboModule: true,
        specMethods: SPEC_METHODS,
        customUrlOrRegion: 'gs://test-bucket',
        createMock: method =>
          jest.fn(() =>
            method === 'useEmulator' || method === 'setTaskStatus'
              ? method === 'setTaskStatus'
                ? Promise.resolve(true)
                : undefined
              : Promise.resolve(),
          ),
        customizeRaw: raw => {
          Object.defineProperty(raw, 'getConstants', {
            value: jest.fn(() => ({
              maxUploadRetryTime: 0,
              maxDownloadRetryTime: 0,
              maxOperationRetryTime: 0,
            })),
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(raw, 'maxUploadRetryTime', {
            value: 0,
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(raw, 'maxDownloadRetryTime', {
            value: 0,
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(raw, 'maxOperationRetryTime', {
            value: 0,
            enumerable: true,
            configurable: true,
          });
        },
      },
      {
        useEmulator: wrapped => {
          wrapped.useEmulator('localhost', 9199, 'gs://test-bucket');
        },
        list: wrapped => {
          void wrapped.list('gs://test-bucket/path', { maxResults: 10, pageToken: null });
        },
        updateMetadata: wrapped => {
          void wrapped.updateMetadata('gs://test-bucket/path', { contentType: 'text/plain' });
        },
        putFile: wrapped => {
          void wrapped.putFile('gs://test-bucket/path', '/tmp/file', {}, 1);
        },
        putString: wrapped => {
          void wrapped.putString('gs://test-bucket/path', 'data', 'raw', {}, 1);
        },
        writeToFile: wrapped => {
          void wrapped.writeToFile('gs://test-bucket/path', '/tmp/file', 1);
        },
        setTaskStatus: wrapped => {
          void wrapped.setTaskStatus(1, 0);
        },
        setMaxDownloadRetryTime: wrapped => {
          void wrapped.setMaxDownloadRetryTime(60000);
        },
        setMaxOperationRetryTime: wrapped => {
          void wrapped.setMaxOperationRetryTime(60000);
        },
        setMaxUploadRetryTime: wrapped => {
          void wrapped.setMaxUploadRetryTime(60000);
        },
        getDownloadURL: wrapped => {
          void wrapped.getDownloadURL('gs://test-bucket/path');
        },
        getMetadata: wrapped => {
          void wrapped.getMetadata('gs://test-bucket/path');
        },
        listAll: wrapped => {
          void wrapped.listAll('gs://test-bucket/path');
        },
        deleteObject: wrapped => {
          void wrapped.deleteObject('gs://test-bucket/path');
        },
      },
    );
  });
});
