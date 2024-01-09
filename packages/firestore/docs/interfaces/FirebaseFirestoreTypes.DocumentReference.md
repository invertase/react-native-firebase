# Interface: DocumentReference\<T\>

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).DocumentReference

A `DocumentReference` refers to a document location in a Firestore database and can be used to write, read, or listen
to the location. The document at the referenced location may or may not exist. A `DocumentReference` can also be used
to create a `CollectionReference` to a subcollection.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

## Table of contents

### Properties

- [firestore](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#firestore)
- [id](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#id)
- [parent](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#parent)
- [path](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#path)

### Methods

- [collection](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#collection)
- [delete](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#delete)
- [get](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#get)
- [isEqual](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#isequal)
- [onSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#onsnapshot)
- [set](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#set)
- [update](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md#update)

## Properties

### firestore

• **firestore**: [`Module`](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md)

The Firestore instance the document is in. This is useful for performing transactions, for example.

#### Defined in

[index.d.ts:253](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L253)

___

### id

• **id**: `string`

The document's identifier within its collection.

#### Defined in

[index.d.ts:258](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L258)

___

### parent

• **parent**: [`CollectionReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.CollectionReference.md)\<`T`\>

The Collection this `DocumentReference` belongs to.

#### Defined in

[index.d.ts:263](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L263)

___

### path

• **path**: `string`

A string representing the path of the referenced document (relative to the root of the database).

#### Defined in

[index.d.ts:268](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L268)

## Methods

### collection

▸ **collection**(`collectionPath`): [`CollectionReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.CollectionReference.md)\<[`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)\>

Gets a `CollectionReference` instance that refers to the collection at the specified path.

#### Example

```js
const collectionRef = firebase.firestore().doc('users/alovelace').collection('orders');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `collectionPath` | `string` | A slash-separated path to a collection. |

#### Returns

[`CollectionReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.CollectionReference.md)\<[`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)\>

#### Defined in

[index.d.ts:281](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L281)

___

### delete

▸ **delete**(): `Promise`\<`void`\>

Deletes the document referred to by this DocumentReference.

#### Example

```js
await firebase.firestore().doc('users/alovelace').delete();
```

The Promise is resolved once the document has been successfully deleted from the backend
(Note that it won't resolve while you're offline).

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:295](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L295)

___

### get

▸ **get**(`options?`): `Promise`\<[`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>\>

Reads the document referred to by this DocumentReference.

Note: By default, get() attempts to provide up-to-date data when possible by waiting for data
from the server, but it may return cached data or fail if you are offline and the server cannot
be reached. This behavior can be altered via the GetOptions parameter.

#### Example

```js
await firebase.firestore().doc('users/alovelace').get({
  source: 'server',
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`GetOptions`](/reference/firestore/interfaces/FirebaseFirestoreTypes.GetOptions.md) | An object to configure the get behavior. |

#### Returns

`Promise`\<[`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>\>

#### Defined in

[index.d.ts:314](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L314)

___

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this DocumentReference is equal to the provided one.

#### Example

```js
const alovelace = firebase.firestore().doc('users/alovelace');
const dsmith = firebase.firestore().doc('users/dsmith');

// false
alovelace.isEqual(dsmith);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<[`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)\> | The `DocumentReference` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:331](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L331)

___

### onSnapshot

▸ **onSnapshot**(`observer`): () => `void`

Attaches a listener for DocumentSnapshot events.

NOTE: Although an complete callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().doc('users/alovelace')
  .onSnapshot({
    error: (e) => console.error(e),
    next: (documentSnapshot) => {},
  });

unsubscribe();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `observer` | `Object` | A single object containing `next` and `error` callbacks. |
| `observer.complete?` | () => `void` | - |
| `observer.error?` | (`error`: `Error`) => `void` | - |
| `observer.next?` | (`snapshot`: [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>) => `void` | - |

#### Returns

`fn`

▸ (): `void`

Attaches a listener for DocumentSnapshot events.

NOTE: Although an complete callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().doc('users/alovelace')
  .onSnapshot({
    error: (e) => console.error(e),
    next: (documentSnapshot) => {},
  });

unsubscribe();
```

##### Returns

`void`

#### Defined in

[index.d.ts:354](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L354)

▸ **onSnapshot**(`options`, `observer`): () => `void`

Attaches a listener for DocumentSnapshot events with snapshot listener options.

NOTE: Although an complete callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().doc('users/alovelace')
  .onSnapshot({
    includeMetadataChanges: true,
  }, {
    error: (e) => console.error(e),
    next: (documentSnapshot) => {},
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
| `observer.next?` | (`snapshot`: [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>) => `void` | - |

#### Returns

`fn`

▸ (): `void`

Attaches a listener for DocumentSnapshot events with snapshot listener options.

NOTE: Although an complete callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().doc('users/alovelace')
  .onSnapshot({
    includeMetadataChanges: true,
  }, {
    error: (e) => console.error(e),
    next: (documentSnapshot) => {},
  });

unsubscribe();
```

##### Returns

`void`

#### Defined in

[index.d.ts:384](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L384)

▸ **onSnapshot**(`onNext`, `onError?`, `onCompletion?`): () => `void`

Attaches a listener for DocumentSnapshot events.

NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().doc('users/alovelace')
  .onSnapshot(
    (documentSnapshot) => {}, // onNext
    (error) => console.error(error), // onError
  );

unsubscribe();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `onNext` | (`snapshot`: [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>) => `void` | A callback to be called every time a new `DocumentSnapshot` is available. |
| `onError?` | (`error`: `Error`) => `void` | A callback to be called if the listen fails or is cancelled. No further callbacks will occur. |
| `onCompletion?` | () => `void` | An optional function which will never be called. |

#### Returns

`fn`

▸ (): `void`

Attaches a listener for DocumentSnapshot events.

NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().doc('users/alovelace')
  .onSnapshot(
    (documentSnapshot) => {}, // onNext
    (error) => console.error(error), // onError
  );

unsubscribe();
```

##### Returns

`void`

#### Defined in

[index.d.ts:415](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L415)

▸ **onSnapshot**(`options`, `onNext`, `onError?`, `onCompletion?`): () => `void`

Attaches a listener for DocumentSnapshot events with snapshot listener options.

NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().doc('users/alovelace')
  .onSnapshot(
    { includeMetadataChanges: true }, // SnapshotListenerOptions
    (documentSnapshot) => {}, // onNext
    (error) => console.error(error), // onError
  );

unsubscribe();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`SnapshotListenOptions`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotListenOptions.md) | Options controlling the listen behavior. |
| `onNext` | (`snapshot`: [`DocumentSnapshot`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)\<`T`\>) => `void` | A callback to be called every time a new `DocumentSnapshot` is available. |
| `onError?` | (`error`: `Error`) => `void` | A callback to be called if the listen fails or is cancelled. No further callbacks will occur. |
| `onCompletion?` | () => `void` | An optional function which will never be called. |

#### Returns

`fn`

▸ (): `void`

Attaches a listener for DocumentSnapshot events with snapshot listener options.

NOTE: Although an onCompletion callback can be provided, it will never be called because the snapshot stream is never-ending.

Returns an unsubscribe function to stop listening to events.

#### Example

```js
const unsubscribe = firebase.firestore().doc('users/alovelace')
  .onSnapshot(
    { includeMetadataChanges: true }, // SnapshotListenerOptions
    (documentSnapshot) => {}, // onNext
    (error) => console.error(error), // onError
  );

unsubscribe();
```

##### Returns

`void`

#### Defined in

[index.d.ts:445](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L445)

___

### set

▸ **set**(`data`, `options?`): `Promise`\<`void`\>

Writes to the document referred to by this DocumentReference. If the document does not yet
exist, it will be created. If you pass SetOptions, the provided data can be merged into an
existing document.

#### Example

```js
const user = firebase.firestore().doc('users/alovelace');

// Set new data
await user.set({
  name: 'Ada Lovelace',
  age: 30,
  city: 'LON',
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`SetValue`](/reference/firestore/modules/FirebaseFirestoreTypes.md#setvalue)\<`T`\> | A map of the fields and values for the document. |
| `options?` | [`SetOptions`](/reference/firestore/interfaces/FirebaseFirestoreTypes.SetOptions.md) | An object to configure the set behavior. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:473](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L473)

___

### update

▸ **update**(`data`): `Promise`\<`void`\>

Updates fields in the document referred to by this `DocumentReference`. The update will fail
if applied to a document that does not exist.

#### Example

```
const user = firebase.firestore().doc('users/alovelace');

// Update age but leave other fields untouched
await user.update({
  age: 31,
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `Partial`\<[`SetValue`](/reference/firestore/modules/FirebaseFirestoreTypes.md#setvalue)\<`T`\>\> | An object containing the fields and values with which to update the document. Fields can contain dots to reference nested fields within the document. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:492](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L492)

▸ **update**(`field`, `value`, `...moreFieldsAndValues`): `Promise`\<`void`\>

Updates fields in the document referred to by this DocumentReference. The update will fail if
applied to a document that does not exist.

#### Example

```
const user = firebase.firestore().doc('users/alovelace');

// Update age & city but leve other fields untouched
await user.update('age', 31, 'city', 'SF');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `field` | [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md) \| keyof `T` | The first field to update. |
| `value` | `any` | The first value. |
| `...moreFieldsAndValues` | `any`[] | Additional key value pairs. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:511](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L511)
