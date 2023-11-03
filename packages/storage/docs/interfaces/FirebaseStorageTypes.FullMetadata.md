# Interface: FullMetadata

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).FullMetadata

The full readable metadata returned by `TaskSnapshot.metadata` or `StorageReference.getMetadata()`.

## Hierarchy

- [`SettableMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md)

  ↳ **`FullMetadata`**

## Table of contents

### Properties

- [bucket](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#bucket)
- [cacheControl](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#cachecontrol)
- [contentDisposition](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#contentdisposition)
- [contentEncoding](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#contentencoding)
- [contentLanguage](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#contentlanguage)
- [contentType](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#contenttype)
- [customMetadata](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#custommetadata)
- [fullPath](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#fullpath)
- [generation](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#generation)
- [md5Hash](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#md5hash)
- [md5hash](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#md5hash-1)
- [metageneration](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#metageneration)
- [name](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#name)
- [size](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#size)
- [timeCreated](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#timecreated)
- [updated](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md#updated)

## Properties

### bucket

• **bucket**: `string`

The bucket this storage object is contained in.

#### Example Value

```
gs://my-project-storage-bucket
```

#### Defined in

[index.d.ts:362](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L362)

___

### cacheControl

• `Optional` **cacheControl**: ``null`` \| `string`

The 'Cache-Control' HTTP header that will be set on the storage object when it's requested.

#### Example 1

To turn off caching, you can set the following cacheControl value.

```js
{
  cacheControl: 'no-store',
}
```

#### Example 2

To aggressively cache an object, e.g. static assets, you can set the following cacheControl value.

```js
{
  cacheControl: 'public, max-age=31536000',
}
```

[Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md).[cacheControl](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#cachecontrol)

#### Defined in

[index.d.ts:272](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L272)

___

### contentDisposition

• `Optional` **contentDisposition**: ``null`` \| `string`

The 'Content-Disposition' HTTP header that will be set on the storage object when it's requested.

[Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md).[contentDisposition](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#contentdisposition)

#### Defined in

[index.d.ts:279](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L279)

___

### contentEncoding

• `Optional` **contentEncoding**: ``null`` \| `string`

The 'Content-Encoding' HTTP header that will be used on the storage object when it's requested.

[Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding)

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md).[contentEncoding](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#contentencoding)

#### Defined in

[index.d.ts:286](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L286)

___

### contentLanguage

• `Optional` **contentLanguage**: ``null`` \| `string`

The 'Content-Language' HTTP header that will be set on the storage object when it's requested.

[Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Language)

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md).[contentLanguage](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#contentlanguage)

#### Defined in

[index.d.ts:293](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L293)

___

### contentType

• `Optional` **contentType**: ``null`` \| `string`

The 'Content-Type' HTTP header that will be set on the object when it's requested.

This is used to indicate the media type (or MIME type) of the object. When uploading a file
Firebase Cloud Storage for React Native will attempt to automatically detect this if `contentType`
is not already set, if it fails to detect a media type it will default to `application/octet-stream`.

For `DATA_URL` string formats uploaded via `putString` this will also be automatically extracted if available.

#### Example

Setting the content type as JSON, e.g. for when uploading a JSON string via `putString`.

```js
{
  contentType: 'application/json',
}
```

[Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md).[contentType](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#contenttype)

#### Defined in

[index.d.ts:316](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L316)

___

### customMetadata

• `Optional` **customMetadata**: ``null`` \| { `[key: string]`: `string`;  }

Additional user-defined custom metadata for this storage object.

All values must be strings. Set to null to delete all. Any keys ommitted during update will be removed.

#### Example

Adding a user controlled NSFW meta data field.

```js
{
  customMetadata: {
    'nsfw': 'true'
  },
}

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md).[customMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#custommetadata)

#### Defined in

[index.d.ts:339](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L339)

___

### fullPath

• **fullPath**: `string`

The full path to this storage object in its bucket.

#### Example Value

```
invertase/logo.png
```

#### Defined in

[index.d.ts:373](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L373)

___

### generation

• **generation**: `string`

Storage object generation values enable users to uniquely identify data resources, e.g. object versioning.

Read more on generation on the [Google Cloud Storage documentation](https://cloud.google.com/storage/docs/generations-preconditions).

#### Defined in

[index.d.ts:380](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L380)

___

### md5Hash

• **md5Hash**: ``null`` \| `string`

A Base64-encoded MD5 hash of the storage object being uploaded.

#### Defined in

[index.d.ts:351](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L351)

___

### md5hash

• `Optional` **md5hash**: ``null`` \| `string`

You may specify the md5hash of the file in metadata on upload only. It may not be updated via updateMetadata

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md).[md5hash](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#md5hash)

#### Defined in

[index.d.ts:321](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L321)

___

### metageneration

• **metageneration**: `string`

Storage object metageneration values enable users to uniquely identify data resources, e.g. object versioning.

Read more on metageneration on the [Google Cloud Storage documentation](https://cloud.google.com/storage/docs/generations-preconditions).

#### Defined in

[index.d.ts:387](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L387)

___

### name

• **name**: `string`

The short name of storage object in its bucket, e.g. it's file name.

#### Example Value

```
logo.png
```

#### Defined in

[index.d.ts:398](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L398)

___

### size

• **size**: `number`

The size of this storage object in bytes.

#### Defined in

[index.d.ts:403](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L403)

___

### timeCreated

• **timeCreated**: `string`

A date string representing when this storage object was created.

#### Example Value

```
2019-05-02T00:34:56.264Z
```

#### Defined in

[index.d.ts:414](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L414)

___

### updated

• **updated**: `string`

A date string representing when this storage object was last updated.

#### Example Value

```
2019-05-02T00:35:56.264Z
```

#### Defined in

[index.d.ts:425](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L425)
