# Interface: AggregateQuery\<T\>

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).AggregateQuery

The results of requesting an aggregated query.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`AggregateSpec`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateSpec.md) |

## Table of contents

### Accessors

- [query](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuery.md#query)

### Methods

- [get](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuery.md#get)

## Accessors

### query

• `get` **query**(): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`unknown`\>

The underlying query for this instance.

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`unknown`\>

#### Defined in

[index.d.ts:945](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L945)

## Methods

### get

▸ **get**(): `Promise`\<[`AggregateQuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuerySnapshot.md)\<`T`\>\>

Executes the query and returns the results as a AggregateQuerySnapshot.

#### Example

```js
const querySnapshot = await firebase.firestore()
  .collection('users')
  .count()
  .get();
```

#### Returns

`Promise`\<[`AggregateQuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuerySnapshot.md)\<`T`\>\>

#### Defined in

[index.d.ts:962](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L962)
