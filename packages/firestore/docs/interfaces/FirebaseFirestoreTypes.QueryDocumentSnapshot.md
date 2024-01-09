# Interface: QueryDocumentSnapshot\<T\>

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).QueryDocumentSnapshot

A QueryDocumentSnapshot contains data read from a document in your Firestore database as part of a query.
The document is guaranteed to exist and its data can be extracted with .data() or .get(:field) to get a specific field.

A QueryDocumentSnapshot offers the same API surface as a DocumentSnapshot.
Since query results contain only existing documents, the exists property will always be true and data() will never return 'undefined'.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

## Hierarchy

- [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>

  ↳ **`QueryDocumentSnapshot`**

## Table of contents

### Properties

- [exists](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md#exists)
- [id](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md#id)
- [metadata](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md#metadata)
- [ref](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md#ref)

### Methods

- [data](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md#data)
- [get](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md#get)
- [isEqual](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md#isequal)

## Properties

### exists

• **exists**: ``true``

A QueryDocumentSnapshot is always guaranteed to exist.

#### Overrides

[DocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md).[exists](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#exists)

#### Defined in

[index.d.ts:600](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L600)

___

### id

• **id**: `string`

Property of the `DocumentSnapshot` that provides the document's ID.

#### Inherited from

[DocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md).[id](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#id)

#### Defined in

[index.d.ts:530](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L530)

___

### metadata

• **metadata**: [`SnapshotMetadata`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotMetadata.md)

Metadata about the `DocumentSnapshot`, including information about its source and local modifications.

#### Inherited from

[DocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md).[metadata](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#metadata)

#### Defined in

[index.d.ts:535](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L535)

___

### ref

• **ref**: [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<`T`\>

The `DocumentReference` for the document included in the `DocumentSnapshot`.

#### Inherited from

[DocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md).[ref](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#ref)

#### Defined in

[index.d.ts:540](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L540)

## Methods

### data

▸ **data**(): `T`

Retrieves all fields in the document as an Object.

#### Example

```js
const users = await firebase.firestore().collection('users').get();

for (const user of users.docs) {
  console.log('User', user.data());
}
```

#### Returns

`T`

#### Overrides

[DocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md).[data](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#data)

#### Defined in

[index.d.ts:615](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L615)

___

### get

▸ **get**\<`fieldType`\>(`fieldPath`): `fieldType`

Retrieves the field specified by fieldPath. Returns undefined if the document or field doesn't exist.

#### Example

```js
const user = await firebase.firestore().doc('users/alovelace').get();

console.log('Address ZIP Code', user.get('address.zip'));
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `fieldType` | extends [`DocumentFieldType`](/reference/firestore/modules/FirebaseFirestoreTypes.md#documentfieldtype) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fieldPath` | [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md) \| keyof `T` | The path (e.g. 'foo' or 'foo.bar') to a specific field. |

#### Returns

`fieldType`

#### Inherited from

[DocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md).[get](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#get)

#### Defined in

[index.d.ts:568](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L568)

___

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this `DocumentSnapshot` is equal to the provided one.

#### Example

```js
const user1 = await firebase.firestore().doc('users/alovelace').get();
const user2 = await firebase.firestore().doc('users/dsmith').get();

// false
user1.isEqual(user2);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<[`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)\> | The `DocumentSnapshot` to compare against. |

#### Returns

`boolean`

#### Inherited from

[DocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md).[isEqual](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#isequal)

#### Defined in

[index.d.ts:585](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L585)
