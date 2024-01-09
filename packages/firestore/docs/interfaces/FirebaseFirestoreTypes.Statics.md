# Interface: Statics

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).Statics

`firebase.firestore.X`

## Table of contents

### Properties

- [Blob](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md#blob)
- [CACHE\_SIZE\_UNLIMITED](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md#cache_size_unlimited)
- [FieldPath](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md#fieldpath)
- [FieldValue](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md#fieldvalue)
- [Filter](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md#filter)
- [GeoPoint](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md#geopoint)
- [Timestamp](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md#timestamp)

### Methods

- [setLogLevel](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md#setloglevel)

## Properties

### Blob

• **Blob**: typeof [`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md)

Returns the `Blob` class.

#### Defined in

[index.d.ts:2046](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2046)

___

### CACHE\_SIZE\_UNLIMITED

• **CACHE\_SIZE\_UNLIMITED**: `number`

Used to set the cache size to unlimited when passing to `cacheSizeBytes` in
`firebase.firestore().settings()`.

#### Defined in

[index.d.ts:2077](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2077)

___

### FieldPath

• **FieldPath**: typeof [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md)

Returns the `FieldPath` class.

#### Defined in

[index.d.ts:2051](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2051)

___

### FieldValue

• **FieldValue**: typeof [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)

Returns the `FieldValue` class.

#### Defined in

[index.d.ts:2056](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2056)

___

### Filter

• **Filter**: [`FilterFunction`](/reference/firestore/interfaces/FirebaseFirestoreTypes.FilterFunction.md)

Returns the `Filter` function.

#### Defined in

[index.d.ts:2071](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2071)

___

### GeoPoint

• **GeoPoint**: typeof [`GeoPoint`](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md)

Returns the `GeoPoint` class.

#### Defined in

[index.d.ts:2061](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2061)

___

### Timestamp

• **Timestamp**: typeof [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

Returns the `Timestamp` class.

#### Defined in

[index.d.ts:2066](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2066)

## Methods

### setLogLevel

▸ **setLogLevel**(`logLevel`): `void`

Sets the verbosity of Cloud Firestore native device logs (debug, error, or silent).

- `debug`: the most verbose logging level, primarily for debugging.
- `error`: logs only error events.
- `silent`: turn off logging.

#### Example

```js
firebase.firestore.setLogLevel('silent');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `logLevel` | ``"debug"`` \| ``"error"`` \| ``"silent"`` | The verbosity you set for activity and error logging. |

#### Returns

`void`

#### Defined in

[index.d.ts:2094](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2094)
