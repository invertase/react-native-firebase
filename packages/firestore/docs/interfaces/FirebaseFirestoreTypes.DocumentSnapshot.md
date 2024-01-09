# Interface: DocumentSnapshot\<T\>

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).DocumentSnapshot

A DocumentSnapshot contains data read from a document in your Firestore database. The data can be extracted with
.`data()` or `.get(:field)` to get a specific field.

For a DocumentSnapshot that points to a non-existing document, any data access will return 'undefined'.
You can use the `exists` property to explicitly verify a document's existence.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

## Hierarchy

- **`DocumentSnapshot`**

  ↳ [`QueryDocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md)

## Table of contents

### Properties

- [exists](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#exists)
- [id](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#id)
- [metadata](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#metadata)
- [ref](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#ref)

### Methods

- [data](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#data)
- [get](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#get)
- [isEqual](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md#isequal)

## Properties

### exists

• **exists**: `boolean`

Property of the `DocumentSnapshot` that signals whether or not the data exists. True if the document exists.

#### Defined in

[index.d.ts:525](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L525)

___

### id

• **id**: `string`

Property of the `DocumentSnapshot` that provides the document's ID.

#### Defined in

[index.d.ts:530](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L530)

___

### metadata

• **metadata**: [`SnapshotMetadata`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotMetadata.md)

Metadata about the `DocumentSnapshot`, including information about its source and local modifications.

#### Defined in

[index.d.ts:535](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L535)

___

### ref

• **ref**: [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<`T`\>

The `DocumentReference` for the document included in the `DocumentSnapshot`.

#### Defined in

[index.d.ts:540](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L540)

## Methods

### data

▸ **data**(): `undefined` \| `T`

Retrieves all fields in the document as an Object. Returns 'undefined' if the document doesn't exist.

#### Example

```js
const user = await firebase.firestore().doc('users/alovelace').get();

console.log('User', user.data());
```

#### Returns

`undefined` \| `T`

#### Defined in

[index.d.ts:553](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L553)

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

#### Defined in

[index.d.ts:585](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L585)
