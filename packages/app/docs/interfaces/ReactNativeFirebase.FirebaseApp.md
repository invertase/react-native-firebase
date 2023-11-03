[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [ReactNativeFirebase](../modules/ReactNativeFirebase.md) / FirebaseApp

# Interface: FirebaseApp

[ReactNativeFirebase](../modules/ReactNativeFirebase.md).FirebaseApp

## Table of contents

### Properties

- [name](ReactNativeFirebase.FirebaseApp.md#name)
- [options](ReactNativeFirebase.FirebaseApp.md#options)

### Methods

- [analytics](ReactNativeFirebase.FirebaseApp.md#analytics)
- [appCheck](ReactNativeFirebase.FirebaseApp.md#appcheck)
- [appDistribution](ReactNativeFirebase.FirebaseApp.md#appdistribution)
- [auth](ReactNativeFirebase.FirebaseApp.md#auth)
- [crashlytics](ReactNativeFirebase.FirebaseApp.md#crashlytics)
- [database](ReactNativeFirebase.FirebaseApp.md#database)
- [delete](ReactNativeFirebase.FirebaseApp.md#delete)
- [dynamicLinks](ReactNativeFirebase.FirebaseApp.md#dynamiclinks)
- [firestore](ReactNativeFirebase.FirebaseApp.md#firestore)
- [functions](ReactNativeFirebase.FirebaseApp.md#functions)
- [inAppMessaging](ReactNativeFirebase.FirebaseApp.md#inappmessaging)
- [installations](ReactNativeFirebase.FirebaseApp.md#installations)
- [messaging](ReactNativeFirebase.FirebaseApp.md#messaging)
- [ml](ReactNativeFirebase.FirebaseApp.md#ml)
- [perf](ReactNativeFirebase.FirebaseApp.md#perf)
- [remoteConfig](ReactNativeFirebase.FirebaseApp.md#remoteconfig)
- [storage](ReactNativeFirebase.FirebaseApp.md#storage)
- [utils](ReactNativeFirebase.FirebaseApp.md#utils)

## Properties

### name

• `Readonly` **name**: `string`

The name (identifier) for this App. '[DEFAULT]' is the default App.

#### Defined in

[packages/app/lib/index.d.ts:145](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L145)

___

### options

• `Readonly` **options**: [`FirebaseAppOptions`](ReactNativeFirebase.FirebaseAppOptions.md)

The (read-only) configuration options from the app initialization.

#### Defined in

[packages/app/lib/index.d.ts:150](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L150)

## Methods

### analytics

▸ **analytics**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/analytics/lib/index.d.ts:1802](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/analytics/lib/index.d.ts#L1802)

___

### appCheck

▸ **appCheck**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/app-check/lib/index.d.ts:331](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app-check/lib/index.d.ts#L331)

___

### appDistribution

▸ **appDistribution**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/app-distribution/lib/index.d.ts:161](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app-distribution/lib/index.d.ts#L161)

___

### auth

▸ **auth**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/auth/lib/index.d.ts:1973](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/auth/lib/index.d.ts#L1973)

___

### crashlytics

▸ **crashlytics**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/crashlytics/lib/index.d.ts:283](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/crashlytics/lib/index.d.ts#L283)

___

### database

▸ **database**(`databaseUrl?`): `Module`

#### Parameters

| Name | Type |
| :------ | :------ |
| `databaseUrl?` | `string` |

#### Returns

`Module`

#### Defined in

[packages/database/lib/index.d.ts:1315](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/database/lib/index.d.ts#L1315)

___

### delete

▸ **delete**(): `Promise`<`void`\>

Make this app unusable and free up resources.

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/app/lib/index.d.ts:155](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L155)

___

### dynamicLinks

▸ **dynamicLinks**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/dynamic-links/lib/index.d.ts:646](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/dynamic-links/lib/index.d.ts#L646)

___

### firestore

▸ **firestore**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/firestore/lib/index.d.ts:2361](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/firestore/lib/index.d.ts#L2361)

___

### functions

▸ **functions**(`customUrlOrRegion?`): `Module`

#### Parameters

| Name | Type |
| :------ | :------ |
| `customUrlOrRegion?` | `string` |

#### Returns

`Module`

#### Defined in

[packages/functions/lib/index.d.ts:440](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/functions/lib/index.d.ts#L440)

___

### inAppMessaging

▸ **inAppMessaging**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/in-app-messaging/lib/index.d.ts:179](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/in-app-messaging/lib/index.d.ts#L179)

___

### installations

▸ **installations**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/installations/lib/index.d.ts:161](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/installations/lib/index.d.ts#L161)

___

### messaging

▸ **messaging**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/messaging/lib/index.d.ts:1155](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/messaging/lib/index.d.ts#L1155)

___

### ml

▸ **ml**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/ml/lib/index.d.ts:88](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/ml/lib/index.d.ts#L88)

___

### perf

▸ **perf**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/perf/lib/index.d.ts:569](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/perf/lib/index.d.ts#L569)

___

### remoteConfig

▸ **remoteConfig**(): `Module`

#### Returns

`Module`

#### Defined in

[packages/remote-config/lib/index.d.ts:584](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/remote-config/lib/index.d.ts#L584)

___

### storage

▸ **storage**(`bucket?`): `Module`

#### Parameters

| Name | Type |
| :------ | :------ |
| `bucket?` | `string` |

#### Returns

`Module`

#### Defined in

[packages/storage/lib/index.d.ts:1171](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L1171)

___

### utils

▸ **utils**(): [`Module`](../classes/Utils.Module.md)

#### Returns

[`Module`](../classes/Utils.Module.md)

#### Defined in

[packages/app/lib/index.d.ts:157](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L157)
