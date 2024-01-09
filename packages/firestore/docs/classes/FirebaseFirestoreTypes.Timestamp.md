# Class: Timestamp

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).Timestamp

A Timestamp represents a point in time independent of any time zone or calendar, represented as seconds and
fractions of seconds at nanosecond resolution in UTC Epoch time.

It is encoded using the Proleptic Gregorian Calendar which extends the Gregorian calendar backwards to year one.
It is encoded assuming all minutes are 60 seconds long, i.e. leap seconds are "smeared" so that no leap second table
is needed for interpretation. Range is from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59.999999999Z.

## Table of contents

### Constructors

- [constructor](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#constructor)

### Properties

- [nanoseconds](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#nanoseconds)
- [seconds](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#seconds)

### Methods

- [isEqual](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#isequal)
- [toDate](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#todate)
- [toJSON](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#tojson)
- [toMillis](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#tomillis)
- [toString](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#tostring)
- [valueOf](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#valueof)
- [fromDate](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#fromdate)
- [fromMillis](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#frommillis)
- [now](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md#now)

## Constructors

### constructor

• **new Timestamp**(`seconds`, `nanoseconds`): [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

Creates a new timestamp.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `seconds` | `number` | The number of seconds of UTC time since Unix epoch 1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive. |
| `nanoseconds` | `number` | The non-negative fractions of a second at nanosecond resolution. Negative second values with fractions must still have non-negative nanoseconds values that count forward in time. Must be from 0 to 999,999,999 inclusive. |

#### Returns

[`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

#### Defined in

[index.d.ts:1684](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1684)

## Properties

### nanoseconds

• **nanoseconds**: `number`

The number of nanoseconds of this `Timestamp`;

#### Defined in

[index.d.ts:1689](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1689)

___

### seconds

• **seconds**: `number`

The number of seconds of this `Timestamp`.

#### Defined in

[index.d.ts:1694](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1694)

## Methods

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this `Timestamp` is equal to the provided one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md) | The `Timestamp` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:1701](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1701)

___

### toDate

▸ **toDate**(): `Date`

Convert a Timestamp to a JavaScript Date object. This conversion causes a loss of precision since Date objects
only support millisecond precision.

Returns a JavaScript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) with
millseconds precision.

#### Returns

`Date`

#### Defined in

[index.d.ts:1710](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1710)

___

### toJSON

▸ **toJSON**(): `Object`

Convert a Timestamp to a JSON object with seconds and nanoseconds members

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `nanoseconds` | `number` |
| `seconds` | `number` |

#### Defined in

[index.d.ts:1728](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1728)

___

### toMillis

▸ **toMillis**(): `number`

Convert a Timestamp to a numeric timestamp (in milliseconds since epoch). This operation causes a loss of precision.

The point in time corresponding to this timestamp, represented as the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.

#### Returns

`number`

#### Defined in

[index.d.ts:1717](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1717)

___

### toString

▸ **toString**(): `string`

Convert a timestamp to a string in format "FirestoreTimestamp(seconds=`seconds`, nanoseconds=`nanoseconds`)",
with the `seconds` and `nanoseconds` replaced by the values in the Timestamp object

#### Returns

`string`

#### Defined in

[index.d.ts:1723](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1723)

___

### valueOf

▸ **valueOf**(): `string`

Converts this object to a primitive string, which allows Timestamp objects to be compared
using the `>`, `<=`, `>=` and `>` operators.

#### Returns

`string`

#### Defined in

[index.d.ts:1734](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1734)

___

### fromDate

▸ **fromDate**(`date`): [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

Creates a new timestamp from the given JavaScript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` | The date to initialize the `Timestamp` from. |

#### Returns

[`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

#### Defined in

[index.d.ts:1664](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1664)

___

### fromMillis

▸ **fromMillis**(`milliseconds`): [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

Creates a new timestamp from the given number of milliseconds.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `milliseconds` | `number` | Number of milliseconds since Unix epoch 1970-01-01T00:00:00Z. |

#### Returns

[`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

#### Defined in

[index.d.ts:1671](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1671)

___

### now

▸ **now**(): [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

Creates a new timestamp with the current date, with millisecond precision.

#### Returns

[`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

#### Defined in

[index.d.ts:1676](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1676)
