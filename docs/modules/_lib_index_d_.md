
# Module: "lib/index.d"

## Index

### Enumerations

* [AndroidResponseType](../enums/_lib_index_d_.androidresponsetype.md)
* [AndroidScope](../enums/_lib_index_d_.androidscope.md)
* [AppleButtonStyle](../enums/_lib_index_d_.applebuttonstyle.md)
* [AppleButtonType](../enums/_lib_index_d_.applebuttontype.md)
* [AppleCredentialState](../enums/_lib_index_d_.applecredentialstate.md)
* [AppleError](../enums/_lib_index_d_.appleerror.md)
* [AppleRealUserStatus](../enums/_lib_index_d_.applerealuserstatus.md)
* [AppleRequestOperation](../enums/_lib_index_d_.applerequestoperation.md)
* [AppleRequestScope](../enums/_lib_index_d_.applerequestscope.md)

### Interfaces

* [AndroidConfig](../interfaces/_lib_index_d_.androidconfig.md)
* [AndroidSigninResponse](../interfaces/_lib_index_d_.androidsigninresponse.md)
* [AppleAuthAndroid](../interfaces/_lib_index_d_.appleauthandroid.md)
* [AppleButtonProps](../interfaces/_lib_index_d_.applebuttonprops.md)
* [AppleRequestOptions](../interfaces/_lib_index_d_.applerequestoptions.md)
* [AppleRequestResponse](../interfaces/_lib_index_d_.applerequestresponse.md)
* [AppleRequestResponseFullName](../interfaces/_lib_index_d_.applerequestresponsefullname.md)

### Type aliases

* [AndroidError](_lib_index_d_.md#androiderror)

### Variables

* [AppleButton](_lib_index_d_.md#const-applebutton)
* [appleAuth](_lib_index_d_.md#const-appleauth)
* [appleAuthAndroid](_lib_index_d_.md#const-appleauthandroid)

## Type aliases

###  AndroidError

Ƭ **AndroidError**: *object*

*Defined in [lib/index.d.ts:479](../../lib/index.d.ts#L479)*

Android

#### Type declaration:

* **NOT_CONFIGURED**: *string*

* **SIGNIN_CANCELLED**: *string*

* **SIGNIN_FAILED**: *string*

## Variables

### `Const` AppleButton

• **AppleButton**: *object & React.FC‹[AppleButtonProps](../interfaces/_lib_index_d_.applebuttonprops.md)›*

*Defined in [lib/index.d.ts:113](../../lib/index.d.ts#L113)*

___

### `Const` appleAuth

• **appleAuth**: *object*

*Defined in [lib/index.d.ts:401](../../lib/index.d.ts#L401)*

#### Type declaration:

* **Error**: *typeof AppleError*

* **Operation**: *typeof AppleRequestOperation*

* **Scope**: *typeof AppleRequestScope*

* **State**: *typeof AppleCredentialState*

* **UserStatus**: *typeof AppleRealUserStatus*

* **isSignUpButtonSupported**: *boolean*

* **isSupported**: *boolean*

* **getCredentialStateForUser**(`user`: string): *Promise‹[AppleCredentialState](../enums/_lib_index_d_.applecredentialstate.md)›*

* **onCredentialRevoked**(`listener`: Function): *function*

  * (): *void | undefined*

* **performRequest**(`options?`: [AppleRequestOptions](../interfaces/_lib_index_d_.applerequestoptions.md)): *Promise‹[AppleRequestResponse](../interfaces/_lib_index_d_.applerequestresponse.md)›*

___

### `Const` appleAuthAndroid

• **appleAuthAndroid**: *[AppleAuthAndroid](../interfaces/_lib_index_d_.appleauthandroid.md)*

*Defined in [lib/index.d.ts:592](../../lib/index.d.ts#L592)*
