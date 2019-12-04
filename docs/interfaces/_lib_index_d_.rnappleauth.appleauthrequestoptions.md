
# Interface: AppleAuthRequestOptions

Apple Authentication Request options to be used with `performRequest(requestOptions)`.

## Hierarchy

* **AppleAuthRequestOptions**

## Index

### Properties

* [nonce](_lib_index_d_.rnappleauth.appleauthrequestoptions.md#optional-nonce)
* [requestedOperation](_lib_index_d_.rnappleauth.appleauthrequestoptions.md#optional-requestedoperation)
* [requestedScopes](_lib_index_d_.rnappleauth.appleauthrequestoptions.md#optional-requestedscopes)
* [state](_lib_index_d_.rnappleauth.appleauthrequestoptions.md#optional-state)
* [user](_lib_index_d_.rnappleauth.appleauthrequestoptions.md#optional-user)

## Properties

### `Optional` nonce

• **nonce**? : *undefined | string*

*Defined in [lib/index.d.ts:224](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L224)*

Nonce to be passed to the identity provider. If value not provided, one will automatically
be created for you and available as part of @{RNAppleAuth.AppleAuthRequestResponse}.

This value can be verified with the identity token provided as a part of successful
ASAuthorization response.

The nonce size may depend on the actual technology used and an error might be returned by
the request execution.

___

### `Optional` requestedOperation

• **requestedOperation**? : *[AppleAuthRequestOperation](../enums/_lib_index_d_.rnappleauth.appleauthrequestoperation.md)*

*Defined in [lib/index.d.ts:204](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L204)*

Operation which should be executed.

**`url`** https://developer.apple.com/documentation/authenticationservices/asauthorizationoperationimplicit?language=objc

___

### `Optional` requestedScopes

• **requestedScopes**? : *[AppleAuthRequestScope](../enums/_lib_index_d_.rnappleauth.appleauthrequestscope.md)[]*

*Defined in [lib/index.d.ts:197](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L197)*

The contact information to be requested from the user.

Only scopes for which this app was authorized for will be returned.

___

### `Optional` state

• **state**? : *undefined | string*

*Defined in [lib/index.d.ts:231](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L231)*

State to be passed to the identity provider.

This value will be returned as a part of successful AppleAuthRequestResponse response.

___

### `Optional` user

• **user**? : *undefined | string*

*Defined in [lib/index.d.ts:212](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L212)*

If you have been previously vended a 'user' value through a Apple Authorization response,
you may set it here to provide additional context to the identity provider.

Inherited from `ASAuthorizationAppleIDRequest`
