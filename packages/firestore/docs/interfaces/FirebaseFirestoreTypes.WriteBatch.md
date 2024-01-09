# Interface: WriteBatch

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).WriteBatch

A write batch, used to perform multiple writes as a single atomic unit.

A WriteBatch object can be acquired by calling `firestore.batch()`. It provides methods for adding
writes to the write batch. None of the writes will be committed (or visible locally) until
`WriteBatch.commit()` is called.

Unlike transactions, write batches are persisted offline and therefore are preferable when you don't need to
condition your writes on read data.

## Table of contents

### Methods

- [commit](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md#commit)
- [delete](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md#delete)
- [set](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md#set)
- [update](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md#update)

## Methods

### commit

▸ **commit**(): `Promise`\<`void`\>

Commits all of the writes in this write batch as a single atomic unit.

Returns a Promise resolved once all of the writes in the batch have been successfully written
to the backend as an atomic unit. Note that it won't resolve while you're offline.

#### Example

```js
const batch = firebase.firestore().batch();

// Perform batch operations...

await batch.commit();
```

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:1907](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1907)

___

### delete

▸ **delete**(`documentRef`): [`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

Deletes the document referred to by the provided `DocumentReference`.

#### Example

```js
const batch = firebase.firestore().batch();
const docRef = firebase.firestore().doc('users/alovelace');

batch.delete(docRef);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `documentRef` | [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<[`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)\> | A reference to the document to be deleted. |

#### Returns

[`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

#### Defined in

[index.d.ts:1923](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1923)

___

### set

▸ **set**\<`T`\>(`documentRef`, `data`, `options?`): [`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

Writes to the document referred to by the provided DocumentReference. If the document does
not exist yet, it will be created. If you pass SetOptions, the provided data can be merged
into the existing document.

#### Example

```js
const batch = firebase.firestore().batch();
const docRef = firebase.firestore().doc('users/dsmith');

batch.set(docRef, {
  name: 'David Smith',
  age: 25,
});
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `documentRef` | [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<`T`\> | A reference to the document to be set. |
| `data` | `T` | An object of the fields and values for the document. |
| `options?` | [`SetOptions`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SetOptions.md) | An object to configure the set behavior. |

#### Returns

[`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

#### Defined in

[index.d.ts:1946](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1946)

___

### update

▸ **update**\<`T`\>(`documentRef`, `data`): [`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

Updates fields in the document referred to by the provided DocumentReference. The update will fail if applied to a document that does not exist.

#### Example

```js
const batch = firebase.firestore().batch();
const docRef = firebase.firestore().doc('users/alovelace');

batch.update(docRef, {
  city: 'SF',
});
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `documentRef` | [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<`T`\> | A reference to the document to be updated. |
| `data` | `Partial`\<\{ [K in string \| number \| symbol]: FieldValue \| T[K] }\> | An object containing the fields and values with which to update the document. Fields can contain dots to reference nested fields within the document. |

#### Returns

[`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

#### Defined in

[index.d.ts:1969](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1969)

▸ **update**\<`T`, `K`\>(`documentRef`, `field`, `value`, `...moreFieldAndValues`): [`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

Updates fields in the document referred to by this DocumentReference. The update will fail if applied to a document that does not exist.

Nested fields can be update by providing dot-separated field path strings or by providing FieldPath objects.

#### Example

```js
const batch = firebase.firestore().batch();
const docRef = firebase.firestore().doc('users/alovelace');

batch.update(docRef, 'city', 'SF', 'age', 31);
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |
| `K` | extends `string` \| `number` \| `symbol` = `string` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `documentRef` | [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<`T`\> | A reference to the document to be updated. |
| `field` | [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md) \| `K` | The first field to update. |
| `value` | [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md) \| `T`[`K`] | The first value. |
| `...moreFieldAndValues` | `any`[] | Additional key value pairs. |

#### Returns

[`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

#### Defined in

[index.d.ts:1993](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1993)
