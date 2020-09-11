
# Interface: AppleRequestOptions

Apple Authentication Request options to be used with `performRequest(requestOptions)`.

## Hierarchy

* **AppleRequestOptions**

## Index

### Properties

* [nonce](_lib_index_d_.applerequestoptions.md#optional-nonce)
* [nonceEnabled](_lib_index_d_.applerequestoptions.md#optional-nonceenabled)
* [requestedOperation](_lib_index_d_.applerequestoptions.md#optional-requestedoperation)
* [requestedScopes](_lib_index_d_.applerequestoptions.md#optional-requestedscopes)
* [state](_lib_index_d_.applerequestoptions.md#optional-state)
* [user](_lib_index_d_.applerequestoptions.md#optional-user)

## Properties

### `Optional` nonce

• **nonce**? : *undefined | string*

*Defined in [lib/index.d.ts:263](../../lib/index.d.ts#L263)*

Nonce to be passed to the identity provider. If value not provided, one will automatically
be created for you and available as part of @{AppleRequestResponse}.

This value can be verified with the identity token provided as a part of successful
ASAuthorization response.

The nonce size may depend on the actual technology used and an error might be returned by
the request execution.

___

### `Optional` nonceEnabled

• **nonceEnabled**? : *undefined | false | true*

*Defined in [lib/index.d.ts:272](../../lib/index.d.ts#L272)*

Disable automatic nonce behaviour by setting this to false.

Useful for authentication providers that don't yet support nonces.

Defaults to true.

___

### `Optional` requestedOperation

• **requestedOperation**? : *[AppleRequestOperation](../enums/_lib_index_d_.applerequestoperation.md)*

*Defined in [lib/index.d.ts:243](../../lib/index.d.ts#L243)*

Operation which should be executed.

**`url`** https://developer.apple.com/documentation/authenticationservices/asauthorizationoperationimplicit?language=objc

___

### `Optional` requestedScopes

• **requestedScopes**? : *[AppleRequestScope](../enums/_lib_index_d_.applerequestscope.md)[]*

*Defined in [lib/index.d.ts:236](../../lib/index.d.ts#L236)*

The contact information to be requested from the user.

Only scopes for which this app was authorized for will be returned.

___

### `Optional` state

• **state**? : *undefined | string*

*Defined in [lib/index.d.ts:279](../../lib/index.d.ts#L279)*

State to be passed to the identity provider.

This value will be returned as a part of successful AppleRequestResponse response.

___

### `Optional` user

• **user**? : *undefined | string*

*Defined in [lib/index.d.ts:251](../../lib/index.d.ts#L251)*

If you have been previously vended a 'user' value through a Apple Authorization response,
you may set it here to provide additional context to the identity provider.

Inherited from `ASAuthorizationAppleIDRequest`
