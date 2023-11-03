[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [ReactNativeFirebase](../modules/ReactNativeFirebase.md) / NativeFirebaseError

# Interface: NativeFirebaseError

[ReactNativeFirebase](../modules/ReactNativeFirebase.md).NativeFirebaseError

## Hierarchy

- `Error`

  ↳ **`NativeFirebaseError`**

## Table of contents

### Properties

- [cause](ReactNativeFirebase.NativeFirebaseError.md#cause)
- [code](ReactNativeFirebase.NativeFirebaseError.md#code)
- [message](ReactNativeFirebase.NativeFirebaseError.md#message)
- [name](ReactNativeFirebase.NativeFirebaseError.md#name)
- [namespace](ReactNativeFirebase.NativeFirebaseError.md#namespace)
- [nativeErrorCode](ReactNativeFirebase.NativeFirebaseError.md#nativeerrorcode)
- [nativeErrorMessage](ReactNativeFirebase.NativeFirebaseError.md#nativeerrormessage)
- [stack](ReactNativeFirebase.NativeFirebaseError.md#stack)

## Properties

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:24

___

### code

• `Readonly` **code**: `string`

Firebase error code, e.g. `auth/invalid-email`

#### Defined in

[packages/app/lib/index.d.ts:38](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L38)

___

### message

• `Readonly` **message**: `string`

Firebase error message

#### Overrides

Error.message

#### Defined in

[packages/app/lib/index.d.ts:43](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L43)

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1067

___

### namespace

• `Readonly` **namespace**: `string`

The firebase module namespace that this error originated from, e.g. 'analytics'

#### Defined in

[packages/app/lib/index.d.ts:48](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L48)

___

### nativeErrorCode

• `Readonly` **nativeErrorCode**: `string` \| `number`

The native sdks returned error code, different per platform

#### Defined in

[packages/app/lib/index.d.ts:53](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L53)

___

### nativeErrorMessage

• `Readonly` **nativeErrorMessage**: `string`

The native sdks returned error message, different per platform

#### Defined in

[packages/app/lib/index.d.ts:58](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L58)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1069
