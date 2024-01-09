# Interface: Transaction

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).Transaction

A reference to a transaction. The `Transaction` object passed to a transaction's updateFunction provides the methods to
read and write data within the transaction context. See `Firestore.runTransaction()`.

A transaction consists of any number of `get()` operations followed by any number of write operations such as `set()`,
`update()`, or `delete()`. In the case of a concurrent edit, Cloud Firestore runs the entire transaction again. For example,
if a transaction reads documents and another client modifies any of those documents, Cloud Firestore retries the transaction.
This feature ensures that the transaction runs on up-to-date and consistent data.

Transactions never partially apply writes. All writes execute at the end of a successful transaction.

When using transactions, note that:
  - Read operations must come before write operations.
  - A function calling a transaction (transaction function) might run more than once if a concurrent edit affects a document that the transaction reads.
  - Transaction functions should not directly modify application state (return a value from the `updateFunction`).
  - Transactions will fail when the client is offline.

## Table of contents

### Methods

- [delete](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md#delete)
- [get](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md#get)
- [set](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md#set)
- [update](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md#update)

## Methods

### delete

▸ **delete**(`documentRef`): [`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)

Deletes the document referred to by the provided `DocumentReference`.

#### Example

```js
const docRef = firebase.firestore().doc('users/alovelace');

await firebase.firestore().runTransaction((transaction) => {
  return transaction.delete(docRef);
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `documentRef` | [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<[`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)\> | A reference to the document to be deleted. |

#### Returns

[`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)

#### Defined in

[index.d.ts:1770](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1770)

___

### get

▸ **get**\<`T`\>(`documentRef`): `Promise`\<[`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>\>

Reads the document referenced by the provided `DocumentReference`.

#### Example

```js
const docRef = firebase.firestore().doc('users/alovelace');

await firebase.firestore().runTransaction(async (transaction) => {
  const snapshot = await transaction.get(docRef);
   // use snapshot with transaction (see set() or update())
   ...
});
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `documentRef` | [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<`T`\> | A reference to the document to be read. |

#### Returns

`Promise`\<[`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>\>

#### Defined in

[index.d.ts:1789](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1789)

___

### set

▸ **set**\<`T`\>(`documentRef`, `data`, `options?`): [`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)

Writes to the document referred to by the provided `DocumentReference`. If the document does not exist yet,
it will be created. If you pass `SetOptions`, the provided data can be merged into the existing document.

#### Example

```js
const docRef = firebase.firestore().doc('users/alovelace');

await firebase.firestore().runTransaction((transaction) => {
  const snapshot = await transaction.get(docRef);
  const snapshotData = snapshot.data();

  return transaction.set(docRef, {
    ...data,
    age: 30, // new field
  });
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

[`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)

#### Defined in

[index.d.ts:1817](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1817)

___

### update

▸ **update**\<`T`\>(`documentRef`, `data`): [`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)

Updates fields in the document referred to by the provided `DocumentReference`. The update will fail if applied
to a document that does not exist.

#### Example

```js
const docRef = firebase.firestore().doc('users/alovelace');

await firebase.firestore().runTransaction((transaction) => {
  const snapshot = await transaction.get(docRef);

  return transaction.update(docRef, {
    age: snapshot.data().age + 1,
  });
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

[`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)

#### Defined in

[index.d.ts:1844](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1844)

▸ **update**\<`T`, `K`\>(`documentRef`, `field`, `value`, `...moreFieldsAndValues`): [`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)

Updates fields in the document referred to by the provided DocumentReference. The update will fail if applied to
a document that does not exist.

Nested fields can be updated by providing dot-separated field path strings or by providing FieldPath objects.

#### Example

```js
const docRef = firebase.firestore().doc('users/alovelace');

await firebase.firestore().runTransaction((transaction) => {
  const snapshot = await transaction.get(docRef);

  return transaction.update(docRef, 'age', snapshot.data().age + 1);
});
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
| `value` | `T`[`K`] | The first value. |
| `...moreFieldsAndValues` | `any`[] | Additional key/value pairs. |

#### Returns

[`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)

#### Defined in

[index.d.ts:1872](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1872)
