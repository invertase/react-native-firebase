/**
 * Known differences between the firebase-js-sdk @firebase/firestore public
 * API and the @react-native-firebase/firestore modular API.
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 *
 * Sections:
 *  nameMapping     — exports that exist in both packages but under different names
 *  missingInRN     — firebase-js-sdk exports absent from RN Firebase
 *  extraInRN       — RN Firebase exports not present in the firebase-js-sdk
 *  differentShape  — exports present in both but with differing signatures/members
 */

import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  // ---------------------------------------------------------------------------
  // Name mapping
  // ---------------------------------------------------------------------------
  nameMapping: {},

  // ---------------------------------------------------------------------------
  // Missing in RN Firebase
  // ---------------------------------------------------------------------------
  missingInRN: [
    // --- Functions ---
    {
      name: 'aggregateFieldEqual',
      reason:
        'Equality comparison helper for AggregateField instances. Not yet ' +
        'implemented in RN Firebase.',
    },
    {
      name: 'aggregateQuerySnapshotEqual',
      reason:
        'Equality comparison helper for AggregateQuerySnapshot instances. Not ' +
        'yet implemented in RN Firebase.',
    },
    {
      name: 'documentSnapshotFromJSON',
      reason:
        'Deserialises a DocumentSnapshot from a JSON representation. Part of ' +
        'the firebase-js-sdk serialization API not yet available in RN Firebase.',
    },
    {
      name: 'enableIndexedDbPersistence',
      reason:
        'Web-specific IndexedDB persistence API. Deprecated in the firebase-js-sdk ' +
        'in favour of the local cache APIs. Not applicable to React Native which ' +
        'uses native platform persistence.',
    },
    {
      name: 'enableMultiTabIndexedDbPersistence',
      reason:
        'Web-specific multi-tab IndexedDB persistence API. Deprecated in the ' +
        'firebase-js-sdk. Not applicable to React Native.',
    },
    {
      name: 'memoryEagerGarbageCollector',
      reason:
        'Factory for the memory eager garbage collector used with memoryLocalCache. ' +
        'The local cache configuration API is not yet implemented in RN Firebase; ' +
        'persistence is controlled via native platform settings.',
    },
    {
      name: 'memoryLocalCache',
      reason:
        'Factory for an in-memory local cache instance. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'memoryLruGarbageCollector',
      reason:
        'Factory for the memory LRU garbage collector used with memoryLocalCache. ' +
        'The local cache configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'onSnapshotResume',
      reason:
        'Resumes a snapshot listener from a previously-serialized resume token. ' +
        'Part of the firebase-js-sdk snapshot serialization API not yet available ' +
        'in RN Firebase.',
    },
    {
      name: 'persistentLocalCache',
      reason:
        'Factory for a persistent local cache instance. The local cache ' +
        'configuration API is not yet implemented in RN Firebase; persistence ' +
        'is controlled via native platform settings.',
    },
    {
      name: 'persistentMultipleTabManager',
      reason:
        'Factory for the persistent multi-tab manager. Not applicable to ' +
        'React Native which does not have a multi-tab environment.',
    },
    {
      name: 'persistentSingleTabManager',
      reason:
        'Factory for the persistent single-tab manager. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'querySnapshotFromJSON',
      reason:
        'Deserialises a QuerySnapshot from a JSON representation. Part of ' +
        'the firebase-js-sdk serialization API not yet available in RN Firebase.',
    },
    {
      name: 'setIndexConfiguration',
      reason:
        'Configures Firestore indexes from a JSON or Protobuf configuration. ' +
        'Deprecated in the firebase-js-sdk. Not implemented in RN Firebase.',
    },

    // --- Types / Interfaces ---
    {
      name: 'FirestoreErrorCode',
      reason:
        'Union type of all Firestore error codes. RN Firebase uses ' +
        'ReactNativeFirebase.NativeFirebaseError for error handling instead.',
    },
    {
      name: 'Index',
      reason:
        'Type used with setIndexConfiguration. Not implemented in RN Firebase ' +
        'as setIndexConfiguration is not supported.',
    },
    {
      name: 'IndexConfiguration',
      reason:
        'Type used with setIndexConfiguration. Not implemented in RN Firebase ' +
        'as setIndexConfiguration is not supported.',
    },
    {
      name: 'IndexField',
      reason:
        'Type used with setIndexConfiguration. Not implemented in RN Firebase ' +
        'as setIndexConfiguration is not supported.',
    },
    {
      name: 'ListenSource',
      reason:
        'Union type for snapshot listener source (default, server, cache). ' +
        'Not yet implemented in RN Firebase; listeners always use default behaviour.',
    },
    {
      name: 'MemoryCacheSettings',
      reason:
        'Configuration interface for the memory local cache. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'MemoryEagerGarbageCollector',
      reason:
        'Interface for the memory eager garbage collector. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'MemoryGarbageCollector',
      reason:
        'Base interface for memory garbage collector strategies. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'MemoryLruGarbageCollector',
      reason:
        'Interface for the memory LRU garbage collector. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'PersistentCacheSettings',
      reason:
        'Configuration interface for the persistent local cache. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'PersistentMultipleTabManager',
      reason:
        'Interface for the persistent multi-tab manager. Not applicable to ' +
        'React Native which does not have a multi-tab environment.',
    },
    {
      name: 'PersistentSingleTabManager',
      reason:
        'Interface for the persistent single-tab manager. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'PersistentSingleTabManagerSettings',
      reason:
        'Configuration interface for the persistent single-tab manager. The local ' +
        'cache configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'PersistentTabManager',
      reason:
        'Base interface for persistent tab manager strategies. The local cache ' +
        'configuration API is not yet implemented in RN Firebase.',
    },
    {
      name: 'TransactionOptions',
      reason:
        'Options object for runTransaction (e.g. maxAttempts). Not yet supported ' +
        'by the RN Firebase native transaction implementation.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Extra in RN Firebase
  // ---------------------------------------------------------------------------
  extraInRN: [
    {
      name: 'FirebaseApp',
      reason:
        'Re-exported type alias for `ReactNativeFirebase.FirebaseApp` from ' +
        '`@react-native-firebase/app`. Used as the app parameter type in RN ' +
        'Firebase functions. Not part of the firebase-js-sdk public Firestore API.',
    },
    {
      name: 'PrivateSettings',
      reason:
        'Extended FirestoreSettings interface with internal properties ' +
        '(credentials, useFetchStreams, emulatorOptions). Exposed for internal ' +
        'use; not part of the firebase-js-sdk public API.',
    },
    {
      name: 'clearPersistence',
      reason:
        'RN Firebase-specific alias for clearIndexedDbPersistence. Provides a ' +
        'platform-agnostic name since React Native does not use IndexedDB.',
    },
    {
      name: 'Filter',
      reason:
        'RN Firebase-specific helper class for constructing composite query ' +
        'filters. Provides a convenience API on top of the standard `where`, ' +
        '`and`, and `or` filter functions.',
    },
    {
      name: 'FirestoreError',
      reason:
        'Type alias for `Error` in RN Firebase. The firebase-js-sdk uses ' +
        '`FirestoreError` as a class extending `FirebaseError`, but RN Firebase ' +
        'uses its own `NativeFirebaseError` type for error handling.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Different shape
  // ---------------------------------------------------------------------------
  differentShape: [
    {
      name: 'collection',
      reason:
        'RN Firebase uses a single overload accepting ' +
        '`Firestore | DocumentReference | CollectionReference` as the first ' +
        'parameter, whereas the firebase-js-sdk defines separate overloads for each.',
    },
    {
      name: 'deleteAllPersistentCacheIndexes',
      reason:
        'Returns `Promise<void>` in RN Firebase vs `void` in the firebase-js-sdk. ' +
        'The RN implementation is async because it delegates to the native module.',
    },
    {
      name: 'disablePersistentCacheIndexAutoCreation',
      reason:
        'Returns `Promise<void>` in RN Firebase vs `void` in the firebase-js-sdk. ' +
        'The RN implementation is async because it delegates to the native module.',
    },
    {
      name: 'doc',
      reason:
        'RN Firebase uses a single overload accepting ' +
        '`Firestore | CollectionReference | DocumentReference` as the first ' +
        'parameter, whereas the firebase-js-sdk defines separate overloads for each.',
    },
    {
      name: 'enablePersistentCacheIndexAutoCreation',
      reason:
        'Returns `Promise<void>` in RN Firebase vs `void` in the firebase-js-sdk. ' +
        'The RN implementation is async because it delegates to the native module.',
    },
    {
      name: 'initializeFirestore',
      reason:
        'Returns `Promise<Firestore>` in RN Firebase vs `Firestore` in the ' +
        'firebase-js-sdk. The RN implementation is async because it initialises ' +
        'the native Firestore module.',
    },
    {
      name: 'onSnapshotsInSync',
      reason:
        'The observer `next` callback has no parameter in RN Firebase vs ' +
        '`(value: void) => void` in the firebase-js-sdk, and the `error` callback ' +
        'uses `Error` instead of `FirestoreError`. Both differences are cosmetic; ' +
        'the behaviour is equivalent.',
    },
    {
      name: 'runTransaction',
      reason:
        'The firebase-js-sdk accepts an optional `TransactionOptions` parameter ' +
        '(e.g. maxAttempts) which is not yet supported by the RN Firebase native ' +
        'transaction implementation.',
    },
    {
      name: 'updateDoc',
      reason:
        'RN Firebase merges the overloads into a single signature accepting ' +
        '`string | FieldPath | UpdateData<DbModelType>` as the second parameter, ' +
        'whereas the firebase-js-sdk defines separate overloads for the data object ' +
        'vs field/value pair forms.',
    },
    {
      name: 'AggregateFieldType',
      reason:
        'RN Firebase defines AggregateFieldType as `AggregateField<number> | ' +
        'AggregateField<number | null>` whereas the firebase-js-sdk uses ' +
        '`ReturnType<typeof sum> | ReturnType<typeof average> | ReturnType<typeof count>`. ' +
        'Both resolve to equivalent types at runtime.',
    },
    {
      name: 'EmulatorMockTokenOptions',
      reason:
        'The firebase-js-sdk intersects `{ user_id: string } | { sub: string }` ' +
        'with `Partial<FirebaseIdToken>`, allowing additional ID token claims. ' +
        'RN Firebase uses the simpler union without the intersection.',
    },
    {
      name: 'FirestoreSettings',
      reason:
        'RN Firebase adds `persistence` (boolean) and `serverTimestampBehavior` ' +
        'settings that do not exist in the firebase-js-sdk. These are RN-specific ' +
        'settings for controlling native persistence and server timestamp behaviour.',
    },
    {
      name: 'LogLevel',
      reason:
        'RN Firebase supports a subset of log levels (`debug | error | silent`) ' +
        'compared to the firebase-js-sdk which includes `verbose`, `info`, and ' +
        '`warn` as well. The native logging bridge only supports these three levels.',
    },
    {
      name: 'MemoryLocalCache',
      reason:
        'RN Firebase exposes internal `_onlineComponentProvider` and ' +
        '`_offlineComponentProvider` members that are not part of the ' +
        'firebase-js-sdk public type. These are structural artefacts of the ' +
        'RN implementation.',
    },
    {
      name: 'PersistentLocalCache',
      reason:
        'RN Firebase exposes internal `_onlineComponentProvider` and ' +
        '`_offlineComponentProvider` members that are not part of the ' +
        'firebase-js-sdk public type. These are structural artefacts of the ' +
        'RN implementation.',
    },
    {
      name: 'SnapshotListenOptions',
      reason:
        'The firebase-js-sdk includes an optional `source` property (of type ' +
        '`ListenSource`) which is not yet supported in RN Firebase.',
    },
  ],
};

export default config;
