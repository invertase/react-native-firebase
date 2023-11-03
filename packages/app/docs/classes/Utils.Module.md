[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [Utils](../modules/Utils.md) / Module

# Class: Module

[Utils](../modules/Utils.md).Module

The React Native Firebase Utils service interface.

> This module is available for the default app only.

#### Example

Get the Utils service for the default app:

```js
const defaultAppUtils = firebase.utils();
```

## Hierarchy

- [`FirebaseModule`](ReactNativeFirebase.FirebaseModule.md)

  ↳ **`Module`**

## Table of contents

### Constructors

- [constructor](Utils.Module.md#constructor)

### Properties

- [app](Utils.Module.md#app)
- [isRunningInTestLab](Utils.Module.md#isrunningintestlab)
- [playServicesAvailability](Utils.Module.md#playservicesavailability)

### Methods

- [getPlayServicesStatus](Utils.Module.md#getplayservicesstatus)
- [makePlayServicesAvailable](Utils.Module.md#makeplayservicesavailable)
- [promptForPlayServices](Utils.Module.md#promptforplayservices)
- [resolutionForPlayServices](Utils.Module.md#resolutionforplayservices)

## Constructors

### constructor

• **new Module**()

#### Inherited from

[FirebaseModule](ReactNativeFirebase.FirebaseModule.md).[constructor](ReactNativeFirebase.FirebaseModule.md#constructor)

## Properties

### app

• **app**: [`FirebaseApp`](../interfaces/ReactNativeFirebase.FirebaseApp.md)

The current `FirebaseApp` instance for this Firebase service.

#### Inherited from

[FirebaseModule](ReactNativeFirebase.FirebaseModule.md).[app](ReactNativeFirebase.FirebaseModule.md#app)

#### Defined in

[packages/app/lib/index.d.ts:228](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L228)

___

### isRunningInTestLab

• **isRunningInTestLab**: `boolean`

Returns true if this app is running inside a Firebase Test Lab environment.

#### Example

```js
const isRunningInTestLab = await firebase.utils().isRunningInTestLab;
```

**`Android`**

Android only - iOS returns false

#### Defined in

[packages/app/lib/index.d.ts:504](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L504)

___

### playServicesAvailability

• **playServicesAvailability**: [`PlayServicesAvailability`](../interfaces/Utils.PlayServicesAvailability.md)

Returns PlayServicesAvailability properties

#### Example

```js
const PlayServicesAvailability = await firebase.utils().playServicesAvailability;
```

**`Android`**

Android only - iOS always returns { isAvailable: true, status: 0 }

#### Defined in

[packages/app/lib/index.d.ts:516](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L516)

## Methods

### getPlayServicesStatus

▸ **getPlayServicesStatus**(): `Promise`<[`PlayServicesAvailability`](../interfaces/Utils.PlayServicesAvailability.md)\>

Returns PlayServicesAvailability properties

#### Example

```js
const PlayServicesAvailability = await firebase.utils().getPlayServicesStatus();
```

#### Returns

`Promise`<[`PlayServicesAvailability`](../interfaces/Utils.PlayServicesAvailability.md)\>

**`Android`**

Android only - iOS always returns { isAvailable: true, status: 0 }

#### Defined in

[packages/app/lib/index.d.ts:529](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L529)

___

### makePlayServicesAvailable

▸ **makePlayServicesAvailable**(): `Promise`<`void`\>

Attempts to make Google Play services available on this device

#### Example

```js
await firebase.utils().makePlayServicesAvailable();
```

#### Returns

`Promise`<`void`\>

**`Android`**

Android only - iOS returns undefined

#### Defined in

[packages/app/lib/index.d.ts:554](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L554)

___

### promptForPlayServices

▸ **promptForPlayServices**(): `Promise`<`void`\>

A prompt appears on the device to ask the user to update play services

#### Example

```js
await firebase.utils().promptForPlayServices();
```

#### Returns

`Promise`<`void`\>

**`Android`**

Android only - iOS returns undefined

#### Defined in

[packages/app/lib/index.d.ts:542](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L542)

___

### resolutionForPlayServices

▸ **resolutionForPlayServices**(): `Promise`<`void`\>

Resolves an error by starting any intents requiring user interaction.

#### Example

```js
await firebase.utils().resolutionForPlayServices();
```

#### Returns

`Promise`<`void`\>

**`Android`**

Android only - iOS returns undefined

#### Defined in

[packages/app/lib/index.d.ts:566](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L566)
