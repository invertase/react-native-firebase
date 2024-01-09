# Class: Module

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).Module

The Firebase Cloud Firestore service is available for the default app or a given app.

#### Example: Get the firestore instance for the **default app**:

```js
const firestoreForDefaultApp = firebase.firestore();
```

#### Example: Get the firestore instance for a **secondary app**:

```js
const otherApp = firebase.app('otherApp');
const firestoreForOtherApp = firebase.firestore(otherApp);
```

## Hierarchy

- `FirebaseModule`

  ↳ **`Module`**

## Table of contents

### Constructors

- [constructor](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#constructor)

### Properties

- [app](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#app)

### Methods

- [batch](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#batch)
- [clearPersistence](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#clearpersistence)
- [collection](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#collection)
- [collectionGroup](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#collectiongroup)
- [disableNetwork](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#disablenetwork)
- [doc](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#doc)
- [enableNetwork](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#enablenetwork)
- [loadBundle](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#loadbundle)
- [namedQuery](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#namedquery)
- [runTransaction](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#runtransaction)
- [settings](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#settings)
- [terminate](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#terminate)
- [useEmulator](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#useemulator)
- [waitForPendingWrites](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md#waitforpendingwrites)

## Constructors

### constructor

• **new Module**(): [`Module`](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md)

#### Returns

[`Module`](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md)

#### Inherited from

FirebaseModule.constructor

## Properties

### app

• **app**: `FirebaseApp`

The current `FirebaseApp` instance for this Firebase service.

#### Inherited from

FirebaseModule.app

#### Defined in

[../../app/lib/index.d.ts:228](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/app/lib/index.d.ts#L228)

## Methods

### batch

▸ **batch**(): [`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

Creates a write batch, used for performing multiple writes as a single atomic operation.
The maximum number of writes allowed in a single WriteBatch is 500, but note that each usage
of `FieldValue.serverTimestamp()`, `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or `FieldValue.increment()`
inside a WriteBatch counts as an additional write.

#### Example

```js
const batch = firebase.firestore().batch();
batch.delete(...);
```

#### Returns

[`WriteBatch`](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

#### Defined in

[index.d.ts:2128](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2128)

___

### clearPersistence

▸ **clearPersistence**(): `Promise`\<`void`\>

Aimed primarily at clearing up any data cached from running tests. Needs to be executed before any database calls
are made.

#### Example

```js
await firebase.firestore().clearPersistence();
```

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:2272](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2272)

___

### collection

▸ **collection**\<`T`\>(`collectionPath`): [`CollectionReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.CollectionReference.md)\<`T`\>

Gets a `CollectionReference` instance that refers to the collection at the specified path.

#### Example

```js
const collectionReference = firebase.firestore().collection('users');
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `collectionPath` | `string` | A slash-separated path to a collection. |

#### Returns

[`CollectionReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.CollectionReference.md)\<`T`\>

#### Defined in

[index.d.ts:2141](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2141)

___

### collectionGroup

▸ **collectionGroup**\<`T`\>(`collectionId`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Creates and returns a new Query that includes all documents in the database that are contained
in a collection or subcollection with the given collectionId.

#### Example

```js
const collectionGroup = firebase.firestore().collectionGroup('orders');
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `collectionId` | `string` | Identifies the collections to query over. Every collection or subcollection with this ID as the last segment of its path will be included. Cannot contain a slash. |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:2157](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2157)

___

### disableNetwork

▸ **disableNetwork**(): `Promise`\<`void`\>

Disables network usage for this instance. It can be re-enabled via `enableNetwork()`. While the
network is disabled, any snapshot listeners or get() calls will return results from cache, and any
write operations will be queued until the network is restored.

Returns a promise that is resolved once the network has been disabled.

#### Example

```js
await firebase.firestore().disableNetwork();
```

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:2172](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2172)

___

### doc

▸ **doc**\<`T`\>(`documentPath`): [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<`T`\>

Gets a `DocumentReference` instance that refers to the document at the specified path.

#### Example

```js
const documentReference = firebase.firestore().doc('users/alovelace');
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `documentPath` | `string` | A slash-separated path to a document. |

#### Returns

[`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)\<`T`\>

#### Defined in

[index.d.ts:2185](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2185)

___

### enableNetwork

▸ **enableNetwork**(): `Promise`\<`void`\>

Re-enables use of the network for this Firestore instance after a prior call to `disableNetwork()`.

#### Example

```js
await firebase.firestore().enableNetwork();
```

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:2196](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2196)

___

### loadBundle

▸ **loadBundle**(`bundle`): `Promise`\<[`LoadBundleTaskProgress`](/reference/firestore/interfaces/FirebaseFirestoreTypes.LoadBundleTaskProgress.md)\>

Loads a Firestore bundle into the local cache.

#### Example

```js
const resp = await fetch('/createBundle');
const bundleString = await resp.text();
await firestore().loadBundle(bundleString);
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `bundle` | `string` |

#### Returns

`Promise`\<[`LoadBundleTaskProgress`](/reference/firestore/interfaces/FirebaseFirestoreTypes.LoadBundleTaskProgress.md)\>

#### Defined in

[index.d.ts:2250](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2250)

___

### namedQuery

▸ **namedQuery**\<`T`\>(`name`): [`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

Reads a Firestore Query from local cache, identified by the given name.

#### Example

```js
const query = firestore().namedQuery('latest-stories-query');
const storiesSnap = await query.get({ source: 'cache' });
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) = [`DocumentData`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`Query`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)\<`T`\>

#### Defined in

[index.d.ts:2261](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2261)

___

### runTransaction

▸ **runTransaction**(`updateFunction`): `Promise`\<`any`\>

Executes the given `updateFunction` and then attempts to commit the changes applied within the transaction.
If any document read within the transaction has changed, Cloud Firestore retries the `updateFunction`.
If it fails to commit after 5 attempts, the transaction fails.

The maximum number of writes allowed in a single transaction is 500, but note that each usage of
`FieldValue.serverTimestamp()`, `FieldValue.arrayUnion()`, `FieldValue.arrayRemove()`, or `FieldValue.increment()`
inside a transaction counts as an additional write.

#### Example

```js
const cityRef = firebase.firestore().doc('cities/SF');

await firebase.firestore()
  .runTransaction(async (transaction) => {
    const snapshot = await transaction.get(cityRef);
    await transaction.update(cityRef, {
      population: snapshot.data().population + 1,
    });
  });
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `updateFunction` | (`transaction`: [`Transaction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)) => `Promise`\<`any`\> |

#### Returns

`Promise`\<`any`\>

#### Defined in

[index.d.ts:2221](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2221)

___

### settings

▸ **settings**(`settings`): `Promise`\<`void`\>

Specifies custom settings to be used to configure the Firestore instance. Must be set before invoking any other methods.

#### Example

```js
const settings = {
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
};

await firebase.firestore().settings(settings);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `settings` | [`Settings`](/reference/firestore/interfaces/FirebaseFirestoreTypes.Settings.md) | A `Settings` object. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:2238](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2238)

___

### terminate

▸ **terminate**(): `Promise`\<`void`\>

Typically called to ensure a new Firestore instance is initialized before calling
`firebase.firestore().clearPersistence()`.

#### Example

```js
await firebase.firestore().terminate();
```

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:2301](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2301)

___

### useEmulator

▸ **useEmulator**(`host`, `port`): `void`

Modify this Firestore instance to communicate with the Firebase Firestore emulator.
This must be called before any other calls to Firebase Firestore to take effect.
Do not use with production credentials as emulator traffic is not encrypted.

Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
"host" computer IP address for android emulators) to make the standard development experience easy.
If you want to use the emulator on a real android device, you will need to specify the actual host
computer IP address.

#### Parameters

| Name | Type |
| :------ | :------ |
| `host` | `string` |
| `port` | `number` |

#### Returns

`void`

#### Defined in

[index.d.ts:2316](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2316)

___

### waitForPendingWrites

▸ **waitForPendingWrites**(): `Promise`\<`void`\>

Waits until all currently pending writes for the active user have been acknowledged by the
backend.

The returned Promise resolves immediately if there are no outstanding writes. Otherwise, the
Promise waits for all previously issued writes (including those written in a previous app
session), but it does not wait for writes that were added after the method is called. If you
want to wait for additional writes, call `waitForPendingWrites()` again.

Any outstanding `waitForPendingWrites()` Promises are rejected when the logged-in user changes.

#### Example

```js
await firebase.firestore().waitForPendingWrites();
```

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.d.ts:2290](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2290)
