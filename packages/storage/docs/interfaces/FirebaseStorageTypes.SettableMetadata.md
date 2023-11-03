# Interface: SettableMetadata

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).SettableMetadata

An interface representing all the metadata properties that can be set.

This is used in updateMetadata, put, putString & putFile.

## Hierarchy

- **`SettableMetadata`**

  ↳ [`FullMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md)

## Table of contents

### Properties

- [cacheControl](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#cachecontrol)
- [contentDisposition](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#contentdisposition)
- [contentEncoding](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#contentencoding)
- [contentLanguage](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#contentlanguage)
- [contentType](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#contenttype)
- [customMetadata](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#custommetadata)
- [md5hash](/reference/storage/interfaces/FirebaseStorageTypes.SettableMetadata.md#md5hash)

## Properties

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

#### Defined in

[index.d.ts:272](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L272)

___

### contentDisposition

• `Optional` **contentDisposition**: ``null`` \| `string`

The 'Content-Disposition' HTTP header that will be set on the storage object when it's requested.

[Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)

#### Defined in

[index.d.ts:279](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L279)

___

### contentEncoding

• `Optional` **contentEncoding**: ``null`` \| `string`

The 'Content-Encoding' HTTP header that will be used on the storage object when it's requested.

[Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding)

#### Defined in

[index.d.ts:286](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L286)

___

### contentLanguage

• `Optional` **contentLanguage**: ``null`` \| `string`

The 'Content-Language' HTTP header that will be set on the storage object when it's requested.

[Learn more about this header on Mozilla.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Language)

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

#### Defined in

[index.d.ts:339](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L339)

___

### md5hash

• `Optional` **md5hash**: ``null`` \| `string`

You may specify the md5hash of the file in metadata on upload only. It may not be updated via updateMetadata

#### Defined in

[index.d.ts:321](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L321)
