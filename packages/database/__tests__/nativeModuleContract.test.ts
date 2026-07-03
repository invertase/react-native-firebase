import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TurboModuleRegistry } from 'react-native';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import FirebaseModule from '@react-native-firebase/app/dist/module/internal/FirebaseModule';
import { getNativeModule } from '@react-native-firebase/app/dist/module/internal/registry/nativeModule';
import type { WrappedNativeModule } from '@react-native-firebase/app/dist/module/internal/NativeModules';
import { createTurboModuleFixture } from '../../app/__tests__/turboModuleContractHelper';

const defaultTurboModuleRegistryGet = jest.mocked(TurboModuleRegistry.get).getMockImplementation();

const MAIN_METHODS = [
  'goOnline',
  'goOffline',
  'setPersistenceEnabled',
  'setLoggingEnabled',
  'setPersistenceCacheSizeBytes',
  'useEmulator',
] as const;

const REFERENCE_METHODS = ['set', 'update', 'setWithPriority', 'remove', 'setPriority'] as const;

const QUERY_METHODS = ['once', 'on', 'off', 'keepSynced'] as const;

const ON_DISCONNECT_METHODS = [
  'onDisconnectCancel',
  'onDisconnectRemove',
  'onDisconnectSet',
  'onDisconnectSetWithPriority',
  'onDisconnectUpdate',
] as const;

const TRANSACTION_METHODS = ['transactionStart', 'transactionTryCommit'] as const;

const HOST_METHOD_GROUPS = [
  { host: 'NativeRNFBTurboDatabase', methods: MAIN_METHODS },
  { host: 'NativeRNFBTurboDatabaseReference', methods: REFERENCE_METHODS },
  { host: 'NativeRNFBTurboDatabaseQuery', methods: QUERY_METHODS },
  { host: 'NativeRNFBTurboDatabaseOnDisconnect', methods: ON_DISCONNECT_METHODS },
  { host: 'NativeRNFBTurboDatabaseTransaction', methods: TRANSACTION_METHODS },
] as const;

const ALL_SPEC_METHODS = [
  ...MAIN_METHODS,
  ...REFERENCE_METHODS,
  ...QUERY_METHODS,
  ...ON_DISCONNECT_METHODS,
  ...TRANSACTION_METHODS,
];

const MERGE_CONFIG: ModuleConfig = {
  namespace: 'databaseContract',
  nativeModuleName: HOST_METHOD_GROUPS.map(group => group.host),
  nativeEvents: ['database_transaction_event', 'database_sync_event'],
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  turboModule: true,
};

function createMergeModule(namespace = MERGE_CONFIG.namespace): FirebaseModule<any> {
  class MergeModule extends FirebaseModule<any> {
    constructor() {
      super({ name: '[DEFAULT]' } as any, { ...MERGE_CONFIG, namespace });
    }
  }

  return new MergeModule();
}

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  beforeEach(function () {
    const turboModuleGet = jest.mocked(TurboModuleRegistry.get);
    turboModuleGet.mockReset();
    if (defaultTurboModuleRegistryGet) {
      turboModuleGet.mockImplementation(defaultTurboModuleRegistryGet);
    }
  });

  it('asserts merged Database spec method names are unique (NewArch-AD-11)', function () {
    expect(new Set(ALL_SPEC_METHODS).size).toBe(ALL_SPEC_METHODS.length);
    expect(ALL_SPEC_METHODS).toHaveLength(22);
  });

  it('asserts per-host method counts match ALL_SPEC_METHODS grouping', function () {
    expect(MAIN_METHODS).toHaveLength(6);
    expect(REFERENCE_METHODS).toHaveLength(5);
    expect(QUERY_METHODS).toHaveLength(4);
    expect(ON_DISCONNECT_METHODS).toHaveLength(5);
    expect(TRANSACTION_METHODS).toHaveLength(2);
    expect(HOST_METHOD_GROUPS).toHaveLength(5);

    const groupedMethods = HOST_METHOD_GROUPS.flatMap(group => group.methods);
    expect(groupedMethods).toEqual(ALL_SPEC_METHODS);
    expect(new Set(groupedMethods).size).toBe(ALL_SPEC_METHODS.length);
  });

  it('routes methods through a 5-host merge composite Proxy (NewArch-AD-14a)', function () {
    const mainMethod = jest.fn(() => 'main');
    const referenceMethod = jest.fn(() => 'reference');
    const queryMethod = jest.fn(() => 'query');
    const onDisconnectMethod = jest.fn(() => 'onDisconnect');
    const transactionMethod = jest.fn(() => 'transaction');

    const hostMain = createTurboModuleFixture({ goOnline: mainMethod });
    const hostReference = createTurboModuleFixture({ set: referenceMethod });
    const hostQuery = createTurboModuleFixture({ once: queryMethod });
    const hostOnDisconnect = createTurboModuleFixture({ onDisconnectSet: onDisconnectMethod });
    const hostTransaction = createTurboModuleFixture({ transactionStart: transactionMethod });

    jest
      .mocked(TurboModuleRegistry.get)
      .mockReturnValueOnce(hostMain)
      .mockReturnValueOnce(hostReference)
      .mockReturnValueOnce(hostQuery)
      .mockReturnValueOnce(hostOnDisconnect)
      .mockReturnValueOnce(hostTransaction);

    const wrapped = getNativeModule(createMergeModule()) as WrappedNativeModule & {
      goOnline: () => string;
      set: () => string;
      once: () => string;
      onDisconnectSet: () => string;
      transactionStart: () => string;
    };

    expect(wrapped.goOnline()).toBe('main');
    expect(wrapped.set()).toBe('reference');
    expect(wrapped.once()).toBe('query');
    expect(wrapped.onDisconnectSet()).toBe('onDisconnect');
    expect(wrapped.transactionStart()).toBe('transaction');
    expect(mainMethod).toHaveBeenCalledTimes(1);
    expect(referenceMethod).toHaveBeenCalledTimes(1);
    expect(queryMethod).toHaveBeenCalledTimes(1);
    expect(onDisconnectMethod).toHaveBeenCalledTimes(1);
    expect(transactionMethod).toHaveBeenCalledTimes(1);
    expect(Object.keys(wrapped).sort()).toEqual([
      'goOnline',
      'onDisconnectSet',
      'once',
      'set',
      'transactionStart',
    ]);
  });

  it('routes every host method through the 5-host merge composite Proxy', function () {
    const mocks = Object.fromEntries(
      ALL_SPEC_METHODS.map(method => [method, jest.fn(() => method)]),
    ) as Record<(typeof ALL_SPEC_METHODS)[number], jest.Mock>;

    for (const group of HOST_METHOD_GROUPS) {
      const hostMethods = Object.fromEntries(group.methods.map(method => [method, mocks[method]]));
      jest
        .mocked(TurboModuleRegistry.get)
        .mockReturnValueOnce(createTurboModuleFixture(hostMethods));
    }

    const wrapped = getNativeModule(
      createMergeModule('databaseContractAllMethods'),
    ) as WrappedNativeModule & Record<(typeof ALL_SPEC_METHODS)[number], () => string>;

    for (const method of ALL_SPEC_METHODS) {
      expect(wrapped[method]()).toBe(method);
      expect(mocks[method]).toHaveBeenCalledTimes(1);
      expect(Object.keys(wrapped)).toContain(method);
    }

    expect(Object.keys(wrapped).sort()).toEqual([...ALL_SPEC_METHODS].sort());
  });
  it('returns synchronously from goOnline and goOffline on the main host (Phase S)', function () {
    const goOnlineMock = jest.fn();
    const goOfflineMock = jest.fn();

    jest
      .mocked(TurboModuleRegistry.get)
      .mockReturnValueOnce(
        createTurboModuleFixture({ goOnline: goOnlineMock, goOffline: goOfflineMock }),
      )
      .mockReturnValueOnce(createTurboModuleFixture({}))
      .mockReturnValueOnce(createTurboModuleFixture({}))
      .mockReturnValueOnce(createTurboModuleFixture({}))
      .mockReturnValueOnce(createTurboModuleFixture({}));

    const wrapped = getNativeModule(
      createMergeModule('databaseSyncConnection'),
    ) as WrappedNativeModule & {
      goOnline: () => unknown;
      goOffline: () => unknown;
    };

    const onlineResult = wrapped.goOnline();
    expect(onlineResult).toBeUndefined();
    expect(onlineResult).not.toBeInstanceOf(Promise);
    expect(goOnlineMock).toHaveBeenCalledTimes(1);

    const offlineResult = wrapped.goOffline();
    expect(offlineResult).toBeUndefined();
    expect(offlineResult).not.toBeInstanceOf(Promise);
    expect(goOfflineMock).toHaveBeenCalledTimes(1);
  });
});
