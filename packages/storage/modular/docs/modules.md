# @react-native-firebase/storage-exp

## Table of contents

### Enumerations

- [StringFormat](/reference/storage/enums/stringformat.md)

### Interfaces

- [FullMetadata](/reference/storage/interfaces/fullmetadata.md)
- [ListOptions](/reference/storage/interfaces/listoptions.md)
- [ListResult](/reference/storage/interfaces/listresult.md)
- [SettableMetadata](/reference/storage/interfaces/settablemetadata.md)
- [StorageReference](/reference/storage/interfaces/storagereference.md)
- [StorageService](/reference/storage/interfaces/storageservice.md)
- [UploadMetadata](/reference/storage/interfaces/uploadmetadata.md)
- [UploadResult](/reference/storage/interfaces/uploadresult.md)
- [UploadTask](/reference/storage/interfaces/uploadtask.md)
- [UploadTaskSnapshot](/reference/storage/interfaces/uploadtasksnapshot.md)

### Type aliases

- [TaskState](/reference/storage/modules.md#taskstate)

### Variables

- [TaskEvent](/reference/storage/modules.md#taskevent)

### Functions

- [deleteObject](/reference/storage/modules.md#deleteobject)
- [getDownloadURL](/reference/storage/modules.md#getdownloadurl)
- [getMetadata](/reference/storage/modules.md#getmetadata)
- [getStorage](/reference/storage/modules.md#getstorage)
- [list](/reference/storage/modules.md#list)
- [listAll](/reference/storage/modules.md#listall)
- [putFile](/reference/storage/modules.md#putfile)
- [ref](/reference/storage/modules.md#ref)
- [setMaxDownloadRetryTime](/reference/storage/modules.md#setmaxdownloadretrytime)
- [setMaxOperationRetryTime](/reference/storage/modules.md#setmaxoperationretrytime)
- [setMaxUploadRetryTime](/reference/storage/modules.md#setmaxuploadretrytime)
- [updateMetadata](/reference/storage/modules.md#updatemetadata)
- [uploadBytes](/reference/storage/modules.md#uploadbytes)
- [uploadBytesResumable](/reference/storage/modules.md#uploadbytesresumable)
- [uploadString](/reference/storage/modules.md#uploadstring)
- [useStorageEmulator](/reference/storage/modules.md#usestorageemulator)

## Type aliases

### TaskState

Ƭ **TaskState**: web.TaskState

Defined in: [packages/storage/modular/src/types.ts:124](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L124)

## Variables

### TaskEvent

• `Const` **TaskEvent**: ``"state_changed"``= 'state\_changed'

Defined in: [packages/storage/modular/src/types.ts:122](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L122)

## Functions

### deleteObject

▸ **deleteObject**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md)): *Promise*<void\>

Deletes the object at this location.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageReference for object to delete. |

**Returns:** *Promise*<void\>

Promise<void>

Defined in: [packages/storage/modular/src/index.ts:46](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L46)

___

### getDownloadURL

▸ **getDownloadURL**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md)): *Promise*<string\>

Returns the download URL for the given Reference.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) |

**Returns:** *Promise*<string\>

Promise<string>

Defined in: [packages/storage/modular/src/index.ts:60](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L60)

___

### getMetadata

▸ **getMetadata**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md)): *Promise*<[*FullMetadata*](/reference/storage/interfaces/fullmetadata.md)\>

A promise that resolves with the metadata for this object. If this object doesn't exist or metadata cannot be retreived, the promise is rejected.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageReference to get metadata from. |

**Returns:** *Promise*<[*FullMetadata*](/reference/storage/interfaces/fullmetadata.md)\>

Promise<FullMetadata>

Defined in: [packages/storage/modular/src/index.ts:74](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L74)

___

### getStorage

▸ **getStorage**(`app?`: FirebaseApp, `bucketUrl?`: *string*): [*StorageService*](/reference/storage/interfaces/storageservice.md)

Gets a Firebase StorageService instance for the given Firebase app.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `app?` | FirebaseApp | Firebase app to get Storage instance for. |
| `bucketUrl?` | *string* | The gs:// url to your Firebase Storage Bucket. If not passed, uses the app's default Storage Bucket. |

**Returns:** [*StorageService*](/reference/storage/interfaces/storageservice.md)

StorageService

Defined in: [packages/storage/modular/src/index.ts:89](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L89)

___

### list

▸ **list**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md), `options?`: [*ListOptions*](/reference/storage/interfaces/listoptions.md)): *Promise*<[*ListResult*](/reference/storage/interfaces/listresult.md)\>

List items (files) and prefixes (folders) under this storage reference.

List API is only available for Firebase Rules Version 2.

GCS is a key-blob store. Firebase Storage imposes the semantic of '/' delimited folder structure. Refer to GCS's List API if you want to learn more.

To adhere to Firebase Rules's Semantics, Firebase Storage does not support objects whose paths end with "/" or contain two consecutive "/"s. Firebase Storage List API will filter these unsupported objects.
`list()` may fail if there are too many unsupported objects in the bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageReference to get list from. |
| `options?` | [*ListOptions*](/reference/storage/interfaces/listoptions.md) | See ListOptions for details. |

**Returns:** *Promise*<[*ListResult*](/reference/storage/interfaces/listresult.md)\>

Promise<ListResult> A Promise that resolves with the items and prefixes. `prefixes` contains references to sub-folders and items contains references to objects in this folder. `nextPageToken` can be used to get the rest of the results.

Defined in: [packages/storage/modular/src/index.ts:111](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L111)

___

### listAll

▸ **listAll**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md)): *Promise*<[*ListResult*](/reference/storage/interfaces/listresult.md)\>

List all items (files) and prefixes (folders) under this storage reference.

This is a helper method for calling list() repeatedly until there are no more results. The default pagination size is 1000.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageReference to get list from. |

**Returns:** *Promise*<[*ListResult*](/reference/storage/interfaces/listresult.md)\>

Promise<ListResult> A Promise that resolves with the items and prefixes. `prefixes` contains references to sub-folders and items contains references to objects in this folder. `nextPageToken` can be used to get the rest of the results.

Defined in: [packages/storage/modular/src/index.ts:138](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L138)

___

### putFile

▸ **putFile**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md), `filePath`: *string*, `metadata?`: [*UploadMetadata*](/reference/storage/interfaces/uploadmetadata.md)): *Promise*<[*UploadResult*](/reference/storage/interfaces/uploadresult.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) |
| `filePath` | *string* |
| `metadata?` | [*UploadMetadata*](/reference/storage/interfaces/uploadmetadata.md) |

**Returns:** *Promise*<[*UploadResult*](/reference/storage/interfaces/uploadresult.md)\>

Defined in: [packages/storage/modular/src/index.ts:427](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L427)

___

### ref

▸ **ref**(`storage`: [*StorageService*](/reference/storage/interfaces/storageservice.md), `url?`: *string*): [*StorageReference*](/reference/storage/interfaces/storagereference.md)

Returns a StorageReference for the given url.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storage` | [*StorageService*](/reference/storage/interfaces/storageservice.md) | StorageService instance. |
| `url?` | *string* | URL. If empty, returns root reference. |

**Returns:** [*StorageReference*](/reference/storage/interfaces/storagereference.md)

StorageReference

Defined in: [packages/storage/modular/src/index.ts:153](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L153)

▸ **ref**(`storageOrRef`: [*StorageService*](/reference/storage/interfaces/storageservice.md) \| [*StorageReference*](/reference/storage/interfaces/storagereference.md), `path?`: *string*): [*StorageReference*](/reference/storage/interfaces/storagereference.md)

Returns a StorageReference for the given path in the default bucket.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storageOrRef` | [*StorageService*](/reference/storage/interfaces/storageservice.md) \| [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageService or StorageReference. |
| `path?` | *string* |  |

**Returns:** [*StorageReference*](/reference/storage/interfaces/storagereference.md)

StorageReference

Defined in: [packages/storage/modular/src/index.ts:162](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L162)

___

### setMaxDownloadRetryTime

▸ **setMaxDownloadRetryTime**(`storage`: [*StorageService*](/reference/storage/interfaces/storageservice.md), `time`: *number*): *Promise*<void\>

Sets the maximum time in milliseconds to retry a download if a failure occurs.

This operation is a noop on Web.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storage` | [*StorageService*](/reference/storage/interfaces/storageservice.md) | StorageService instance. |
| `time` | *number* | Time in milliseconds. |

**Returns:** *Promise*<void\>

Promise<void>

Defined in: [packages/storage/modular/src/index.ts:297](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L297)

___

### setMaxOperationRetryTime

▸ **setMaxOperationRetryTime**(`storage`: [*StorageService*](/reference/storage/interfaces/storageservice.md), `time`: *number*): *Promise*<void\>

Sets the maximum time in milliseconds to retry operations other than upload and download if a failure occurs.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storage` | [*StorageService*](/reference/storage/interfaces/storageservice.md) | StorageService instance. |
| `time` | *number* | Time in milliseconds. |

**Returns:** *Promise*<void\>

Promise<void>

Defined in: [packages/storage/modular/src/index.ts:248](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L248)

___

### setMaxUploadRetryTime

▸ **setMaxUploadRetryTime**(`storage`: [*StorageService*](/reference/storage/interfaces/storageservice.md), `time`: *number*): *Promise*<void\>

Sets the maximum time in milliseconds to retry an upload if a failure occurs.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storage` | [*StorageService*](/reference/storage/interfaces/storageservice.md) | StorageService instance. |
| `time` | *number* | Time in milliseconds. |

**Returns:** *Promise*<void\>

Promise<void>

Defined in: [packages/storage/modular/src/index.ts:273](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L273)

___

### updateMetadata

▸ **updateMetadata**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md), `metadata`: [*SettableMetadata*](/reference/storage/interfaces/settablemetadata.md)): *Promise*<[*FullMetadata*](/reference/storage/interfaces/fullmetadata.md)\>

Updates the metadata for this object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageReference to update metadata for. |
| `metadata` | [*SettableMetadata*](/reference/storage/interfaces/settablemetadata.md) | The new metadata for the object. Only values that have been explicitly set will be changed. Explicitly setting a value to null will remove the metadata. |

**Returns:** *Promise*<[*FullMetadata*](/reference/storage/interfaces/fullmetadata.md)\>

Promise<FullMetadata>

Defined in: [packages/storage/modular/src/index.ts:322](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L322)

___

### uploadBytes

▸ **uploadBytes**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md), `data`: Blob \| Uint8Array \| ArrayBuffer, `metadata?`: [*UploadMetadata*](/reference/storage/interfaces/uploadmetadata.md)): *Promise*<[*UploadResult*](/reference/storage/interfaces/uploadresult.md)\>

Uploads data to this object's location. The upload is not resumable.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageReference where data should be uploaded. |
| `data` | Blob \| Uint8Array \| ArrayBuffer | The data to upload. |
| `metadata?` | [*UploadMetadata*](/reference/storage/interfaces/uploadmetadata.md) | Metadata for the data to upload. |

**Returns:** *Promise*<[*UploadResult*](/reference/storage/interfaces/uploadresult.md)\>

Promise<UploadResult>

Defined in: [packages/storage/modular/src/index.ts:341](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L341)

___

### uploadBytesResumable

▸ **uploadBytesResumable**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md), `data`: Blob \| Uint8Array \| ArrayBuffer, `metadata?`: [*UploadMetadata*](/reference/storage/interfaces/uploadmetadata.md)): [*UploadTask*](/reference/storage/interfaces/uploadtask.md)

Uploads data to this object's location. The upload can be paused and resumed, and exposes progress updates.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageReference where data should be uploaded. |
| `data` | Blob \| Uint8Array \| ArrayBuffer | The data to upload. |
| `metadata?` | [*UploadMetadata*](/reference/storage/interfaces/uploadmetadata.md) | Metadata for the data to upload. |

**Returns:** [*UploadTask*](/reference/storage/interfaces/uploadtask.md)

UploadTask

Defined in: [packages/storage/modular/src/index.ts:365](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L365)

___

### uploadString

▸ **uploadString**(`ref`: [*StorageReference*](/reference/storage/interfaces/storagereference.md), `value`: *string*, `format?`: [*StringFormat*](/reference/storage/enums/stringformat.md), `metadata?`: [*UploadMetadata*](/reference/storage/interfaces/uploadmetadata.md)): *Promise*<[*UploadResult*](/reference/storage/interfaces/uploadresult.md)\>

Uploads a string to this object's location. The upload is not resumable.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [*StorageReference*](/reference/storage/interfaces/storagereference.md) | StorageReference where string should be uploaded. |
| `value` | *string* | The string to upload. |
| `format` | [*StringFormat*](/reference/storage/enums/stringformat.md) | The format of the string to upload. |
| `metadata?` | [*UploadMetadata*](/reference/storage/interfaces/uploadmetadata.md) | Metadata for the string to upload. |

**Returns:** *Promise*<[*UploadResult*](/reference/storage/interfaces/uploadresult.md)\>

Promise<UploadResult>

Defined in: [packages/storage/modular/src/index.ts:390](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L390)

___

### useStorageEmulator

▸ **useStorageEmulator**(`storage`: [*StorageService*](/reference/storage/interfaces/storageservice.md), `host`: *string*, `port`: *number*): *void*

Modify this StorageService instance to communicate with the Cloud Storage emulator.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `storage` | [*StorageService*](/reference/storage/interfaces/storageservice.md) | The StorageService instance |
| `host` | *string* | The emulator host (ex: localhost) |
| `port` | *number* | The emulator port (ex: 5001) |

**Returns:** *void*

Defined in: [packages/storage/modular/src/index.ts:420](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/index.ts#L420)
