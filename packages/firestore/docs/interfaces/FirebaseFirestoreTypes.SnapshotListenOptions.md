# Interface: SnapshotListenOptions

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).SnapshotListenOptions

An options object that can be passed to `DocumentReference.onSnapshot()`, `Query.onSnapshot()` and `QuerySnapshot.docChanges()`
to control which types of changes to include in the result set.

## Table of contents

### Properties

- [includeMetadataChanges](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotListenOptions.md#includemetadatachanges)

## Properties

### includeMetadataChanges

• **includeMetadataChanges**: `boolean`

Include a change even if only the metadata of the query or of a document changed. Default is false.

#### Defined in

[index.d.ts:1621](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1621)
