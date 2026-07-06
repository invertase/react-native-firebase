import { describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import FirebaseModule from '@react-native-firebase/app/dist/module/internal/FirebaseModule';
import { getNativeModule } from '@react-native-firebase/app/dist/module/internal/registry/nativeModule';
import type { WrappedNativeModule } from '@react-native-firebase/app/dist/module/internal/NativeModules';
import { createTurboModuleFixture } from '../../app/__tests__/turboModuleContractHelper';

const MAIN_METHODS = [
  'setLogLevel',
  'loadBundle',
  'clearPersistence',
  'waitForPendingWrites',
  'disableNetwork',
  'enableNetwork',
  'useEmulator',
  'settings',
  'terminate',
  'persistenceCacheIndexManager',
  'addSnapshotsInSync',
  'removeSnapshotsInSync',
] as const;

const COLLECTION_METHODS = [
  'namedQueryOnSnapshot',
  'collectionOnSnapshot',
  'collectionOffSnapshot',
  'namedQueryGet',
  'collectionCount',
  'aggregateQuery',
  'pipelineExecute',
  'collectionGet',
] as const;

const DOCUMENT_METHODS = [
  'documentOnSnapshot',
  'documentOffSnapshot',
  'documentGet',
  'documentDelete',
  'documentSet',
  'documentUpdate',
  'documentBatch',
] as const;

const TRANSACTION_METHODS = [
  'transactionBegin',
  'transactionGetDocument',
  'transactionDispose',
  'transactionApplyBuffer',
] as const;

const ALL_SPEC_METHODS = [
  ...MAIN_METHODS,
  ...COLLECTION_METHODS,
  ...DOCUMENT_METHODS,
  ...TRANSACTION_METHODS,
];

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('asserts merged Firestore spec method names are unique (NewArch-AD-11)', function () {
    expect(new Set(ALL_SPEC_METHODS).size).toBe(ALL_SPEC_METHODS.length);
    expect(ALL_SPEC_METHODS).toHaveLength(31);
  });

  it('routes methods through a 4-host merge composite Proxy (NewArch-AD-14a)', function () {
    const mainMethod = jest.fn(() => 'main');
    const collectionMethod = jest.fn(() => 'collection');
    const documentMethod = jest.fn(() => 'document');
    const transactionMethod = jest.fn(() => 'transaction');

    const hostMain = createTurboModuleFixture({ setLogLevel: mainMethod });
    const hostCollection = createTurboModuleFixture({ collectionGet: collectionMethod });
    const hostDocument = createTurboModuleFixture({ documentGet: documentMethod });
    const hostTransaction = createTurboModuleFixture({ transactionBegin: transactionMethod });

    jest
      .mocked(TurboModuleRegistry.get)
      .mockReturnValueOnce(hostMain)
      .mockReturnValueOnce(hostCollection)
      .mockReturnValueOnce(hostDocument)
      .mockReturnValueOnce(hostTransaction);

    const config: ModuleConfig = {
      namespace: 'firestoreContract',
      nativeModuleName: [
        'NativeRNFBTurboFirestore',
        'NativeRNFBTurboFirestoreCollection',
        'NativeRNFBTurboFirestoreDocument',
        'NativeRNFBTurboFirestoreTransaction',
      ],
      nativeEvents: false,
      hasMultiAppSupport: true,
      hasCustomUrlOrRegionSupport: true,
      turboModule: true,
    };

    class MergeModule extends FirebaseModule<any> {
      constructor() {
        super({ name: '[DEFAULT]' } as any, config);
      }
    }

    const wrapped = getNativeModule(new MergeModule()) as WrappedNativeModule & {
      setLogLevel: () => string;
      collectionGet: () => string;
      documentGet: () => string;
      transactionBegin: () => string;
    };

    expect(wrapped.setLogLevel()).toBe('main');
    expect(wrapped.collectionGet()).toBe('collection');
    expect(wrapped.documentGet()).toBe('document');
    expect(wrapped.transactionBegin()).toBe('transaction');
    expect(mainMethod).toHaveBeenCalledTimes(1);
    expect(collectionMethod).toHaveBeenCalledTimes(1);
    expect(documentMethod).toHaveBeenCalledTimes(1);
    expect(transactionMethod).toHaveBeenCalledTimes(1);
    expect(Object.keys(wrapped).sort()).toEqual([
      'collectionGet',
      'documentGet',
      'setLogLevel',
      'transactionBegin',
    ]);
  });

  it('forwards maxAttempts through transactionBegin', function () {
    const transactionBegin = jest.fn();
    const hostTransaction = createTurboModuleFixture({ transactionBegin });

    jest
      .mocked(TurboModuleRegistry.get)
      .mockReturnValueOnce(createTurboModuleFixture({}))
      .mockReturnValueOnce(createTurboModuleFixture({}))
      .mockReturnValueOnce(createTurboModuleFixture({}))
      .mockReturnValueOnce(hostTransaction);

    const config: ModuleConfig = {
      namespace: 'firestoreContractMaxAttempts',
      nativeModuleName: [
        'NativeRNFBTurboFirestore',
        'NativeRNFBTurboFirestoreCollection',
        'NativeRNFBTurboFirestoreDocument',
        'NativeRNFBTurboFirestoreTransaction',
      ],
      nativeEvents: false,
      hasMultiAppSupport: true,
      hasCustomUrlOrRegionSupport: true,
      turboModule: true,
    };

    class MergeModule extends FirebaseModule<any> {
      constructor() {
        super({ name: '[DEFAULT]' } as any, config);
      }
    }

    const wrapped = getNativeModule(new MergeModule()) as WrappedNativeModule & {
      transactionBegin: (transactionId: number, maxAttempts: number) => void;
    };

    wrapped.transactionBegin(7, 5);

    expect(transactionBegin).toHaveBeenCalledWith('[DEFAULT]', null, 7, 5);
  });
});
