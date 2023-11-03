# Interface: ListOptions

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).ListOptions

The options `list()` accepts.

## Table of contents

### Properties

- [maxResults](/reference/storage/interfaces/FirebaseStorageTypes.ListOptions.md#maxresults)
- [pageToken](/reference/storage/interfaces/FirebaseStorageTypes.ListOptions.md#pagetoken)

## Properties

### maxResults

• `Optional` **maxResults**: `number`

If set, limits the total number of `prefixes` and `items` to return. The default and maximum maxResults is 1000.

#### Defined in

[index.d.ts:949](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L949)

___

### pageToken

• `Optional` **pageToken**: `string`

The `nextPageToken` from a previous call to `list()`. If provided, listing is resumed from the previous position.

#### Defined in

[index.d.ts:954](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L954)
