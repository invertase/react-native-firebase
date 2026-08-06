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

import type { PackageConfig } from '../src/types';

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
      name: 'documentSnapshotFromJSON',
      reason:
        'firebase-js-sdk reconstructs web SDK snapshot wrappers from JSON. RN Firebase ' +
        'snapshots are native-backed wrappers, and the Android/iOS Firestore SDKs do not ' +
        'expose cross-platform DocumentSnapshot JSON constructors.',
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
      name: 'maximum',
      reason:
        'FieldValue set/update sentinel (`maximum(n: number)`) exported by firebase-js-sdk ' +
        '12.15.0. Firebase Firestore iOS SDK 12.15.0 does not expose FIRFieldValue ' +
        'maximum/minimum factories (see Firebase iOS FIRFieldValue reference). Firebase ' +
        'Firestore Android SDK 34.15.0 (BOM) exposes FieldValue.maximum/minimum but RN ' +
        'Firebase native serialization does not wire them; cross-platform parity deferred ' +
        'until iOS SDK adds support. User-accepted gap (C1.2b).',
    },
    {
      name: 'memoryEagerGarbageCollector',
      reason:
        'Web local-cache component factory for memoryLocalCache. RN Firebase delegates ' +
        'persistence to the native Firestore SDKs, which do not expose the firebase-js-sdk ' +
        'LocalCache/GarbageCollector component model.',
    },
    {
      name: 'memoryLocalCache',
      reason:
        'Web local-cache factory. React Native targets use the native Firestore SDK cache ' +
        'configured through RN Firebase settings, not firebase-js-sdk LocalCache instances.',
    },
    {
      name: 'memoryLruGarbageCollector',
      reason:
        'Web local-cache component factory for memoryLocalCache. Native Firestore SDK cache ' +
        'configuration does not expose a firebase-js-sdk MemoryLruGarbageCollector object.',
    },
    {
      name: 'minimum',
      reason:
        'FieldValue set/update sentinel (`minimum(n: number)`) exported by firebase-js-sdk ' +
        '12.15.0. Firebase Firestore iOS SDK 12.15.0 does not expose FIRFieldValue ' +
        'maximum/minimum factories (see Firebase iOS FIRFieldValue reference). Firebase ' +
        'Firestore Android SDK 34.15.0 (BOM) exposes FieldValue.maximum/minimum but RN ' +
        'Firebase native serialization does not wire them; cross-platform parity deferred ' +
        'until iOS SDK adds support. User-accepted gap (C1.2b).',
    },
    {
      name: 'onSnapshotResume',
      reason:
        'firebase-js-sdk web snapshot resume API depends on serialized web SDK listener ' +
        'state. RN Firebase listeners are backed by Android/iOS SDK listener state, and ' +
        'those SDKs do not expose a compatible public resume-token constructor.',
    },
    {
      name: 'persistentLocalCache',
      reason:
        'Web persistent local-cache factory. RN Firebase uses native Firestore persistence ' +
        'settings instead of firebase-js-sdk PersistentLocalCache component instances.',
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
        'Web tab-manager factory for persistentLocalCache. React Native has no ' +
        'firebase-js-sdk tab-manager component path; native persistence is controlled by ' +
        'platform SDK settings.',
    },
    {
      name: 'querySnapshotFromJSON',
      reason:
        'firebase-js-sdk reconstructs web SDK query snapshot wrappers from JSON. RN Firebase ' +
        'query snapshots are native-backed wrappers, and the Android/iOS Firestore SDKs do ' +
        'not expose cross-platform QuerySnapshot JSON constructors.',
    },
    {
      name: 'setIndexConfiguration',
      reason:
        'Deprecated in firebase-js-sdk; React Native Firebase will not implement. Native ' +
        'Firestore SDKs do not expose the web JSON/Protobuf index configuration API.',
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
        'Deprecated firebase-js-sdk type used only by setIndexConfiguration. React Native ' +
        'Firebase will not implement that web index configuration API.',
    },
    {
      name: 'IndexConfiguration',
      reason:
        'Deprecated firebase-js-sdk type used only by setIndexConfiguration. React Native ' +
        'Firebase will not implement that web index configuration API.',
    },
    {
      name: 'IndexField',
      reason:
        'Deprecated firebase-js-sdk type used only by setIndexConfiguration. React Native ' +
        'Firebase will not implement that web index configuration API.',
    },
    {
      name: 'MemoryCacheSettings',
      reason:
        'Web memory local-cache configuration interface. RN Firebase exposes native ' +
        'Firestore persistence/cache settings rather than firebase-js-sdk LocalCache objects.',
    },
    {
      name: 'MemoryEagerGarbageCollector',
      reason:
        'Web memory local-cache garbage-collector interface. Native Firestore SDK cache ' +
        'configuration does not expose this firebase-js-sdk component model.',
    },
    {
      name: 'MemoryGarbageCollector',
      reason:
        'Web memory local-cache garbage-collector base interface. Native Firestore SDK cache ' +
        'configuration does not expose this firebase-js-sdk component model.',
    },
    {
      name: 'MemoryLruGarbageCollector',
      reason:
        'Web memory local-cache LRU garbage-collector interface. Native Firestore SDK cache ' +
        'configuration does not expose this firebase-js-sdk component model.',
    },
    {
      name: 'PersistentCacheIndexManager',
      reason:
        'Class in firebase-js-sdk for managing persistent cache indexes. RN Firebase ' +
        'implements this via the native module; the type shape differs (e.g. async methods).',
    },
    {
      name: 'PersistentCacheSettings',
      reason:
        'Web persistent local-cache configuration interface. RN Firebase uses native ' +
        'Firestore persistence settings instead of firebase-js-sdk PersistentLocalCache objects.',
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
        'Web persistent-cache tab-manager interface. React Native has no firebase-js-sdk ' +
        'single-tab manager path; native persistence is controlled by platform SDK settings.',
    },
    {
      name: 'PersistentSingleTabManagerSettings',
      reason:
        'Web persistent-cache single-tab manager settings. React Native has no ' +
        'firebase-js-sdk tab-manager component path.',
    },
    {
      name: 'PersistentTabManager',
      reason:
        'Web persistent-cache tab-manager base interface. React Native has no ' +
        'firebase-js-sdk tab-manager component path; native persistence is controlled by ' +
        'platform SDK settings.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Extra in RN Firebase
  // ---------------------------------------------------------------------------
  extraInRN: [
    {
      name: 'SDK_VERSION',
      reason:
        'RN Firebase package version string exported from the modular entry point. The firebase-js-sdk does not export SDK_VERSION from @firebase/firestore.',
    },
    {
      name: 'FirebaseApp',
      reason:
        'Re-exported type alias for `ReactNativeFirebase.FirebaseApp` from ' +
        '`@react-native-firebase/app`. Used as the app parameter type in RN ' +
        'Firebase functions. Not part of the firebase-js-sdk public Firestore API.',
    },
    {
      name: 'FirebaseSignInProvider',
      reason:
        'RN Firebase re-exports this helper type from shared app declarations for emulator mock-token support.',
    },
    {
      name: 'FirebaseIdToken',
      reason:
        'RN Firebase re-exports this helper type from shared app declarations for emulator mock-token support.',
    },
    {
      name: 'LiteTransaction',
      reason:
        'RN Firebase base class for Transaction (LiteTransaction). Not exported in the ' +
        'firebase-js-sdk public API; used internally for type hierarchy.',
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
  ],

  // ---------------------------------------------------------------------------
  // Different shape
  // ---------------------------------------------------------------------------
  differentShape: [
    {
      name: 'deleteAllPersistentCacheIndexes',
      reason:
        'Returns `Promise<void>` in RN Firebase vs `void` in the firebase-js-sdk. ' +
        'RN Firebase delegates persistent-cache index deletion to native SDK IO and exposes ' +
        'completion/failure through the returned Promise; the web SDK starts the operation and returns void.',
    },
    {
      name: 'disablePersistentCacheIndexAutoCreation',
      reason:
        'Returns `Promise<void>` in RN Firebase vs `void` in the firebase-js-sdk. ' +
        'RN Firebase delegates persistent-cache index state to native SDK IO and exposes ' +
        'completion/failure through the returned Promise; the web SDK starts the operation and returns void.',
    },
    {
      name: 'enablePersistentCacheIndexAutoCreation',
      reason:
        'Returns `Promise<void>` in RN Firebase vs `void` in the firebase-js-sdk. ' +
        'RN Firebase delegates persistent-cache index state to native SDK IO and exposes ' +
        'completion/failure through the returned Promise; the web SDK starts the operation and returns void.',
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
        'firebase-js-sdk public type. These are structural artifacts of the ' +
        'RN implementation.',
    },
    // --- Wrapper classes (same public API, different structure: getters vs properties, readonly, toJSON/fromJSON) ---
    {
      name: 'DocumentReference',
      reason:
        'RN Firebase wrapper class over native; public API matches but type shape differs: ' +
        'SDK uses getters (get id(), get path()) and includes toJSON/static fromJSON; RN uses properties.',
    },
    {
      name: 'CollectionReference',
      reason:
        'RN Firebase wrapper class over native; same public API but different type shape ' +
        '(e.g. getters vs properties, internal members).',
    },
    {
      name: 'DocumentSnapshot',
      reason:
        'RN Firebase wrapper class; same public API but type shape differs from SDK ' +
        '(e.g. getters vs properties, optional toJSON/fromJSON in SDK).',
    },
    {
      name: 'QuerySnapshot',
      reason:
        'RN Firebase wrapper class; same public API but type shape differs from SDK.',
    },
    {
      name: 'Firestore',
      reason:
        'RN Firebase wrapper over native Firestore; type shape differs (e.g. get app(), toJSON; ' +
        'SDK has private constructor, readonly members).',
    },
    {
      name: 'QueryEndAtConstraint',
      reason:
        'RN Firebase constraint types differ in shape from SDK; same runtime behaviour.',
    },
    {
      name: 'Transaction',
      reason:
        'RN Firebase Transaction wrapper; type shape differs (e.g. SDK extends LiteTransaction, ' +
        'different method signatures).',
    },
    {
      name: 'WriteBatch',
      reason:
        'RN Firebase WriteBatch; type shape differs (e.g. extra update overload in RN for ' +
        'fieldOrUpdateData form).',
    },
    {
      name: 'FieldValue',
      reason:
        'RN Firebase FieldValue class; same public API but type shape differs from SDK.',
    },
    {
      name: 'Bytes',
      reason:
        'RN Firebase Bytes class; SDK includes toJSON/fromJSON and toString; RN type shape differs.',
    },
    {
      name: 'Timestamp',
      reason:
        'RN Firebase Timestamp class; same public API but type shape differs from SDK ' +
        '(e.g. toJSON, fromMillis, internal members).',
    },
    {
      name: 'VectorValue',
      reason:
        'RN Firebase VectorValue class; type shape differs from SDK (e.g. toJSON/fromJSON).',
    },
    {
      name: 'AggregateQuerySnapshot',
      reason:
        'RN Firebase exposes internal members (_query, _data, _isGetCountFromServer, _fieldsProto) ' +
        'for implementation; public data() API equivalent.',
    },
  ],
};

export default config;
