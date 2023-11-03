[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [ReactNativeFirebase](../modules/ReactNativeFirebase.md) / FirebaseAppOptions

# Interface: FirebaseAppOptions

[ReactNativeFirebase](../modules/ReactNativeFirebase.md).FirebaseAppOptions

## Indexable

▪ [name: `string`]: `any`

## Table of contents

### Properties

- [androidClientId](ReactNativeFirebase.FirebaseAppOptions.md#androidclientid)
- [apiKey](ReactNativeFirebase.FirebaseAppOptions.md#apikey)
- [appId](ReactNativeFirebase.FirebaseAppOptions.md#appid)
- [clientId](ReactNativeFirebase.FirebaseAppOptions.md#clientid)
- [databaseURL](ReactNativeFirebase.FirebaseAppOptions.md#databaseurl)
- [deepLinkURLScheme](ReactNativeFirebase.FirebaseAppOptions.md#deeplinkurlscheme)
- [gaTrackingId](ReactNativeFirebase.FirebaseAppOptions.md#gatrackingid)
- [messagingSenderId](ReactNativeFirebase.FirebaseAppOptions.md#messagingsenderid)
- [projectId](ReactNativeFirebase.FirebaseAppOptions.md#projectid)
- [storageBucket](ReactNativeFirebase.FirebaseAppOptions.md#storagebucket)

## Properties

### androidClientId

• `Optional` **androidClientId**: `string`

iOS only - The Android client ID used in Google AppInvite when an iOS app has its Android version, for
example "12345.apps.googleusercontent.com".

#### Defined in

[packages/app/lib/index.d.ts:111](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L111)

___

### apiKey

• `Optional` **apiKey**: `string`

An API key used for authenticating requests from your app, e.g.
"AIzaSyDdVgKwhZl0sTTTLZ7iTmt1r3N2cJLnaDk", used to identify your app to Google servers.

#### Defined in

[packages/app/lib/index.d.ts:73](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L73)

___

### appId

• **appId**: `string`

The Google App ID that is used to uniquely identify an instance of an app.

#### Defined in

[packages/app/lib/index.d.ts:67](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L67)

___

### clientId

• `Optional` **clientId**: `string`

iOS only - The OAuth2 client ID for iOS application used to authenticate Google users, for example
"12345.apps.googleusercontent.com", used for signing in with Google.

#### Defined in

[packages/app/lib/index.d.ts:105](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L105)

___

### databaseURL

• `Optional` **databaseURL**: `string`

The database root URL, e.g. "http://abc-xyz-123.firebaseio.com".

#### Defined in

[packages/app/lib/index.d.ts:78](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L78)

___

### deepLinkURLScheme

• `Optional` **deepLinkURLScheme**: `string`

iOS only - The URL scheme used to set up Durable Deep Link service.

#### Defined in

[packages/app/lib/index.d.ts:116](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L116)

___

### gaTrackingId

• `Optional` **gaTrackingId**: `string`

The tracking ID for Google Analytics, e.g. "UA-12345678-1", used to configure Google Analytics.

#### Defined in

[packages/app/lib/index.d.ts:88](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L88)

___

### messagingSenderId

• `Optional` **messagingSenderId**: `string`

The Project Number from the Google Developer's console, for example "012345678901", used to
configure Google Cloud Messaging.

#### Defined in

[packages/app/lib/index.d.ts:99](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L99)

___

### projectId

• **projectId**: `string`

The Project ID from the Firebase console, for example "abc-xyz-123".

#### Defined in

[packages/app/lib/index.d.ts:83](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L83)

___

### storageBucket

• `Optional` **storageBucket**: `string`

The Google Cloud Storage bucket name, e.g. "abc-xyz-123.storage.firebase.com".

#### Defined in

[packages/app/lib/index.d.ts:93](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L93)
