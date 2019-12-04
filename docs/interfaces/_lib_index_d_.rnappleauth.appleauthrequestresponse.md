
# Interface: AppleAuthRequestResponse

A response from `performRequest(requestOptions)`.

## Hierarchy

* **AppleAuthRequestResponse**

## Index

### Properties

* [authorizationCode](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#authorizationcode)
* [authorizedScopes](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#authorizedscopes)
* [email](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#email)
* [fullName](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#fullname)
* [identityToken](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#identitytoken)
* [nonce](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#nonce)
* [realUserStatus](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#realuserstatus)
* [state](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#state)
* [user](_lib_index_d_.rnappleauth.appleauthrequestresponse.md#user)

## Properties

###  authorizationCode

• **authorizationCode**: *string | null*

*Defined in [lib/index.d.ts:349](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L349)*

A short-lived, one-time valid token that can provides proof of authorization to the server
component of your app.

The authorization code is bound to the specific transaction using the state attribute passed
in the authorization request. The server component of your app can validate the code using
the Apple identity service endpoint.

___

###  authorizedScopes

• **authorizedScopes**: *[AppleAuthRequestScope](../enums/_lib_index_d_.rnappleauth.appleauthrequestscope.md)[]*

*Defined in [lib/index.d.ts:314](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L314)*

This value will contain an array of scopes for which the user provided authorization.
Note that these may contain a subset of the requested scopes. You should query this value to
identify which scopes were returned as it may be different from ones you requested.

See @{RNAppleAuth.AppleAuthRealUserStatus}

___

###  email

• **email**: *string | null*

*Defined in [lib/index.d.ts:334](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L334)*

An optional email shared by the user.

This field is populated with a value that the user authorized.

___

###  fullName

• **fullName**: *null | [AppleAuthRequestResponseFullName](_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md)*

*Defined in [lib/index.d.ts:298](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L298)*

An optional full name shared by the user.

This field is populated with a value that the user authorized.

See @{RNAppleAuth.AppleAuthRequestResponseFullName}

___

###  identityToken

• **identityToken**: *string | null*

*Defined in [lib/index.d.ts:327](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L327)*

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

*Defined in [lib/index.d.ts:279](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L279)*

Nonce that was passed to the identity provider. If none was passed to the request, one will
have automatically been created and available to be read from this property.

___

###  realUserStatus

• **realUserStatus**: *[AppleAuthRealUserStatus](../enums/_lib_index_d_.rnappleauth.appleauthrealuserstatus.md)*

*Defined in [lib/index.d.ts:305](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L305)*

Check this property for a hint as to whether the current user is a "real user".

See @{RNAppleAuth.AppleAuthRealUserStatus}

___

###  state

• **state**: *string | null*

*Defined in [lib/index.d.ts:339](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L339)*

A copy of the state value that was passed to the initial request.

___

###  user

• **user**: *string*

*Defined in [lib/index.d.ts:289](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L289)*

An opaque user ID associated with the AppleID used for the sign in. This identifier will be
stable across the 'developer team', it can later be used as an input to

**`{rnappleauth.appleauthrequest}`** to request user contact information.

The identifier will remain stable as long as the user is connected with the requesting client.
The value may change upon user disconnecting from the identity provider.
