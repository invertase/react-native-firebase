# Interface: ListOptions

## Hierarchy

- *ListOptions*

  ↳ **ListOptions**

## Table of contents

### Properties

- [maxResults](/reference/storage/interfaces/listoptions.md#maxresults)
- [pageToken](/reference/storage/interfaces/listoptions.md#pagetoken)

## Properties

### maxResults

• `Optional` **maxResults**: ``null`` \| *number*

If set, limits the total number of `prefixes` and `items` to return.
The default and maximum maxResults is 1000.

Inherited from: web.ListOptions.maxResults

Defined in: node_modules/@firebase/storage/exp/dist/storage-public.d.ts:161

___

### pageToken

• `Optional` **pageToken**: ``null`` \| *string*

The `nextPageToken` from a previous call to `list()`. If provided,
listing is resumed from the previous position.

Inherited from: web.ListOptions.pageToken

Defined in: node_modules/@firebase/storage/exp/dist/storage-public.d.ts:166
