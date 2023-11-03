[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [Utils](../modules/Utils.md) / PlayServicesAvailability

# Interface: PlayServicesAvailability

[Utils](../modules/Utils.md).PlayServicesAvailability

## Table of contents

### Properties

- [error](Utils.PlayServicesAvailability.md#error)
- [hasResolution](Utils.PlayServicesAvailability.md#hasresolution)
- [isAvailable](Utils.PlayServicesAvailability.md#isavailable)
- [isUserResolvableError](Utils.PlayServicesAvailability.md#isuserresolvableerror)
- [status](Utils.PlayServicesAvailability.md#status)

## Properties

### error

• **error**: `undefined` \| `string`

A human readable error string

```js
firebase.utils().playServicesAvailability.error;
```

**`Android`**

Android only - iOS returns undefined

#### Defined in

[packages/app/lib/index.d.ts:477](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L477)

___

### hasResolution

• **hasResolution**: `undefined` \| `boolean`

If Play Services is not available on the device, hasResolution indicates
whether it is possible to do something about it (e.g. install Play Services).

```js
firebase.utils().playServicesAvailability.hasResolution;
```

**`Android`**

Android only - iOS returns undefined

#### Defined in

[packages/app/lib/index.d.ts:457](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L457)

___

### isAvailable

• **isAvailable**: `boolean`

Returns a boolean indicating whether Play Store is available on the device

```js
firebase.utils().playServicesAvailability.isAvailable;
```

**`Android`**

Android only - iOS returns true

#### Defined in

[packages/app/lib/index.d.ts:446](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L446)

___

### isUserResolvableError

• **isUserResolvableError**: `undefined` \| `boolean`

If an error was received, this indicates whether the error is resolvable

```js
firebase.utils().playServicesAvailability.isUserResolvableError;
```

**`Android`**

Android only - iOS returns undefined

#### Defined in

[packages/app/lib/index.d.ts:467](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L467)

___

### status

• **status**: [`PlayServicesAvailabilityStatusCodes`](../enums/Utils.PlayServicesAvailabilityStatusCodes.md)

Returns a numeric status code. Please refer to Android documentation
for further information:
https://developers.google.com/android/reference/com/google/android/gms/common/ConnectionResult

```js
firebase.utils().playServicesAvailability.status;
```

**`Android`**

Android only - iOS returns 0

#### Defined in

[packages/app/lib/index.d.ts:435](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L435)
