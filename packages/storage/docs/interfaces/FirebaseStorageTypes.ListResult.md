# Interface: ListResult

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).ListResult

Result returned by `list()`.

## Table of contents

### Properties

- [items](/reference/storage/interfaces/FirebaseStorageTypes.ListResult.md#items)
- [nextPageToken](/reference/storage/interfaces/FirebaseStorageTypes.ListResult.md#nextpagetoken)
- [prefixes](/reference/storage/interfaces/FirebaseStorageTypes.ListResult.md#prefixes)

## Properties

### items

• **items**: [`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)[]

Objects in this directory. You can call `getMetadata()` and `getDownloadUrl()` on them.

#### Defined in

[index.d.ts:964](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L964)

___

### nextPageToken

• **nextPageToken**: ``null`` \| `string`

If set, there might be more results for this list. Use this token to resume the list.

#### Defined in

[index.d.ts:969](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L969)

___

### prefixes

• **prefixes**: [`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)[]

References to prefixes (sub-folders). You can call `list()` on them to get its contents.

Folders are implicit based on '/' in the object paths. For example, if a bucket has two objects '/a/b/1' and '/a/b/2', list('/a') will return '/a/b' as a prefix.

#### Defined in

[index.d.ts:976](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L976)
