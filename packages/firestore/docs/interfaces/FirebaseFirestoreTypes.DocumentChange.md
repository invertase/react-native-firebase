# Interface: DocumentChange\<T\>

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).DocumentChange

A DocumentChange represents a change to the documents matching a query. It contains the document affected and the
type of change that occurred.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

## Table of contents

### Properties

- [doc](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentChange.md#doc)
- [newIndex](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentChange.md#newindex)
- [oldIndex](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentChange.md#oldindex)
- [type](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentChange.md#type)

## Properties

### doc

• **doc**: [`QueryDocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md)\<`T`\>

The document affected by this change.

#### Defined in

[index.d.ts:200](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L200)

___

### newIndex

• **newIndex**: `number`

The index of the changed document in the result set immediately after this `DocumentChange`
(i.e. supposing that all prior `DocumentChange` objects and the current `DocumentChange` object have been applied).
Is -1 for 'removed' events.

#### Defined in

[index.d.ts:207](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L207)

___

### oldIndex

• **oldIndex**: `number`

The index of the changed document in the result set immediately prior to this `DocumentChange` (i.e.
supposing that all prior `DocumentChange` objects have been applied). Is -1 for 'added' events.

#### Defined in

[index.d.ts:213](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L213)

___

### type

• **type**: [`DocumentChangeType`](/reference/firestore/modules/FirebaseFirestoreTypes.md#documentchangetype)

The type of change ('added', 'modified', or 'removed').

#### Defined in

[index.d.ts:218](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L218)
