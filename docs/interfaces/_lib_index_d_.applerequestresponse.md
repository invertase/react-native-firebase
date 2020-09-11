
# Interface: AppleRequestResponse

A response from `performRequest(requestOptions)`.

## Hierarchy

* **AppleRequestResponse**

## Index

### Properties

* [authorizationCode](_lib_index_d_.applerequestresponse.md#authorizationcode)
* [authorizedScopes](_lib_index_d_.applerequestresponse.md#authorizedscopes)
* [email](_lib_index_d_.applerequestresponse.md#email)
* [fullName](_lib_index_d_.applerequestresponse.md#fullname)
* [identityToken](_lib_index_d_.applerequestresponse.md#identitytoken)
* [nonce](_lib_index_d_.applerequestresponse.md#nonce)
* [realUserStatus](_lib_index_d_.applerequestresponse.md#realuserstatus)
* [state](_lib_index_d_.applerequestresponse.md#state)
* [user](_lib_index_d_.applerequestresponse.md#user)

## Properties

###  authorizationCode

• **authorizationCode**: *string | null*

*Defined in [lib/index.d.ts:397](../../lib/index.d.ts#L397)*

A short-lived, one-time valid token that can provides proof of authorization to the server
component of your app.

The authorization code is bound to the specific transaction using the state attribute passed
in the authorization request. The server component of your app can validate the code using
the Apple identity service endpoint.

___

###  authorizedScopes

• **authorizedScopes**: *[AppleRequestScope](../enums/_lib_index_d_.applerequestscope.md)[]*

*Defined in [lib/index.d.ts:362](../../lib/index.d.ts#L362)*

This value will contain an array of scopes for which the user provided authorization.
Note that these may contain a subset of the requested scopes. You should query this value to
identify which scopes were returned as it may be different from ones you requested.

See @{AppleRealUserStatus}

___

###  email

• **email**: *string | null*

*Defined in [lib/index.d.ts:382](../../lib/index.d.ts#L382)*

An optional email shared by the user.

This field is populated with a value that the user authorized.

___

###  fullName

• **fullName**: *null | [AppleRequestResponseFullName](_lib_index_d_.applerequestresponsefullname.md)*

*Defined in [lib/index.d.ts:346](../../lib/index.d.ts#L346)*

An optional full name shared by the user.

This field is populated with a value that the user authorized.

See @{AppleRequestResponseFullName}

___

###  identityToken

• **identityToken**: *string | null*

*Defined in [lib/index.d.ts:375](../../lib/index.d.ts#L375)*

A JSON Web Token (JWT) used to communicate information about the identity of the user in a
secure way to the app.

The ID token contains the following information signed by Apple's identity service:
 - Issuer Identifier
 - Subject Identifier
 - Audience
 - Expiry Time
 - Issuance Time

___

###  nonce

• **nonce**: *string*

*Defined in [lib/index.d.ts:327](../../lib/index.d.ts#L327)*

Nonce that was passed to the identity provider. If none was passed to the request, one will
have automatically been created and available to be read from this property.

___

###  realUserStatus

• **realUserStatus**: *[AppleRealUserStatus](../enums/_lib_index_d_.applerealuserstatus.md)*

*Defined in [lib/index.d.ts:353](../../lib/index.d.ts#L353)*

Check this property for a hint as to whether the current user is a "real user".

See @{AppleRealUserStatus}

___

###  state

• **state**: *string | null*

*Defined in [lib/index.d.ts:387](../../lib/index.d.ts#L387)*

A copy of the state value that was passed to the initial request.

___

###  user

• **user**: *string*

*Defined in [lib/index.d.ts:337](../../lib/index.d.ts#L337)*

An opaque user ID associated with the AppleID used for the sign in. This identifier will be
stable across the 'developer team', it can later be used as an input to

**`{appleauthrequest}`** to request user contact information.

The identifier will remain stable as long as the user is connected with the requesting client.
The value may change upon user disconnecting from the identity provider.
