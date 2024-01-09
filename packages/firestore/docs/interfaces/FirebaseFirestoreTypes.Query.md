# Interface: Query\<T\>

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).Query

A Query refers to a `Query` which you can read or listen to. You can also construct refined `Query` objects by
adding filters and ordering.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

## Hierarchy

- **`Query`**

  ↳ [`CollectionReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.CollectionReference.md)

## Table of contents

### Methods

- [count](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#count)
- [countFromServer](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#countfromserver)
- [endAt](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#endat)
- [endBefore](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#endbefore)
- [get](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#get)
- [isEqual](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#isequal)
- [limit](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#limit)
- [limitToLast](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#limittolast)
- [onSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#onsnapshot)
- [orderBy](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#orderby)
- [startAfter](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#startafter)
- [startAt](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#startat)
- [where](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md#where)

## Methods

### count

▸ **count**(): [`AggregateQuery`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuery.md)\<\{ `count`: [`AggregateField`](/reference/firestore/classes/FirebaseFirestoreTypes.AggregateField.md)\<`number`\>  }\>

Calculates the number of documents in the result set of the given query, without actually downloading
the documents.

Using this function to count the documents is efficient because only the final count, not the
documents' data, is downloaded. This function can even count the documents if the result set
would be prohibitively large to download entirely (e.g. thousands of documents).

The result received from the server is presented, unaltered, without considering any local state.
That is, documents in the local cache are not taken into consideration, neither are local
modifications not yet synchronized with the server. Previously-downloaded results, if any,
 are not used: every request using this source necessarily involves a round trip to the server.

#### Returns

[`AggregateQuery`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuery.md)\<\{ `count`: [`AggregateField`](/reference/firestore/classes/FirebaseFirestoreTypes.AggregateField.md)\<`number`\>  }\>

#### Defined in

[index.d.ts:983](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L983)

___

### countFromServer

▸ **countFromServer**(): [`AggregateQuery`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuery.md)\<\{ `count`: [`AggregateField`](/reference/firestore/classes/FirebaseFirestoreTypes.AggregateField.md)\<`number`\>  }\>

Same as count()

#### Returns

[`AggregateQuery`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuery.md)\<\{ `count`: [`AggregateField`](/reference/firestore/classes/FirebaseFirestoreTypes.AggregateField.md)\<`number`\>  }\>

#### Defined in

[index.d.ts:988](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L988)

___

### endAt

▸ **endAt**(`snapshot`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that ends at the provided document (inclusive). The end
position is relative to the order of the query. The document must contain all of the
fields provided in the orderBy of this query.

#### Example

```js
const user = await firebase.firestore().doc('users/alovelace').get();

// Get all users up to a specific user in order of age
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .endAt(user);
```

> Cursor snapshot queries have limitations. Please see [Query limitations](/query-limitations) for more information.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `snapshot` | [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\> | The snapshot of the document to end at. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1011](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1011)

▸ **endAt**(`...fieldValues`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that ends at the provided fields relative to the order of the query.
The order of the field values must match the order of the order by clauses of the query.

#### Example

```js
// Get all users who's age is 30 or less
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .endAt(30);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...fieldValues` | `any`[] | The field values to end this query at, in order of the query's order by. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1029](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1029)

___

### endBefore

▸ **endBefore**(`snapshot`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that ends before the provided document (exclusive). The end
position is relative to the order of the query. The document must contain all of the fields
provided in the orderBy of this query.

#### Example

```js
const user = await firebase.firestore().doc('users/alovelace').get();

// Get all users up to, but not including, a specific user in order of age
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .endBefore(user);
```

> Cursor snapshot queries have limitations. Please see [Query limitations](/query-limitations) for more information.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `snapshot` | [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\> | The snapshot of the document to end before. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1052](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1052)

▸ **endBefore**(`...fieldValues`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that ends before the provided fields relative to the order of
the query. The order of the field values must match the order of the order by clauses of the query.

#### Example

```js
// Get all users who's age is 29 or less
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .endBefore(30);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...fieldValues` | `any`[] | The field values to end this query before, in order of the query's order by. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1070](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1070)

___

### get

▸ **get**(`options?`): `Promise`\<[`QuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md)\<`T`\>\>

Executes the query and returns the results as a QuerySnapshot.

Note: By default, get() attempts to provide up-to-date data when possible by waiting for data from the server,
but it may return cached data or fail if you are offline and the server cannot be reached. This behavior can be
altered via the `GetOptions` parameter.

#### Example

```js
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .get({
    source: 'server',
  });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`GetOptions`](/reference/firestore/interfaces/FirebaseFirestoreTypes.GetOptions.md) | An object to configure the get behavior. |

#### Returns

`Promise`\<[`QuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md)\<`T`\>\>

#### Defined in

[index.d.ts:1092](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1092)

___

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this Query is equal to the provided one.

#### Example

```js
const query = firebase.firestore()
  .collection('users')
  .orderBy('age');

// false
query.isEqual(
  firebase.firestore()
    .collection('users')
    .orderBy('name')
);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<[`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)\> | The `Query` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:1114](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1114)

___

### limit

▸ **limit**(`limit`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query where the results are limited to the specified number of documents.

#### Example

```js
// Get 10 users in order of age
const querySnapshot = firebase.firestore()
  .collection('users')
  .orderBy('age')
  .limit(10)
  .get();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `limit` | `number` | The maximum number of items to return. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1132](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1132)

___

### limitToLast

▸ **limitToLast**(`limitToLast`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query where the results are limited to the specified number of documents
starting from the last document. The order is dependent on the second parameter for the `orderBy`
method. If `desc` is used, the order is reversed. `orderBy` method call is required when calling `limitToLast`.

#### Example

```js
// Get the last 10 users in reverse order of age
const querySnapshot = firebase.firestore()
  .collection('users')
  .orderBy('age', 'desc')
  .limitToLast(10)
  .get();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `limitToLast` | `number` | The maximum number of items to return. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1152](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1152)

___

### onSnapshot

▸ **onSnapshot**(`observer`): () => `void`

Attaches a listener for `QuerySnapshot` events.

> Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().collection('users')
  .onSnapshot({
    error: (e) => console.error(e),
    next: (querySnapshot) => {},
  });

unsubscribe();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `observer` | `Object` | A single object containing `next` and `error` callbacks. |
| `observer.complete?` | () => `void` | - |
| `observer.error?` | (`error`: `Error`) => `void` | - |
| `observer.next?` | (`snapshot`: [`QuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md)\<`T`\>) => `void` | - |

#### Returns

`fn`

▸ (): `void`

Attaches a listener for `QuerySnapshot` events.

> Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().collection('users')
  .onSnapshot({
    error: (e) => console.error(e),
    next: (querySnapshot) => {},
  });

unsubscribe();
```

##### Returns

`void`

#### Defined in

[index.d.ts:1175](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1175)

▸ **onSnapshot**(`options`, `observer`): () => `void`

Attaches a listener for `QuerySnapshot` events with snapshot listener options.

> Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().collection('users')
  .onSnapshot({
    includeMetadataChanges: true,
  }, {
    error: (e) => console.error(e),
    next: (querySnapshot) => {},
  });

unsubscribe();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`SnapshotListenOptions`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotListenOptions.md) | Options controlling the listen behavior. |
| `observer` | `Object` | A single object containing `next` and `error` callbacks. |
| `observer.complete?` | () => `void` | - |
| `observer.error?` | (`error`: `Error`) => `void` | - |
| `observer.next?` | (`snapshot`: [`QuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md)\<`T`\>) => `void` | - |

#### Returns

`fn`

▸ (): `void`

Attaches a listener for `QuerySnapshot` events with snapshot listener options.

> Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().collection('users')
  .onSnapshot({
    includeMetadataChanges: true,
  }, {
    error: (e) => console.error(e),
    next: (querySnapshot) => {},
  });

unsubscribe();
```

##### Returns

`void`

#### Defined in

[index.d.ts:1205](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1205)

▸ **onSnapshot**(`onNext`, `onError?`, `onCompletion?`): () => `void`

Attaches a listener for `QuerySnapshot` events.

> Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().collection('users')
  .onSnapshot(
    (querySnapshot) => {}, // onNext
    (error) => console.error(error), // onError
  );

unsubscribe();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `onNext` | (`snapshot`: [`QuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md)\<`T`\>) => `void` | A callback to be called every time a new `QuerySnapshot` is available. |
| `onError?` | (`error`: `Error`) => `void` | A callback to be called if the listen fails or is cancelled. No further callbacks will occur. |
| `onCompletion?` | () => `void` | An optional function which will never be called. |

#### Returns

`fn`

▸ (): `void`

Attaches a listener for `QuerySnapshot` events.

> Although an `onCompletion` callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().collection('users')
  .onSnapshot(
    (querySnapshot) => {}, // onNext
    (error) => console.error(error), // onError
  );

unsubscribe();
```

##### Returns

`void`

#### Defined in

[index.d.ts:1236](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1236)

▸ **onSnapshot**(`options`, `onNext`, `onError?`, `onCompletion?`): () => `void`

Attaches a listener for `QuerySnapshot` events with snapshot listener options.

NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().collection('users')
  .onSnapshot(
    { includeMetadataChanges: true }, // SnapshotListenerOptions
    (querySnapshot) => {}, // onNext
    (error) => console.error(error), // onError
  );

unsubscribe();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`SnapshotListenOptions`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotListenOptions.md) | Options controlling the listen behavior. |
| `onNext` | (`snapshot`: [`QuerySnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md)\<`T`\>) => `void` | A callback to be called every time a new `QuerySnapshot` is available. |
| `onError?` | (`error`: `Error`) => `void` | A callback to be called if the listen fails or is cancelled. No further callbacks will occur. |
| `onCompletion?` | () => `void` | An optional function which will never be called. |

#### Returns

`fn`

▸ (): `void`

Attaches a listener for `QuerySnapshot` events with snapshot listener options.

NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().collection('users')
  .onSnapshot(
    { includeMetadataChanges: true }, // SnapshotListenerOptions
    (querySnapshot) => {}, // onNext
    (error) => console.error(error), // onError
  );

unsubscribe();
```

##### Returns

`void`

#### Defined in

[index.d.ts:1266](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1266)

___

### orderBy

▸ **orderBy**(`fieldPath`, `directionStr?`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that's additionally sorted by the specified field, optionally in descending order instead of ascending.

* #### Example

#### Example

```js
// Get users in order of age, descending
const querySnapshot = firebase.firestore()
  .collection('users')
  .orderBy('age', 'desc')
  .get();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fieldPath` | [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md) \| keyof `T` | The field to sort by. Either a string or FieldPath instance. |
| `directionStr?` | ``"asc"`` \| ``"desc"`` | Optional direction to sort by (`asc` or `desc`). If not specified, order will be ascending. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1291](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1291)

___

### startAfter

▸ **startAfter**(`snapshot`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that starts after the provided document (exclusive). The start
position is relative to the order of the query. The document must contain all of the fields
provided in the orderBy of this query.

#### Example

```js
const user = await firebase.firestore().doc('users/alovelace').get();

// Get all users up to, but not including, a specific user in order of age
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .startAfter(user)
  .get();
```

> Cursor snapshot queries have limitations. Please see [Query limitations](/query-limitations) for more information.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `snapshot` | [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\> | The snapshot of the document to start after. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1315](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1315)

▸ **startAfter**(`...fieldValues`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that starts after the provided fields relative to the order of
the query. The order of the field values must match the order of the order by clauses of the query.

#### Example

```js
// Get all users who's age is above 30
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .startAfter(30)
  .get();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...fieldValues` | `any`[] | The field values to start this query after, in order of the query's order by. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1334](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1334)

___

### startAt

▸ **startAt**(`snapshot`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that starts at the provided document (inclusive). The start
position is relative to the order of the query. The document must contain all of the
fields provided in the orderBy of this query.

#### Example

```js
const user = await firebase.firestore().doc('users/alovelace').get();

// Get all users up to a specific user in order of age
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .startAt(user)
  .get();
```

> Cursor snapshot queries have limitations. Please see [Query limitations](/query-limitations) for more information.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `snapshot` | [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\> | The snapshot of the document to start at. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1358](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1358)

▸ **startAt**(`...fieldValues`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that starts at the provided fields relative to the order of the query.
The order of the field values must match the order of the order by clauses of the query.

#### Example

```js
// Get all users who's age is 30 or above
const querySnapshot = await firebase.firestore()
  .collection('users')
  .orderBy('age')
  .startAt(30)
  .get();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...fieldValues` | `any`[] | The field values to start this query at, in order of the query's order by. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1377](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1377)

___

### where

▸ **where**(`fieldPath`, `opStr`, `value`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query with the additional filter that documents must contain the specified field and
the value should satisfy the relation constraint provided.

#### Example

```js
// Get all users who's age is 30 or above
const querySnapshot = await firebase.firestore()
  .collection('users')
  .where('age', '>=', 30);
  .get();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fieldPath` | [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md) \| keyof `T` | The path to compare. |
| `opStr` | [`WhereFilterOp`](/reference/firestore/modules/FirebaseFirestoreTypes.md#wherefilterop) | The operation string (e.g "<", "<=", "==", ">", ">=", "!=", "array-contains", "array-contains-any", "in", "not-in"). |
| `value` | `any` | The comparison value. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1397](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1397)

▸ **where**(`filter`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query with the additional filter that documents must contain the specified field and
the value should satisfy the relation constraint provided.

#### Example

```js
// Get all users who's age is 30 or above
const querySnapshot = await firebase.firestore()
  .collection('users')
  .where(Filter('age', '>=', 30));
  .get();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filter` | [`QueryFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryFilterConstraint.md) \| [`QueryCompositeFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryCompositeFilterConstraint.md) | The filter to apply to the query. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:1415](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1415)
