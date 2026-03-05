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
  nameMapping: {},

  // ---------------------------------------------------------------------------
  // Missing in RN Firebase
  // ---------------------------------------------------------------------------
  missingInRN: [
  ],

  // ---------------------------------------------------------------------------
  // Extra in RN Firebase
  // ---------------------------------------------------------------------------
  extraInRN: [
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
  ],

  // ---------------------------------------------------------------------------
  // Different shape
  // ---------------------------------------------------------------------------
  differentShape: [
    {
      name: 'FirebaseStorage',
      reason:
        'RN Firebase adds a `maxDownloadRetryTime` property (android & iOS only) ' +
        'not present in the firebase-js-sdk `FirebaseStorage`. Additionally, ' +
        '`maxUploadRetryTime` and `maxOperationRetryTime` are declared `readonly` ' +
        'in RN Firebase (they are set via dedicated modular functions) whereas the ' +
        'firebase-js-sdk declares them as mutable properties.',
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
      name: 'EmulatorMockTokenOptions',
      reason:
        'The firebase-js-sdk `EmulatorMockTokenOptions` (from `@firebase/util`) is a ' +
        'complex type `({ user_id: string } | { sub: string }) & Partial<FirebaseIdToken>` ' +
        'representing a full mock JWT payload. RN Firebase defines a simplified version ' +
        '`{ mockUserToken?: string | null }` that only accepts a pre-encoded token string, ' +
        'since the native bridge does not need to construct JWT payloads directly.',
    },
    {
      name: 'connectStorageEmulator',
      reason:
        'The optional `options` parameter type differs: the firebase-js-sdk accepts ' +
        '`{ mockUserToken?: EmulatorMockTokenOptions | string }` (an inline object ' +
        'literal) while RN Firebase accepts its own `EmulatorMockTokenOptions` interface.',
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
