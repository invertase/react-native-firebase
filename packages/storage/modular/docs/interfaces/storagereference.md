# Interface: StorageReference

## Hierarchy

- *StorageReference*

  ↳ **StorageReference**

## Table of contents

### Properties

- [bucket](/reference/storage/interfaces/storagereference.md#bucket)
- [fullPath](/reference/storage/interfaces/storagereference.md#fullpath)
- [name](/reference/storage/interfaces/storagereference.md#name)
- [parent](/reference/storage/interfaces/storagereference.md#parent)
- [root](/reference/storage/interfaces/storagereference.md#root)
- [storage](/reference/storage/interfaces/storagereference.md#storage)

### Methods

- [toString](/reference/storage/interfaces/storagereference.md#tostring)

## Properties

### bucket

• **bucket**: *string*

The name of the bucket containing this reference's object.

Inherited from: web.StorageReference.bucket

Defined in: node_modules/@firebase/storage/exp/dist/storage-public.d.ts:268

___

### fullPath

• **fullPath**: *string*

The full path of this object.

Inherited from: web.StorageReference.fullPath

Defined in: node_modules/@firebase/storage/exp/dist/storage-public.d.ts:272

___

### name

• **name**: *string*

The short name of this object, which is the last component of the full path.
For example, if fullPath is 'full/path/image.png', name is 'image.png'.

Inherited from: web.StorageReference.name

Defined in: node_modules/@firebase/storage/exp/dist/storage-public.d.ts:277

___

### parent

• `Readonly` **parent**: ``null`` \| [*StorageReference*](/reference/storage/interfaces/storagereference.md)

Overrides: web.StorageReference.parent

Defined in: [packages/storage/modular/src/types.ts:13](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L13)

___

### root

• `Readonly` **root**: [*StorageReference*](/reference/storage/interfaces/storagereference.md)

Overrides: web.StorageReference.root

Defined in: [packages/storage/modular/src/types.ts:14](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L14)

___

### storage

• `Readonly` **storage**: [*StorageService*](/reference/storage/interfaces/storageservice.md)

Overrides: web.StorageReference.storage

Defined in: [packages/storage/modular/src/types.ts:15](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L15)

## Methods

### toString

▸ **toString**(): *string*

Returns a gs:// URL for this object in the form
  `gs://<bucket>/<path>/<to>/<object>`

**Returns:** *string*

The gs:// URL.

Inherited from: web.StorageReference.toString

Defined in: node_modules/@firebase/storage/exp/dist/storage-public.d.ts:260
