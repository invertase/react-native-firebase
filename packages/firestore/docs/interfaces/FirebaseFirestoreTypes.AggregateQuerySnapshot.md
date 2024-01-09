# Interface: AggregateQuerySnapshot\<T\>

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).AggregateQuerySnapshot

The results of executing an aggregation query.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`AggregateSpec`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateSpec.md) |

## Table of contents

### Accessors

- [query](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuerySnapshot.md#query)

### Methods

- [data](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuerySnapshot.md#data)

## Accessors

### query

• `get` **query**(): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`unknown`\>

The underlying query over which the aggregations recorded in this
`AggregateQuerySnapshot` were performed.

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`unknown`\>

#### Defined in

[index.d.ts:922](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L922)

## Methods

### data

▸ **data**(): [`AggregateSpecData`](/reference/firestore/modules/FirebaseFirestoreTypes.md#aggregatespecdata)\<`T`\>

Returns the results of the aggregations performed over the underlying
query.

The keys of the returned object will be the same as those of the
`AggregateSpec` object specified to the aggregation method, and the values
will be the corresponding aggregation result.

#### Returns

[`AggregateSpecData`](/reference/firestore/modules/FirebaseFirestoreTypes.md#aggregatespecdata)\<`T`\>

The results of the aggregations performed over the underlying
query.

#### Defined in

[index.d.ts:935](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L935)
