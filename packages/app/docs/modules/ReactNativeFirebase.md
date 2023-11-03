[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / ReactNativeFirebase

# Namespace: ReactNativeFirebase

Core React Native Firebase package.

#### Example 1

Access the default firebase app from the `app` package:

```js
import firebase from '@react-native-firebase/app';

console.log(firebase.app().name);
```

**`Firebase`**

app

## Table of contents

### Classes

- [FirebaseModule](../classes/ReactNativeFirebase.FirebaseModule.md)

### Interfaces

- [FirebaseApp](../interfaces/ReactNativeFirebase.FirebaseApp.md)
- [FirebaseAppConfig](../interfaces/ReactNativeFirebase.FirebaseAppConfig.md)
- [FirebaseAppOptions](../interfaces/ReactNativeFirebase.FirebaseAppOptions.md)
- [Module](../interfaces/ReactNativeFirebase.Module.md)
- [NativeFirebaseError](../interfaces/ReactNativeFirebase.NativeFirebaseError.md)

### Type Aliases

- [FirebaseModuleWithStatics](ReactNativeFirebase.md#firebasemodulewithstatics)
- [FirebaseModuleWithStaticsAndApp](ReactNativeFirebase.md#firebasemodulewithstaticsandapp)
- [LogLevelString](ReactNativeFirebase.md#loglevelstring)

## Type Aliases

### FirebaseModuleWithStatics

Ƭ **FirebaseModuleWithStatics**<`M`, `S`\>: () => `M` & `S`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | `M` |
| `S` | {} |

#### Defined in

[packages/app/lib/index.d.ts:242](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L242)

___

### FirebaseModuleWithStaticsAndApp

Ƭ **FirebaseModuleWithStaticsAndApp**<`M`, `S`\>: (`app?`: [`FirebaseApp`](../interfaces/ReactNativeFirebase.FirebaseApp.md)) => `M` & `S`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | `M` |
| `S` | {} |

#### Defined in

[packages/app/lib/index.d.ts:252](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L252)

___

### LogLevelString

Ƭ **LogLevelString**: ``"debug"`` \| ``"verbose"`` \| ``"info"`` \| ``"warn"`` \| ``"error"`` \| ``"silent"``

#### Defined in

[packages/app/lib/index.d.ts:61](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L61)
