# Interface: QuerySnapshot\<T\>

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).QuerySnapshot

A `QuerySnapshot` contains zero or more `QueryDocumentSnapshot` objects representing the results of a query. The documents
can be accessed as an array via the `docs` property or enumerated using the `forEach` method. The number of documents
can be determined via the `empty` and `size` properties.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

## Table of contents

### Properties

- [docs](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md#docs)
- [empty](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md#empty)
- [metadata](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md#metadata)
- [query](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md#query)
- [size](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md#size)

### Methods

- [docChanges](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md#docchanges)
- [forEach](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md#foreach)
- [isEqual](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md#isequal)

## Properties

### docs

• **docs**: [`QueryDocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md)\<`T`\>[]

An array of all the documents in the `QuerySnapshot`.

#### Defined in

[index.d.ts:1442](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1442)

___

### empty

• **empty**: `boolean`

True if there are no documents in the `QuerySnapshot`.

#### Defined in

[index.d.ts:1447](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1447)

___

### metadata

• **metadata**: [`SnapshotMetadata`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotMetadata.md)

Metadata about this snapshot, concerning its source and if it has local modifications.

#### Defined in

[index.d.ts:1452](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1452)

___

### query

• **query**: [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

The query on which you called get or `onSnapshot` in order to `get` this `QuerySnapshot`.

#### Defined in

[index.d.ts:1457](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1457)

___

### size

• **size**: `number`

The number of documents in the `QuerySnapshot`.

#### Defined in

[index.d.ts:1462](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1462)

## Methods

### docChanges

▸ **docChanges**(`options?`): [`DocumentChange`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentChange.md)\<`T`\>[]

Returns an array of the documents changes since the last snapshot. If this is the first snapshot, all documents
will be in the list as added changes.

To include metadata changes, ensure that the `onSnapshot()` method includes metadata changes.

#### Example

```js
firebase.firestore().collection('users')
  .onSnapshot((querySnapshot) => {
    console.log('Metadata Changes', querySnapshot.docChanges());
  });
```

#### Example - With metadata changes

```js
firebase.firestore().collection('users')
  .onSnapshot({ includeMetadataChanges: true }, (querySnapshot) => {
    console.log('Metadata Changes', querySnapshot.docChanges({
      includeMetadataChanges: true,
    }));
  });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`SnapshotListenOptions`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotListenOptions.md) | `SnapshotListenOptions` that control whether metadata-only changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger snapshot events. |

#### Returns

[`DocumentChange`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentChange.md)\<`T`\>[]

#### Defined in

[index.d.ts:1492](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1492)

___

### forEach

▸ **forEach**(`callback`, `thisArg?`): `void`

Enumerates all of the documents in the `QuerySnapshot`.

#### Example

```js
const querySnapshot = await firebase.firestore().collection('users').get();

querySnapshot.forEach((queryDocumentSnapshot) => {
  console.log('User', queryDocumentSnapshot.data());
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`result`: [`QueryDocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md)\<`T`\>, `index`: `number`) => `void` | A callback to be called with a `QueryDocumentSnapshot` for each document in the snapshot. |
| `thisArg?` | `any` | The `this` binding for the callback. |

#### Returns

`void`

#### Defined in

[index.d.ts:1511](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1511)

___

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this `QuerySnapshot` is equal to the provided one.

#### Example

```js
const querySnapshot1 = await firebase.firestore().collection('users').limit(5).get();
const querySnapshot2 = await firebase.firestore().collection('users').limit(10).get();

// false
querySnapshot1.isEqual(querySnapshot2);
```

> This operation can be resource intensive when dealing with large datasets.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`QuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md)\<[`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)\> | The `QuerySnapshot` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:1533](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1533)
