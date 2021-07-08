# Interface: UploadMetadata

## Hierarchy

- [`SettableMetadata`](/reference/storage/interfaces/settablemetadata.md)

  ↳ **`UploadMetadata`**

## Properties

### cacheControl

• `Optional` **cacheControl**: `string`

Served as the 'Cache-Control' header on object download.

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/settablemetadata.md).[cacheControl](/reference/storage/interfaces/settablemetadata.md#cachecontrol)

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:216

___

### contentDisposition

• `Optional` **contentDisposition**: `string`

Served as the 'Content-Disposition' header on object download.

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/settablemetadata.md).[contentDisposition](/reference/storage/interfaces/settablemetadata.md#contentdisposition)

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:220

___

### contentEncoding

• `Optional` **contentEncoding**: `string`

Served as the 'Content-Encoding' header on object download.

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/settablemetadata.md).[contentEncoding](/reference/storage/interfaces/settablemetadata.md#contentencoding)

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:224

___

### contentLanguage

• `Optional` **contentLanguage**: `string`

Served as the 'Content-Language' header on object download.

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/settablemetadata.md).[contentLanguage](/reference/storage/interfaces/settablemetadata.md#contentlanguage)

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:228

___

### contentType

• `Optional` **contentType**: `string`

Served as the 'Content-Type' header on object download.

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/settablemetadata.md).[contentType](/reference/storage/interfaces/settablemetadata.md#contenttype)

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:232

___

### customMetadata

• `Optional` **customMetadata**: `Object`

Additional user-defined custom metadata.

#### Index signature

▪ [key: `string`]: `string`

#### Inherited from

[SettableMetadata](/reference/storage/interfaces/settablemetadata.md).[customMetadata](/reference/storage/interfaces/settablemetadata.md#custommetadata)

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:236

___

### md5Hash

• `Optional` **md5Hash**: `string`

A Base64-encoded MD5 hash of the object being uploaded.

#### Defined in

[packages/storage/modular/src/types.ts:57](https://github.com/invertase/react-native-firebase/blob/3eaa35e5/packages/storage/modular/src/types.ts#L57)
