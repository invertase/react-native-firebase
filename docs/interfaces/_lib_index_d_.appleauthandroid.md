
# Interface: AppleAuthAndroid

## Hierarchy

* **AppleAuthAndroid**

## Index

### Properties

* [Error](_lib_index_d_.appleauthandroid.md#error)
* [ResponseType](_lib_index_d_.appleauthandroid.md#responsetype)
* [Scope](_lib_index_d_.appleauthandroid.md#scope)

### Methods

* [configure](_lib_index_d_.appleauthandroid.md#configure)
* [signIn](_lib_index_d_.appleauthandroid.md#signin)

## Properties

###  isSupported

• **isSupported**: *boolean*

*Defined in [lib/index.d.ts:572](../../lib/index.d.ts#L572)*

A boolean value of whether Apple Authentication is supported on this API version.
The Apple authentication process requires API 19+ to work correctly.

___

###  Error

• **Error**: *[AndroidError](../modules/_lib_index_d_.md#androiderror)*

*Defined in [lib/index.d.ts:586](../../lib/index.d.ts#L586)*

___

###  ResponseType

• **ResponseType**: *typeof AndroidResponseType*

*Defined in [lib/index.d.ts:597](../../lib/index.d.ts#L597)*

The type of response requested. Valid values are `code` and `id_token`. You can request one or both.

___

###  Scope

• **Scope**: *typeof AndroidScope*

*Defined in [lib/index.d.ts:592](../../lib/index.d.ts#L592)*

The amount of user information requested from Apple. Valid values are `name` and `email`.
You can request one, both, or none.

## Methods

###  configure

▸ **configure**(`configObject`: [AndroidConfig](_lib_index_d_.androidconfig.md)): *void*

*Defined in [lib/index.d.ts:579](../../lib/index.d.ts#L579)*

Prepare the module for sign in. This *must* be called before `appleAuthAndroid.signIn()`;

**`see`** https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms#3332113

**Parameters:**

Name | Type |
------ | ------ |
`configObject` | [AndroidConfig](_lib_index_d_.androidconfig.md) |

**Returns:** *void*

___

###  signIn

▸ **signIn**(): *Promise‹[AndroidSigninResponse](_lib_index_d_.androidsigninresponse.md)›*

*Defined in [lib/index.d.ts:584](../../lib/index.d.ts#L584)*

Open browser window to begin user sign in. *Must* call `appleAuthAndroid.configure(options)` first.

**Returns:** *Promise‹[AndroidSigninResponse](_lib_index_d_.androidsigninresponse.md)›*
