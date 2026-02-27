/**
 * Known differences between the firebase-js-sdk @firebase/storage public
 * API and the @react-native-firebase/storage modular API.
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
  nameMapping: {
    // The firebase-js-sdk calls the module instance `FirebaseStorage`;
    // RN Firebase calls it `Storage` to avoid a naming clash with the
    // namespaced API class. Both represent the same storage module instance.
    FirebaseStorage: 'Storage',
  },

  // ---------------------------------------------------------------------------
  // Missing in RN Firebase
  // ---------------------------------------------------------------------------
  missingInRN: [
    {
      name: 'StorageError',
      reason:
        'The firebase-js-sdk exposes a typed `StorageError` class extending `FirebaseError`. ' +
        'RN Firebase uses the native bridge error type (`NativeFirebaseError`) for all ' +
        'Firebase errors instead of a custom class.',
    },
    {
      name: 'StorageErrorCode',
      reason:
        'Companion enum to `StorageError` which is not exposed in the RN Firebase ' +
        'modular API. Error codes are surfaced via the native bridge error structure.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Extra in RN Firebase
  // ---------------------------------------------------------------------------
  extraInRN: [
    {
      name: 'refFromURL',
      reason:
        'RN Firebase-specific helper that creates a `StorageReference` from a full ' +
        'gs:// or https:// URL. The firebase-js-sdk exposes this via the overloaded ' +
        '`ref()` function instead.',
    },
    {
      name: 'setMaxOperationRetryTime',
      reason:
        'RN Firebase-specific function for setting the maximum retry time for ' +
        'non-upload/download operations on Android and iOS. The firebase-js-sdk ' +
        'exposes this as a writable property on the `FirebaseStorage` instance.',
    },
    {
      name: 'setMaxUploadRetryTime',
      reason:
        'RN Firebase-specific function for setting the maximum upload retry time ' +
        'on Android and iOS. The firebase-js-sdk exposes this as a writable property ' +
        'on the `FirebaseStorage` instance.',
    },
    {
      name: 'setMaxDownloadRetryTime',
      reason:
        'RN Firebase-specific function for setting the maximum download retry time ' +
        'on Android and iOS. No direct equivalent exists in the firebase-js-sdk.',
    },
    {
      name: 'putFile',
      reason:
        'RN Firebase-specific function that uploads a file from a local device path. ' +
        'No equivalent exists in the firebase-js-sdk web API.',
    },
    {
      name: 'writeToFile',
      reason:
        'RN Firebase-specific function that downloads a file to a local device path. ' +
        'No equivalent exists in the firebase-js-sdk web API.',
    },
    {
      name: 'toString',
      reason:
        'RN Firebase exposes `toString()` as a standalone modular function. In the ' +
        'firebase-js-sdk it is a method on the `StorageReference` interface.',
    },
    {
      name: 'child',
      reason:
        'RN Firebase exposes `child()` as a standalone modular function for navigating ' +
        'to a relative path. The firebase-js-sdk uses the overloaded `ref()` function ' +
        'for the same purpose.',
    },
    {
      name: 'TaskSnapshot',
      reason:
        'RN Firebase-specific interface extending `UploadTaskSnapshot` with an optional ' +
        '`error` field for native task error state. No equivalent in the firebase-js-sdk.',
    },
    {
      name: 'TaskResult',
      reason:
        'RN Firebase type alias for `UploadResult`, kept for API consistency with the ' +
        'native task system. No direct equivalent in the firebase-js-sdk.',
    },
    {
      name: 'TaskSnapshotObserver',
      reason:
        'RN Firebase type alias for `StorageObserver<TaskSnapshot>`. ' +
        'No direct equivalent in the firebase-js-sdk.',
    },
    {
      name: 'Task',
      reason:
        'RN Firebase type alias for `UploadTask`, used as the return type of ' +
        '`uploadBytesResumable`, `uploadString`, `putFile`, and `writeToFile`. ' +
        'Kept for consistency with the native task system.',
    },
    {
      name: 'Subscribe',
      reason:
        'RN Firebase-specific generic type for task event subscription functions. ' +
        'No direct equivalent in the firebase-js-sdk public API.',
    },
    {
      name: 'NativeFirebaseError',
      reason:
        'Re-export of the RN Firebase native bridge error type used in place of ' +
        '`StorageError` / `FirebaseError`. No equivalent in the firebase-js-sdk.',
    },
    {
      name: 'EmulatorMockTokenOptions',
      reason:
        'The firebase-js-sdk re-exports `EmulatorMockTokenOptions` from `@firebase/util` ' +
        'which cannot be resolved from the standalone SDK snapshot file. RN Firebase ' +
        'defines its own simplified version (`{ mockUserToken?: string | null }`) for ' +
        'the emulator options parameter.',
    },
  ],

  // ---------------------------------------------------------------------------
  // Different shape
  // ---------------------------------------------------------------------------
  differentShape: [
    {
      name: 'FirebaseStorage',
      reason:
        'The RN Firebase `Storage` interface adds a `maxDownloadRetryTime` property ' +
        '(android & iOS only) not present in the firebase-js-sdk `FirebaseStorage`. ' +
        'Additionally, `maxUploadRetryTime` and `maxOperationRetryTime` are declared ' +
        '`readonly` in RN Firebase (they are set via dedicated functions) whereas the ' +
        'firebase-js-sdk declares them as mutable.',
    },
    {
      name: 'StorageReference',
      reason:
        'The `storage` member type is `FirebaseStorage` in the firebase-js-sdk and ' +
        '`Storage` in RN Firebase — both refer to the same storage module instance ' +
        'under different names (see nameMapping).',
    },
    {
      name: 'StorageObserver',
      reason:
        'The `error` callback parameter uses `NativeFirebaseError` instead of ' +
        '`StorageError`. Both represent Firebase Storage errors but the RN type ' +
        'extends the native bridge error structure.',
    },
    {
      name: 'UploadTask',
      reason:
        'RN Firebase returns `Promise<boolean>` from `cancel()`, `pause()`, and ' +
        '`resume()` to communicate asynchronously with the native iOS/Android modules, ' +
        'whereas the firebase-js-sdk returns a synchronous `boolean`. Error callback ' +
        'types also use `NativeFirebaseError` instead of `StorageError`.',
    },
    {
      name: 'ListOptions',
      reason:
        '`pageToken` is typed as `string | null` in the firebase-js-sdk and as ' +
        '`string` in RN Firebase. The RN implementation does not need to distinguish ' +
        'between absent and null tokens.',
    },
    {
      name: 'getStorage',
      reason:
        'Returns `Storage` in RN Firebase instead of `FirebaseStorage` — both refer ' +
        'to the same storage module instance under different names (see nameMapping).',
    },
    {
      name: 'connectStorageEmulator',
      reason:
        'First parameter is typed as `Storage` instead of `FirebaseStorage` (see ' +
        'nameMapping). The optional `options` parameter type also differs: the ' +
        'firebase-js-sdk accepts `{ mockUserToken?: EmulatorMockTokenOptions | string }` ' +
        'while RN Firebase accepts its own `EmulatorMockTokenOptions` interface.',
    },
    {
      name: 'ref',
      reason:
        'The firebase-js-sdk provides two overloaded signatures (one accepting only ' +
        '`FirebaseStorage`, one accepting `FirebaseStorage | StorageReference`). RN ' +
        'Firebase exposes a single signature accepting `Storage`. The overloaded form ' +
        'that accepts a `StorageReference` is covered by `refFromURL` and `child`.',
    },
    {
      name: 'getStream',
      reason:
        'Returns `NodeJS.ReadableStream` in RN Firebase instead of `ReadableStream` ' +
        '(the Web Streams API type). The Node.js stream type is used because the ' +
        'React Native environment does not have the Web Streams API.',
    },
    {
      name: 'uploadBytes',
      reason:
        'Returns `Promise<TaskResult>` in RN Firebase instead of `Promise<UploadResult>`. ' +
        '`TaskResult` is a type alias for `UploadResult`, so the runtime shape is identical; ' +
        'the different name is for consistency with the native task system.',
    },
    {
      name: 'uploadBytesResumable',
      reason:
        'Returns `Task` in RN Firebase instead of `UploadTask`. `Task` is a type alias ' +
        'for `UploadTask`, so the runtime shape is identical; the different name is for ' +
        'consistency with the native task system.',
    },
    {
      name: 'uploadString',
      reason:
        'Returns `Task` in RN Firebase instead of `Promise<UploadResult>` — the upload ' +
        'is resumable via the native task system. The `format` parameter is typed as an ' +
        "explicit string union `'raw' | 'base64' | 'base64url' | 'data_url'` instead of " +
        'the `StringFormat` type alias, which is semantically identical.',
    },
    {
      name: 'TaskEvent',
      reason:
        "The firebase-js-sdk declares `TaskEvent` as a string literal type `'state_changed'`. " +
        'RN Firebase declares it as a const object `{ STATE_CHANGED: "state_changed" }` and ' +
        'derives the type via `(typeof TaskEvent)[keyof typeof TaskEvent]`. Both resolve to ' +
        "the same value `'state_changed'` at runtime.",
    },
    {
      name: 'TaskState',
      reason:
        'The firebase-js-sdk declares `TaskState` as a string literal union. RN Firebase ' +
        'declares it as a const object and derives the type via ' +
        '`(typeof TaskState)[keyof typeof TaskState]`. The RN const additionally includes ' +
        "a `CANCELLED` alias (with double-L) for `'canceled'` for backwards compatibility.",
    },
  ],
};

export default config;
