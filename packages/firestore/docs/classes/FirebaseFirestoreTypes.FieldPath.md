# Class: FieldPath

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).FieldPath

A FieldPath refers to a field in a document. The path may consist of a single field name (referring to a
top-level field in the document), or a list of field names (referring to a nested field in the document).

Create a FieldPath by providing field names. If more than one field name is provided, the path will point to a nested field in a document.

#### Example

```js
const user = await firebase.firestore().doc('users/alovelace').get();

// Create a new field path
const fieldPath = new firebase.firestore.FieldPath('address', 'zip');

console.log('Address ZIP Code', user.get(fieldPath));
```

## Table of contents

### Constructors

- [constructor](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md#constructor)

### Methods

- [isEqual](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md#isequal)
- [documentId](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md#documentid)

## Constructors

### constructor

• **new FieldPath**(`...fieldNames`): [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md)

Creates a FieldPath from the provided field names. If more than one field name is provided, the path will point to a nested field in a document.

#### Example

```js
const fieldPath = new firebase.firestore.FieldPath('address', line', 'one');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...fieldNames` | `string`[] | A list of field names. |

#### Returns

[`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md)

#### Defined in

[index.d.ts:652](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L652)

## Methods

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this `FieldPath` is equal to the provided one.

#### Example

```js
const fieldPath1 = new firebase.firestore.FieldPath('address', 'zip');
const fieldPath2 = new firebase.firestore.FieldPath('address', line', 'one');

// false
fieldPath1.isEqual(fieldPath2);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md) | The `FieldPath` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:669](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L669)

___

### documentId

▸ **documentId**(): [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md)

Returns a special sentinel `FieldPath` to refer to the ID of a document. It can be used in queries to sort or filter by the document ID.

#### Returns

[`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md)

#### Defined in

[index.d.ts:639](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L639)
