
# Interface: AndroidSigninResponse

## Hierarchy

* **AndroidSigninResponse**

## Index

### Properties

* [code](_lib_index_d_.androidsigninresponse.md#code)
* [id_token](_lib_index_d_.androidsigninresponse.md#optional-id_token)
* [state](_lib_index_d_.androidsigninresponse.md#state)
* [user](_lib_index_d_.androidsigninresponse.md#optional-user)

## Properties

###  code

• **code**: *string*

*Defined in [lib/index.d.ts:563](../../lib/index.d.ts#L563)*

A short-lived, one-time valid token that can provides proof of authorization to the server
component of your app.

The authorization code is bound to the specific transaction using the state attribute passed
in the authorization request. The server component of your app can validate the code using
the Apple identity service endpoint.

___

### `Optional` id_token

• **id_token**? : *undefined | string*

*Defined in [lib/index.d.ts:553](../../lib/index.d.ts#L553)*

A JSON Web Token (JWT) used to communicate information about the identity of the user in a
secure way to the app.

The ID token contains the following information signed by Apple's identity service:
 - Issuer Identifier
 - Subject Identifier
 - Audience
 - Expiry Time
 - Issuance Time

___

###  state

• **state**: *string*

*Defined in [lib/index.d.ts:540](../../lib/index.d.ts#L540)*

A copy of the state value that was passed to the initial request.

___

### `Optional` user

• **user**? : *undefined | object*

*Defined in [lib/index.d.ts:532](../../lib/index.d.ts#L532)*

User object describing the authorized user. This value may be omitted by Apple.
