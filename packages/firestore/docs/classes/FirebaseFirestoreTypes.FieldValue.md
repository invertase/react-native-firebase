# Class: FieldValue

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).FieldValue

Sentinel values that can be used when writing document fields with `set()` or `update()`.

#### Example

```js
const increment = firebase.firestore.FieldValue.increment(1);

await firebase.firestore().doc('users/alovelace').update({
  age: increment, // increment age by 1
});
```

## Table of contents

### Constructors

- [constructor](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md#constructor)

### Methods

- [isEqual](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md#isequal)
- [arrayRemove](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md#arrayremove)
- [arrayUnion](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md#arrayunion)
- [delete](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md#delete)
- [increment](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md#increment)
- [serverTimestamp](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md#servertimestamp)

## Constructors

### constructor

• **new FieldValue**(): [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

#### Returns

[`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

## Methods

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this `FieldValue` is equal to the provided one.

#### Example

```js
const increment = firebase.firestore.FieldValue.increment(1);
const timestamp = firebase.firestore.FieldValue.serverTimestamp();

// false
increment.isEqual(timestamp);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md) | The `FieldValue` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:803](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L803)

___

### arrayRemove

▸ **arrayRemove**(`...elements`): [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

Returns a special value that can be used with `set()` or `update()` that tells the server to remove the given elements
from any array value that already exists on the server. All instances of each element specified will be removed from
the array. If the field being modified is not already an array it will be overwritten with an empty array.

#### Example

```js
const arrayRemove = firebase.firestore.FieldValue.arrayRemove(2, '3');

// Removes the values 2 & '3' from the values array on the document
await docRef.update({
  values: arrayRemove,
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...elements` | `any`[] | The elements to remove from the array. |

#### Returns

[`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

#### Defined in

[index.d.ts:704](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L704)

___

### arrayUnion

▸ **arrayUnion**(`...elements`): [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

Returns a special value that can be used with `set()` or `update()` that tells the server to union the given
elements with any array value that already exists on the server. Each specified element that doesn't already exist
in the array will be added to the end. If the field being modified is not already an array it will be overwritten
with an array containing exactly the specified elements.

#### Example

```js
const arrayUnion = firebase.firestore.FieldValue.arrayUnion(2, '3');

// Appends the values 2 & '3' onto the values array on the document
await docRef.update({
  values: arrayUnion,
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...elements` | `any`[] | The elements to union into the array. |

#### Returns

[`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

#### Defined in

[index.d.ts:725](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L725)

___

### delete

▸ **delete**(): [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

Returns a sentinel for use with update() to mark a field for deletion.

#### Example

```js
const delete = firebase.firestore.FieldValue.delete();

// Deletes the name field on the document
await docRef.update({
  name: delete,
});
```

#### Returns

[`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

#### Defined in

[index.d.ts:741](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L741)

___

### increment

▸ **increment**(`n`): [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

Returns a special value that can be used with `set()` or `update()` that tells the server to increment the field's current value by the given value.

If either the operand or the current field value uses floating point precision, all arithmetic follows IEEE 754 semantics.
If both values are integers, values outside of JavaScript's safe number range (`Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`)
are also subject to precision loss. Furthermore, once processed by the Firestore backend, all integer operations are
capped between -2^63 and 2^63-1.

If the current field value is not of type `number`, or if the field does not yet exist, the transformation sets the field to the given value.

#### Example

```js
const increment = firebase.firestore.FieldValue.increment(1);

// Increment the loginCount field by 1 on the document
await docRef.update({
  loginCount: increment,
});
```

Please be careful using this operator. It may not be reliable enough for use in circumstances where absolute accuracy is required,
as it appears writes to Firestore may sometimes be duplicated in situations not fully understood yet, but possibly correlated with
write frequency. See https://github.com/invertase/react-native-firebase/discussions/5914

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `n` | `number` | The value to increment by. |

#### Returns

[`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

#### Defined in

[index.d.ts:770](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L770)

___

### serverTimestamp

▸ **serverTimestamp**(): [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

Returns a sentinel used with set() or update() to include a server-generated timestamp in the written data.

#### Example

```js
const timestamp = firebase.firestore.FieldValue.serverTimestamp();

// Set the updatedAt field to the current server time
await docRef.update({
  updatedAt: timestamp,
});
```

#### Returns

[`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

#### Defined in

[index.d.ts:786](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L786)
