# Class: GeoPoint

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).GeoPoint

An immutable object representing a geo point in Firestore. The geo point is represented as latitude/longitude pair.

Latitude values are in the range of [-90, 90]. Longitude values are in the range of [-180, 180].

## Table of contents

### Constructors

- [constructor](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md#constructor)

### Properties

- [latitude](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md#latitude)
- [longitude](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md#longitude)

### Methods

- [isEqual](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md#isequal)
- [toJSON](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md#tojson)

## Constructors

### constructor

• **new GeoPoint**(`latitude`, `longitude`): [`GeoPoint`](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md)

Creates a new immutable GeoPoint object with the provided latitude and longitude values.

#### Example

```js
const geoPoint = new firebase.firestore.GeoPoint(60, -40);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `latitude` | `number` | The latitude as number between -90 and 90. |
| `longitude` | `number` | The longitude as number between -180 and 180. |

#### Returns

[`GeoPoint`](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md)

#### Defined in

[index.d.ts:824](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L824)

## Properties

### latitude

• **latitude**: `number`

The latitude of this `GeoPoint` instance.

#### Defined in

[index.d.ts:829](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L829)

___

### longitude

• **longitude**: `number`

The longitude of this `GeoPoint` instance.

#### Defined in

[index.d.ts:834](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L834)

## Methods

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this `GeoPoint` is equal to the provided one.

#### Example

```js
const geoPoint1 = new firebase.firestore.GeoPoint(60, -40);
const geoPoint2 = new firebase.firestore.GeoPoint(60, -20);

// false
geoPoint1.isEqual(geoPoint2);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`GeoPoint`](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md) | The `GeoPoint` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:851](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L851)

___

### toJSON

▸ **toJSON**(): `Object`

Returns a JSON-serializable representation of this GeoPoint.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `latitude` | `number` |
| `longitude` | `number` |

#### Defined in

[index.d.ts:856](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L856)
