# Class: Blob

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).Blob

An immutable object representing an array of bytes.

## Table of contents

### Constructors

- [constructor](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md#constructor)

### Methods

- [isEqual](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md#isequal)
- [toBase64](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md#tobase64)
- [toUint8Array](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md#touint8array)
- [fromBase64String](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md#frombase64string)
- [fromUint8Array](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md#fromuint8array)

## Constructors

### constructor

• **new Blob**(): [`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md)

#### Returns

[`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md)

## Methods

### isEqual

▸ **isEqual**(`other`): `boolean`

Returns true if this `Blob` is equal to the provided one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | [`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md) | The `Blob` to compare against. |

#### Returns

`boolean`

#### Defined in

[index.d.ts:117](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L117)

___

### toBase64

▸ **toBase64**(): `string`

Returns the bytes of a Blob as a Base64-encoded string.

#### Returns

`string`

#### Defined in

[index.d.ts:122](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L122)

___

### toUint8Array

▸ **toUint8Array**(): `Uint8Array`

Returns the bytes of a Blob in a new Uint8Array.

#### Returns

`Uint8Array`

#### Defined in

[index.d.ts:127](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L127)

___

### fromBase64String

▸ **fromBase64String**(`base64`): [`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md)

Creates a new Blob from the given Base64 string, converting it to bytes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `base64` | `string` | The Base64 string used to create the Blob object. |

#### Returns

[`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md)

#### Defined in

[index.d.ts:103](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L103)

___

### fromUint8Array

▸ **fromUint8Array**(`array`): [`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md)

Creates a new Blob from the given Uint8Array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `array` | `Uint8Array` | The Uint8Array used to create the Blob object. |

#### Returns

[`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md)

#### Defined in

[index.d.ts:110](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L110)
