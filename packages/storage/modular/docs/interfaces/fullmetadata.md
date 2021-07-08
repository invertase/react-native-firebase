# Interface: FullMetadata

## Hierarchy

- `FullMetadata`

  ↳ **`FullMetadata`**

## Properties

### bucket

• **bucket**: `string`

The bucket this object is contained in.

#### Inherited from

web.FullMetadata.bucket

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:43

___

### cacheControl

• `Optional` **cacheControl**: `string`

Served as the 'Cache-Control' header on object download.

#### Inherited from

web.FullMetadata.cacheControl

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:216

___

### contentDisposition

• `Optional` **contentDisposition**: `string`

Served as the 'Content-Disposition' header on object download.

#### Inherited from

web.FullMetadata.contentDisposition

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:220

___

### contentEncoding

• `Optional` **contentEncoding**: `string`

Served as the 'Content-Encoding' header on object download.

#### Inherited from

web.FullMetadata.contentEncoding

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:224

___

### contentLanguage

• `Optional` **contentLanguage**: `string`

Served as the 'Content-Language' header on object download.

#### Inherited from

web.FullMetadata.contentLanguage

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:228

___

### contentType

• `Optional` **contentType**: `string`

Served as the 'Content-Type' header on object download.

#### Inherited from

web.FullMetadata.contentType

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:232

___

### customMetadata

• `Optional` **customMetadata**: `Object`

Additional user-defined custom metadata.

#### Index signature

▪ [key: `string`]: `string`

#### Inherited from

web.FullMetadata.customMetadata

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:236

___

### downloadTokens

• **downloadTokens**: `undefined` \| `string`[]

Tokens to allow access to the downloatd URL.

#### Inherited from

web.FullMetadata.downloadTokens

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:78

___

### fullPath

• **fullPath**: `string`

The full path of this object.

#### Inherited from

web.FullMetadata.fullPath

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:47

___

### generation

• **generation**: `string`

The object's generation.
[https://cloud.google.com/storage/docs/generations-preconditions](https://cloud.google.com/storage/docs/generations-preconditions)

#### Inherited from

web.FullMetadata.generation

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:52

___

### md5Hash

• `Optional` **md5Hash**: `string`

A Base64-encoded MD5 hash of the object being uploaded.

#### Inherited from

web.FullMetadata.md5Hash

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:414

___

### metageneration

• **metageneration**: `string`

The object's metageneration.
[https://cloud.google.com/storage/docs/generations-preconditions](https://cloud.google.com/storage/docs/generations-preconditions)

#### Inherited from

web.FullMetadata.metageneration

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:57

___

### name

• **name**: `string`

The short name of this object, which is the last component of the full path.
For example, if fullPath is 'full/path/image.png', name is 'image.png'.

#### Inherited from

web.FullMetadata.name

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:62

___

### ref

• `Optional` **ref**: `StorageReference`

`StorageReference` associated with this upload.

#### Inherited from

web.FullMetadata.ref

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:82

___

### size

• **size**: `number`

The size of this object, in bytes.

#### Inherited from

web.FullMetadata.size

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:66

___

### timeCreated

• **timeCreated**: `string`

A date string representing when this object was created.

#### Inherited from

web.FullMetadata.timeCreated

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:70

___

### updated

• **updated**: `string`

A date string representing when this object was last updated.

#### Inherited from

web.FullMetadata.updated

#### Defined in

node_modules/@firebase/storage/exp/dist/storage-public.d.ts:74
