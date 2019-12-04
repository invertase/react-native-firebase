
# Interface: Module

## Hierarchy

* **Module**

## Index

### Properties

* [isSignUpButtonSupported](_lib_index_d_.rnappleauth.module.md#issignupbuttonsupported)
* [isSupported](_lib_index_d_.rnappleauth.module.md#issupported)

### Methods

* [getCredentialStateForUser](_lib_index_d_.rnappleauth.module.md#getcredentialstateforuser)
* [onCredentialRevoked](_lib_index_d_.rnappleauth.module.md#oncredentialrevoked)
* [performRequest](_lib_index_d_.rnappleauth.module.md#performrequest)

## Properties

###  isSignUpButtonSupported

• **isSignUpButtonSupported**: *boolean*

*Defined in [lib/index.d.ts:368](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L368)*

A boolean value of whether the 'SignUp' Type variant of the Apple Authentication Button is
supported.

This will always return false for Android, and false for iOS devices running iOS
versions less than 13.2

___

###  isSupported

• **isSupported**: *boolean*

*Defined in [lib/index.d.ts:359](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L359)*

A boolean value of whether Apple Authentication is supported on this device & platform version.

This will always return false for Android, and false for iOS devices running iOS
versions less than 13.

## Methods

###  getCredentialStateForUser

▸ **getCredentialStateForUser**(`user`: string): *Promise‹[AppleAuthCredentialState](../enums/_lib_index_d_.rnappleauth.appleauthcredentialstate.md)›*

*Defined in [lib/index.d.ts:381](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L381)*

Get the current @{RNAppleAuth.AppleAuthCredentialState} for the provided user identifier.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`user` | string | An opaque user ID associated with the AppleID used for the sign in.  |

**Returns:** *Promise‹[AppleAuthCredentialState](../enums/_lib_index_d_.rnappleauth.appleauthcredentialstate.md)›*

___

###  onCredentialRevoked

▸ **onCredentialRevoked**(`listener`: Function): *Function*

*Defined in [lib/index.d.ts:389](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L389)*

Subscribe to credential revoked events. Call `getCredentialStateForUser` on event received
to confirm the current credential state for your user identifier.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`listener` | Function | Returns a function that when called will unsubscribe from future events.  |

**Returns:** *Function*

___

###  performRequest

▸ **performRequest**(`options`: [AppleAuthRequestOptions](_lib_index_d_.rnappleauth.appleauthrequestoptions.md)): *Promise‹[AppleAuthRequestResponse](_lib_index_d_.rnappleauth.appleauthrequestresponse.md)›*

*Defined in [lib/index.d.ts:374](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L374)*

Perform a request to Apple Authentication services with the provided request options.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`options` | [AppleAuthRequestOptions](_lib_index_d_.rnappleauth.appleauthrequestoptions.md) | AppleAuthRequestOptions  |

**Returns:** *Promise‹[AppleAuthRequestResponse](_lib_index_d_.rnappleauth.appleauthrequestresponse.md)›*
