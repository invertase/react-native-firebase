[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [ReactNativeFirebase](../modules/ReactNativeFirebase.md) / Module

# Interface: Module

[ReactNativeFirebase](../modules/ReactNativeFirebase.md).Module

## Table of contents

### Properties

- [SDK\_VERSION](ReactNativeFirebase.Module.md#sdk_version)
- [analytics](ReactNativeFirebase.Module.md#analytics)
- [appCheck](ReactNativeFirebase.Module.md#appcheck)
- [appDistribution](ReactNativeFirebase.Module.md#appdistribution)
- [apps](ReactNativeFirebase.Module.md#apps)
- [auth](ReactNativeFirebase.Module.md#auth)
- [crashlytics](ReactNativeFirebase.Module.md#crashlytics)
- [database](ReactNativeFirebase.Module.md#database)
- [dynamicLinks](ReactNativeFirebase.Module.md#dynamiclinks)
- [firestore](ReactNativeFirebase.Module.md#firestore)
- [functions](ReactNativeFirebase.Module.md#functions)
- [inAppMessaging](ReactNativeFirebase.Module.md#inappmessaging)
- [installations](ReactNativeFirebase.Module.md#installations)
- [messaging](ReactNativeFirebase.Module.md#messaging)
- [ml](ReactNativeFirebase.Module.md#ml)
- [perf](ReactNativeFirebase.Module.md#perf)
- [remoteConfig](ReactNativeFirebase.Module.md#remoteconfig)
- [storage](ReactNativeFirebase.Module.md#storage)
- [utils](ReactNativeFirebase.Module.md#utils)

### Methods

- [app](ReactNativeFirebase.Module.md#app)
- [initializeApp](ReactNativeFirebase.Module.md#initializeapp)
- [setLogLevel](ReactNativeFirebase.Module.md#setloglevel)

## Properties

### SDK\_VERSION

• `Readonly` **SDK\_VERSION**: `string`

The current React Native Firebase version.

#### Defined in

[packages/app/lib/index.d.ts:211](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L211)

___

### analytics

• **analytics**: [`FirebaseModuleWithStatics`](../modules/ReactNativeFirebase.md#firebasemodulewithstatics)<`Module`, `Statics`\>

#### Defined in

[packages/analytics/lib/index.d.ts:1795](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/analytics/lib/index.d.ts#L1795)

___

### appCheck

• **appCheck**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/app-check/lib/index.d.ts:325](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app-check/lib/index.d.ts#L325)

___

### appDistribution

• **appDistribution**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/app-distribution/lib/index.d.ts:155](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app-distribution/lib/index.d.ts#L155)

___

### apps

• **apps**: [`FirebaseApp`](ReactNativeFirebase.FirebaseApp.md)[]

A (read-only) array of all the initialized Apps.

#### Defined in

[packages/app/lib/index.d.ts:206](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L206)

___

### auth

• **auth**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/auth/lib/index.d.ts:1970](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/auth/lib/index.d.ts#L1970)

___

### crashlytics

• **crashlytics**: [`FirebaseModuleWithStatics`](../modules/ReactNativeFirebase.md#firebasemodulewithstatics)<`Module`, `Statics`\>

#### Defined in

[packages/crashlytics/lib/index.d.ts:277](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/crashlytics/lib/index.d.ts#L277)

___

### database

• **database**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/database/lib/index.d.ts:1308](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/database/lib/index.d.ts#L1308)

___

### dynamicLinks

• **dynamicLinks**: [`FirebaseModuleWithStatics`](../modules/ReactNativeFirebase.md#firebasemodulewithstatics)<`Module`, `Statics`\>

#### Defined in

[packages/dynamic-links/lib/index.d.ts:639](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/dynamic-links/lib/index.d.ts#L639)

___

### firestore

• **firestore**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/firestore/lib/index.d.ts:2355](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/firestore/lib/index.d.ts#L2355)

___

### functions

• **functions**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/functions/lib/index.d.ts:434](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/functions/lib/index.d.ts#L434)

___

### inAppMessaging

• **inAppMessaging**: [`FirebaseModuleWithStatics`](../modules/ReactNativeFirebase.md#firebasemodulewithstatics)<`Module`, `Statics`\>

#### Defined in

[packages/in-app-messaging/lib/index.d.ts:172](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/in-app-messaging/lib/index.d.ts#L172)

___

### installations

• **installations**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/installations/lib/index.d.ts:154](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/installations/lib/index.d.ts#L154)

___

### messaging

• **messaging**: [`FirebaseModuleWithStatics`](../modules/ReactNativeFirebase.md#firebasemodulewithstatics)<`Module`, `Statics`\>

#### Defined in

[packages/messaging/lib/index.d.ts:1148](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/messaging/lib/index.d.ts#L1148)

___

### ml

• **ml**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/ml/lib/index.d.ts:84](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/ml/lib/index.d.ts#L84)

___

### perf

• **perf**: [`FirebaseModuleWithStatics`](../modules/ReactNativeFirebase.md#firebasemodulewithstatics)<`Module`, `Statics`\>

#### Defined in

[packages/perf/lib/index.d.ts:563](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/perf/lib/index.d.ts#L563)

___

### remoteConfig

• **remoteConfig**: [`FirebaseModuleWithStatics`](../modules/ReactNativeFirebase.md#firebasemodulewithstatics)<`Module`, `Statics`\>

#### Defined in

[packages/remote-config/lib/index.d.ts:578](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/remote-config/lib/index.d.ts#L578)

___

### storage

• **storage**: [`FirebaseModuleWithStaticsAndApp`](../modules/ReactNativeFirebase.md#firebasemodulewithstaticsandapp)<`Module`, `Statics`\>

#### Defined in

[packages/storage/lib/index.d.ts:1165](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1165)

___

### utils

• **utils**: [`FirebaseModuleWithStatics`](../modules/ReactNativeFirebase.md#firebasemodulewithstatics)<[`Module`](../classes/Utils.Module.md), [`Statics`](Utils.Statics.md)\>

Utils provides a collection of utilities to aid in using Firebase
and related services inside React Native, e.g. Test Lab helpers
and Google Play Services version helpers.

#### Defined in

[packages/app/lib/index.d.ts:218](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L218)

## Methods

### app

▸ **app**(`name?`): [`FirebaseApp`](ReactNativeFirebase.FirebaseApp.md)

Retrieve an instance of a FirebaseApp.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name?` | `string` | The optional name of the app to return ('[DEFAULT]' if omitted) |

#### Returns

[`FirebaseApp`](ReactNativeFirebase.FirebaseApp.md)

**`Example`**

```js
const app = firebase.app('foo');
```

#### Defined in

[packages/app/lib/index.d.ts:188](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L188)

___

### initializeApp

▸ **initializeApp**(`options`, `config?`): `Promise`<[`FirebaseApp`](ReactNativeFirebase.FirebaseApp.md)\>

Create (and initialize) a FirebaseApp.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FirebaseAppOptions`](ReactNativeFirebase.FirebaseAppOptions.md) | Options to configure the services used in the App. |
| `config?` | [`FirebaseAppConfig`](ReactNativeFirebase.FirebaseAppConfig.md) | The optional config for your firebase app |

#### Returns

`Promise`<[`FirebaseApp`](ReactNativeFirebase.FirebaseApp.md)\>

#### Defined in

[packages/app/lib/index.d.ts:167](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L167)

▸ **initializeApp**(`options`, `name?`): `Promise`<[`FirebaseApp`](ReactNativeFirebase.FirebaseApp.md)\>

Create (and initialize) a FirebaseApp.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FirebaseAppOptions`](ReactNativeFirebase.FirebaseAppOptions.md) | Options to configure the services used in the App. |
| `name?` | `string` | The optional name of the app to initialize ('[DEFAULT]' if omitted) |

#### Returns

`Promise`<[`FirebaseApp`](ReactNativeFirebase.FirebaseApp.md)\>

#### Defined in

[packages/app/lib/index.d.ts:176](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L176)

___

### setLogLevel

▸ **setLogLevel**(`logLevel`): `void`

Set the log level across all modules. Only applies to iOS currently, has no effect on Android.
Should be one of 'error', 'warn', 'info', or 'debug'.
Logs messages at the configured level or lower (less verbose / more important).
Note that if an app is running from AppStore, it will never log above info even if
level is set to a higher (more verbose) setting.
Note that iOS is missing firebase-js-sdk log levels 'verbose' and 'silent'.
'verbose' if used will map to 'debug', 'silent' has no valid mapping and will return an error if used.

#### Parameters

| Name | Type |
| :------ | :------ |
| `logLevel` | [`LogLevelString`](../modules/ReactNativeFirebase.md#loglevelstring) |

#### Returns

`void`

**`Ios`**

#### Defined in

[packages/app/lib/index.d.ts:201](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L201)
