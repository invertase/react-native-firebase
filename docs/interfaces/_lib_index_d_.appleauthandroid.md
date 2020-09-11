
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

###  Error

• **Error**: *[AndroidError](../modules/_lib_index_d_.md#androiderror)*

*Defined in [lib/index.d.ts:579](../../lib/index.d.ts#L579)*

___

###  ResponseType

• **ResponseType**: *typeof AndroidResponseType*

*Defined in [lib/index.d.ts:590](../../lib/index.d.ts#L590)*

The type of response requested. Valid values are `code` and `id_token`. You can request one or both.

___

###  Scope

• **Scope**: *typeof AndroidScope*

*Defined in [lib/index.d.ts:585](../../lib/index.d.ts#L585)*

The amount of user information requested from Apple. Valid values are `name` and `email`.
You can request one, both, or none.

## Methods

###  configure

▸ **configure**(`configObject`: [AndroidConfig](_lib_index_d_.androidconfig.md)): *void*

*Defined in [lib/index.d.ts:572](../../lib/index.d.ts#L572)*

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

*Defined in [lib/index.d.ts:577](../../lib/index.d.ts#L577)*

Open browser window to begin user sign in. *Must* call `appleAuthAndroid.configure(options)` first.

**Returns:** *Promise‹[AndroidSigninResponse](_lib_index_d_.androidsigninresponse.md)›*
