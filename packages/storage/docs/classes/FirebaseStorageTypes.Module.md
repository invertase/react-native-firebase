# Class: Module

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).Module

The Cloud Storage service is available for the default app, a given app or a specific storage bucket.

#### Example 1

Get the storage instance for the **default app**:

```js
const storageForDefaultApp = firebase.storage();
```

#### Example 2

Get the storage instance for a **secondary app**:

```js
const otherApp = firebase.app('otherApp');
const storageForOtherApp = firebase.storage(otherApp);
```

#### Example 3

Get the storage instance for a **specific storage bucket**:

```js
const defaultApp = firebase.app();
const storageForBucket = defaultApp.storage('gs://another-bucket-url');

const otherApp = firebase.app('otherApp');
const storageForOtherAppBucket = otherApp.storage('gs://another-bucket-url');
```

## Hierarchy

- `FirebaseModule`

  ↳ **`Module`**

## Table of contents

### Constructors

- [constructor](/reference/storage/classes/FirebaseStorageTypes.Module.md#constructor)

### Properties

- [app](/reference/storage/classes/FirebaseStorageTypes.Module.md#app)
- [maxDownloadRetryTime](/reference/storage/classes/FirebaseStorageTypes.Module.md#maxdownloadretrytime)
- [maxOperationRetryTime](/reference/storage/classes/FirebaseStorageTypes.Module.md#maxoperationretrytime)
- [maxUploadRetryTime](/reference/storage/classes/FirebaseStorageTypes.Module.md#maxuploadretrytime)

### Methods

- [ref](/reference/storage/classes/FirebaseStorageTypes.Module.md#ref)
- [refFromURL](/reference/storage/classes/FirebaseStorageTypes.Module.md#reffromurl)
- [setMaxDownloadRetryTime](/reference/storage/classes/FirebaseStorageTypes.Module.md#setmaxdownloadretrytime)
- [setMaxOperationRetryTime](/reference/storage/classes/FirebaseStorageTypes.Module.md#setmaxoperationretrytime)
- [setMaxUploadRetryTime](/reference/storage/classes/FirebaseStorageTypes.Module.md#setmaxuploadretrytime)
- [useEmulator](/reference/storage/classes/FirebaseStorageTypes.Module.md#useemulator)

## Constructors

### constructor

• **new Module**()

#### Inherited from

FirebaseModule.constructor

## Properties

### app

• **app**: `FirebaseApp`

The current `FirebaseApp` instance for this Firebase service.

#### Inherited from

FirebaseModule.app

#### Defined in

[../../app/lib/index.d.ts:228](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L228)

___

### maxDownloadRetryTime

• **maxDownloadRetryTime**: `number`

Returns the current maximum time in milliseconds to retry a download if a failure occurs.

#### Example

```js
const downloadRetryTime = firebase.storage().maxUploadRetryTime;
```

#### Defined in

[index.d.ts:1056](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1056)

___

### maxOperationRetryTime

• **maxOperationRetryTime**: `number`

Returns the current maximum time in milliseconds to retry operations other than upload and download if a failure occurs.

#### Example

```js
const maxOperationRetryTime = firebase.storage().maxOperationRetryTime;
```

#### Defined in

[index.d.ts:1080](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1080)

___

### maxUploadRetryTime

• **maxUploadRetryTime**: `number`

Returns the current maximum time in milliseconds to retry an upload if a failure occurs.

#### Example

```js
const uploadRetryTime = firebase.storage().maxUploadRetryTime;
```

#### Defined in

[index.d.ts:1032](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1032)

## Methods

### ref

▸ **ref**(`path?`): [`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

Returns a new storage.Reference instance.

#### Example

```js
const ref = firebase.storage().ref('cats.gif');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path?` | `string` | An optional string pointing to a location on the storage bucket. If no path is provided, the returned reference will be the bucket root path. |

#### Returns

[`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

#### Defined in

[index.d.ts:1107](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1107)

___

### refFromURL

▸ **refFromURL**(`url`): [`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

Returns a new storage.Reference instance from a storage bucket URL.

#### Example

```js
const gsUrl = 'gs://react-native-firebase-testing/cats.gif';
const httpUrl = 'https://firebasestorage.googleapis.com/v0/b/react-native-firebase-testing.appspot.com/o/cats.gif';

const refFromGsUrl = firebase.storage().refFromURL(gsUrl);
// or
const refFromHttpUrl = firebase.storage().refFromURL(httpUrl);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | A storage bucket URL pointing to a single file or location. Must be either a `gs://` url or an `http` url, e.g. `gs://assets/logo.png` or `https://firebasestorage.googleapis.com/v0/b/react-native-firebase-testing.appspot.com/o/cats.gif`. |

#### Returns

[`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

#### Defined in

[index.d.ts:1126](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1126)

___

### setMaxDownloadRetryTime

▸ **setMaxDownloadRetryTime**(`time`): `Promise`<`void`\>

Sets the maximum time in milliseconds to retry a download if a failure occurs.

#### Example

```js
await firebase.storage().setMaxDownloadRetryTime(25000);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `time` | `number` | The new maximum download retry time in milliseconds. |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.d.ts:1069](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1069)

___

### setMaxOperationRetryTime

▸ **setMaxOperationRetryTime**(`time`): `Promise`<`void`\>

Sets the maximum time in milliseconds to retry operations other than upload and download if a failure occurs.

#### Example

```js
await firebase.storage().setMaxOperationRetryTime(5000);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `time` | `number` | The new maximum operation retry time in milliseconds. |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.d.ts:1093](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1093)

___

### setMaxUploadRetryTime

▸ **setMaxUploadRetryTime**(`time`): `Promise`<`void`\>

Sets the maximum time in milliseconds to retry an upload if a failure occurs.

#### Example

```js
await firebase.storage().setMaxUploadRetryTime(25000);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `time` | `number` | The new maximum upload retry time in milliseconds. |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.d.ts:1045](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1045)

___

### useEmulator

▸ **useEmulator**(`host`, `port`): `void`

Modify this Storage instance to communicate with the Firebase Storage emulator.
This must be called synchronously immediately following the first call to firebase.storage().
Do not use with production credentials as emulator traffic is not encrypted.

Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
"host" computer IP address for android emulators) to make the standard development experience easy.
If you want to use the emulator on a real android device, you will need to specify the actual host
computer IP address.

#### Parameters

| Name | Type |
| :------ | :------ |
| `host` | `string` |
| `port` | `number` |

#### Returns

`void`

#### Defined in

[index.d.ts:1141](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1141)
