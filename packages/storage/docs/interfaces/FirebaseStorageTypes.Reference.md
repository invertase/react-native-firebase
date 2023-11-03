# Interface: Reference

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).Reference

Represents a reference to a Google Cloud Storage object in React Native Firebase.

A reference can be used to upload and download storage objects, get/set storage object metadata, retrieve storage object download urls and delete storage objects.

#### Example 1

Get a reference to a specific storage path.

```js
const ref = firebase.storage().ref('invertase/logo.png');
```

#### Example 2

Get a reference to a specific storage path on another bucket in the same firebase project.

```js
const ref = firebase.storage().refFromURL('gs://other-bucket/invertase/logo.png');
```

## Table of contents

### Properties

- [bucket](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#bucket)
- [fullPath](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#fullpath)
- [name](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#name)
- [parent](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#parent)
- [root](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#root)
- [storage](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#storage)

### Methods

- [child](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#child)
- [delete](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#delete)
- [getDownloadURL](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#getdownloadurl)
- [getMetadata](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#getmetadata)
- [list](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#list)
- [listAll](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#listall)
- [put](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#put)
- [putFile](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#putfile)
- [putString](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#putstring)
- [toString](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#tostring)
- [updateMetadata](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#updatemetadata)
- [writeToFile](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md#writetofile)

## Properties

### bucket

• **bucket**: `string`

The name of the bucket containing this reference's object.

#### Defined in

[index.d.ts:453](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L453)

___

### fullPath

• **fullPath**: `string`

The full path of this object.

#### Defined in

[index.d.ts:461](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L461)

___

### name

• **name**: `string`

The short name of this object, which is the last component of the full path. For example,
if fullPath is 'full/path/image.png', name is 'image.png'.

#### Defined in

[index.d.ts:466](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L466)

___

### parent

• **parent**: ``null`` \| [`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

A reference pointing to the parent location of this reference, or null if this reference is the root.

#### Defined in

[index.d.ts:457](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L457)

___

### root

• **root**: [`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

A reference to the root of this reference's bucket.

#### Defined in

[index.d.ts:470](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L470)

___

### storage

• **storage**: [`Module`](/reference/storage/classes/FirebaseStorageTypes.Module.md)

The storage service associated with this reference.

#### Defined in

[index.d.ts:474](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L474)

## Methods

### child

▸ **child**(`path`): [`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

Returns a reference to a relative path from this reference.

#### Example

```js
const parent = firebase.storage().ref('invertase');
const ref = parent.child('logo.png');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The relative path from this reference. Leading, trailing, and consecutive slashes are removed. |

#### Returns

[`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

#### Defined in

[index.d.ts:500](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L500)

___

### delete

▸ **delete**(): `Promise`<`void`\>

Deletes the object at this reference's location.

#### Example

```js
const ref = firebase.storage().ref('invertase/logo.png');
await ref.delete();
```

#### Returns

`Promise`<`void`\>

#### Defined in

[index.d.ts:512](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L512)

___

### getDownloadURL

▸ **getDownloadURL**(): `Promise`<`string`\>

Fetches a long lived download URL for this object.

#### Example

```js
const ref = firebase.storage().ref('invertase/logo.png');
const url = await ref.getDownloadURL();
```

#### Returns

`Promise`<`string`\>

#### Defined in

[index.d.ts:524](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L524)

___

### getMetadata

▸ **getMetadata**(): `Promise`<[`FullMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md)\>

Fetches metadata for the object at this location, if one exists.

#### Example

```js
const ref = firebase.storage().ref('invertase/logo.png');
const metadata = await ref.getMetadata();
console.log('Cache control: ', metadata.cacheControl);
```

#### Returns

`Promise`<[`FullMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md)\>

#### Defined in

[index.d.ts:537](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L537)

___

### list

▸ **list**(`options?`): `Promise`<[`ListResult`](/reference/storage/interfaces/FirebaseStorageTypes.ListResult.md)\>

List items (files) and prefixes (folders) under this storage reference.

List API is only available for Firebase Rules Version 2.

GCS is a key-blob store. Firebase Storage imposes the semantic of '/' delimited folder structure.
Refer to GCS's List API if you want to learn more.

To adhere to Firebase Rules's Semantics, Firebase Storage does not support objects whose paths
end with "/" or contain two consecutive "/"s. Firebase Storage List API will filter these unsupported objects.
list() may fail if there are too many unsupported objects in the bucket.

#### Example

```js
const ref = firebase.storage().ref('/');
const results = await ref.list({
  maxResults: 30,
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`ListOptions`](/reference/storage/interfaces/FirebaseStorageTypes.ListOptions.md) | An optional ListOptions interface. |

#### Returns

`Promise`<[`ListResult`](/reference/storage/interfaces/FirebaseStorageTypes.ListResult.md)\>

#### Defined in

[index.d.ts:562](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L562)

___

### listAll

▸ **listAll**(): `Promise`<[`ListResult`](/reference/storage/interfaces/FirebaseStorageTypes.ListResult.md)\>

List all items (files) and prefixes (folders) under this storage reference.

This is a helper method for calling list() repeatedly until there are no more results. The default pagination size is 1000.

Note: The results may not be consistent if objects are changed while this operation is running.

Warning: `listAll` may potentially consume too many resources if there are too many results.

#### Example

```js
const ref = firebase.storage().ref('/');
const results = await ref.listAll();
```

#### Returns

`Promise`<[`ListResult`](/reference/storage/interfaces/FirebaseStorageTypes.ListResult.md)\>

#### Defined in

[index.d.ts:580](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L580)

___

### put

▸ **put**(`data`, `metadata?`): [`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

Puts data onto the storage bucket.

#### Example

```js
const ref = firebase.storage().ref('invertase/new-logo.png');
const task = ref.put(BLOB, {
  cacheControl: 'no-store', // disable caching
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `Blob` \| `Uint8Array` \| `ArrayBuffer` | The data to upload to the storage bucket at the reference location. |
| `metadata?` | [`SettableMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md) |  |

#### Returns

[`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

#### Defined in

[index.d.ts:631](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L631)

___

### putFile

▸ **putFile**(`localFilePath`, `metadata?`): [`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

Puts a file from local disk onto the storage bucket.

#### Example

```js
const ref = firebase.storage().ref('invertase/new-logo.png');
const path = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/new-logo.png`;
const task = ref.putFile(path, {
  cacheControl: 'no-store', // disable caching
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `localFilePath` | `string` | The local file path to upload to the bucket at the reference location. |
| `metadata?` | [`SettableMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md) | Any additional `SettableMetadata` for this task. |

#### Returns

[`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

#### Defined in

[index.d.ts:598](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L598)

___

### putString

▸ **putString**(`data`, `format?`, `metadata?`): [`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

Puts a string on the storage bucket. Depending on the string type, set a storage.StringFormat type.

#### Example

```js
const ref = firebase.storage().ref('invertase/new-logo.png');
const task = ref.putString('PEZvbyBCYXI+', firebase.storage.StringFormat.BASE64, {
  cacheControl: 'no-store', // disable caching
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `string` | The string data, must match the format provided. |
| `format?` | ``"base64"`` \| ``"raw"`` \| ``"base64url"`` \| ``"data_url"`` | The format type of the string, e.g. a Base64 format string. |
| `metadata?` | [`SettableMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md) | Any additional `SettableMetadata` for this task. |

#### Returns

[`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

#### Defined in

[index.d.ts:649](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L649)

___

### toString

▸ **toString**(): `string`

Returns a gs:// URL for this object in the form `gs://<bucket>/<path>/<to>/<object>`.

#### Example

```js
const ref = firebase.storage().ref('invertase/logo.png');
console.log('Full path: ', ref.toString()); // gs://invertase.io/invertase/logo.png
```

#### Returns

`string`

#### Defined in

[index.d.ts:486](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L486)

___

### updateMetadata

▸ **updateMetadata**(`metadata`): `Promise`<[`FullMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md)\>

Updates the metadata for this reference object on the storage bucket.

#### Example

```js
const ref = firebase.storage().ref('invertase/nsfw-logo.png');
const updatedMetadata = await ref.updateMetadata({
  customMetadata: {
    'nsfw': 'true',
  }
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `metadata` | [`SettableMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md) | A `SettableMetadata` instance to update. |

#### Returns

`Promise`<[`FullMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md)\>

#### Defined in

[index.d.ts:671](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L671)

___

### writeToFile

▸ **writeToFile**(`localFilePath`): [`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

Downloads a file to the specified local file path on the device.

#### Example

Get a Download Storage task to download a file:

```js
const downloadTo = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/foobar.json`;

const task = firebase.storage().ref('/foo/bar.json').writeToFile(downloadTo);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `localFilePath` | `string` |

#### Returns

[`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

#### Defined in

[index.d.ts:614](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L614)
