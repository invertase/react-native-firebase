# Interface: SnapshotMetadata

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).SnapshotMetadata

Metadata about a snapshot, describing the state of the snapshot.

## Table of contents

### Properties

- [fromCache](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotMetadata.md#fromcache)
- [hasPendingWrites](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotMetadata.md#haspendingwrites)

### Methods

- [isEqual](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotMetadata.md#isequal)

## Properties

### fromCache

• **fromCache**: `boolean`

True if the snapshot includes local writes (`set()` or `update()` calls) that haven't been committed to the backend yet.
If your listener has opted into metadata updates (via `SnapshotListenOptions`) you will receive another snapshot with
`fromCache` equal to false once the client has received up-to-date data from the backend.

#### Defined in

[index.d.ts:1633](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1633)

___

### hasPendingWrites

• **hasPendingWrites**: `boolean`

True if the snapshot contains the result of local writes (e.g. `set()` or `update()` calls) that have not yet been
committed to the backend. If your listener has opted into metadata updates (via `SnapshotListenOptions`) you will
receive another snapshot with `hasPendingWrites` equal to false once the writes have been committed to the backend.

#### Defined in

[index.d.ts:1640](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1640)

## Methods

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this `SnapshotMetadata` is equal to the provided one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`SnapshotMetadata`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotMetadata.md) | The `SnapshotMetadata` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:1647](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1647)
