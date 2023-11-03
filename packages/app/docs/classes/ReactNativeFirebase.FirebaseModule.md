[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [ReactNativeFirebase](../modules/ReactNativeFirebase.md) / FirebaseModule

# Class: FirebaseModule

[ReactNativeFirebase](../modules/ReactNativeFirebase.md).FirebaseModule

A class that all React Native Firebase modules extend from to provide default behaviour.

## Hierarchy

- **`FirebaseModule`**

  ↳ [`Module`](Utils.Module.md)

## Table of contents

### Constructors

- [constructor](ReactNativeFirebase.FirebaseModule.md#constructor)

### Properties

- [app](ReactNativeFirebase.FirebaseModule.md#app)
- [emitter](ReactNativeFirebase.FirebaseModule.md#emitter)
- [native](ReactNativeFirebase.FirebaseModule.md#native)

## Constructors

### constructor

• **new FirebaseModule**()

## Properties

### app

• **app**: [`FirebaseApp`](../interfaces/ReactNativeFirebase.FirebaseApp.md)

The current `FirebaseApp` instance for this Firebase service.

#### Defined in

[packages/app/lib/index.d.ts:228](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L228)

___

### emitter

• `Private` **emitter**: `any`

Returns the shared event emitter instance used for all JS event routing.

#### Defined in

[packages/app/lib/index.d.ts:238](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L238)

___

### native

• `Private` **native**: `any`

The native module instance for this Firebase service.

#### Defined in

[packages/app/lib/index.d.ts:233](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L233)
