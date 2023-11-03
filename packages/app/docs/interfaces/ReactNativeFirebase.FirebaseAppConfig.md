[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [ReactNativeFirebase](../modules/ReactNativeFirebase.md) / FirebaseAppConfig

# Interface: FirebaseAppConfig

[ReactNativeFirebase](../modules/ReactNativeFirebase.md).FirebaseAppConfig

## Table of contents

### Properties

- [automaticDataCollectionEnabled](ReactNativeFirebase.FirebaseAppConfig.md#automaticdatacollectionenabled)
- [automaticResourceManagement](ReactNativeFirebase.FirebaseAppConfig.md#automaticresourcemanagement)
- [name](ReactNativeFirebase.FirebaseAppConfig.md#name)

## Properties

### automaticDataCollectionEnabled

• `Optional` **automaticDataCollectionEnabled**: `boolean`

Default setting for data collection on startup that affects all Firebase module startup data collection settings,
in the absence of module-specific overrides. This will start as false if you set "app_data_collection_default_enabled"
to false in firebase.json and may be used in opt-in flows, for example a GDPR-compliant app.
If configured false initially, set to true after obtaining consent, then enable module-specific settings as needed afterwards.

#### Defined in

[packages/app/lib/index.d.ts:132](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L132)

___

### automaticResourceManagement

• `Optional` **automaticResourceManagement**: `boolean`

If set to true it indicates that Firebase should close database connections
automatically when the app is in the background. Disabled by default.

#### Defined in

[packages/app/lib/index.d.ts:138](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L138)

___

### name

• `Optional` **name**: `string`

The Firebase App name, defaults to [DEFAULT] if none provided.

#### Defined in

[packages/app/lib/index.d.ts:124](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L124)
