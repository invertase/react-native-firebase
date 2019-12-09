
# Enumeration: AppleAuthCredentialState

The current Apple Authorization state.

## What is it?

This is an exported module, `AppleAuthCredentialState` from the `react-native-apple-authentication` library. This is used to
check the user's current authorization state after a `appleAuth.getCredentialStateForUser(user)` has been made.

```js
import appleAuth, { AppleAuthRequestOperation, AppleAuthRequestScope } from '@invertase/react-native-apple-authentication';

function onPressAppleButton(){

  const requestOptions = {
      requestedOperation: AppleAuthRequestOperation.LOGIN,
      requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  };
  const { user } = await appleAuth.performRequest(requestOptions);

  const credentialState = await appleAuth.getCredentialStateForUser(responseObject.user);

  if(credentialState === AppleAuthCredentialState.AUTHORIZED){
    //user is authorized
  }

  if(credentialState === AppleAuthCredentialState.NOT_FOUND){

  }

  if(credentialState === AppleAuthCredentialState.REVOKED){

  }

  if(credentialState === AppleAuthCredentialState.AUTHTRANSFERREDORIZED){

  }
}
```

## Index

### Enumeration members

* [AUTHORIZED](_lib_index_d_.rnappleauth.appleauthcredentialstate.md#authorized)
* [NOT_FOUND](_lib_index_d_.rnappleauth.appleauthcredentialstate.md#not_found)
* [REVOKED](_lib_index_d_.rnappleauth.appleauthcredentialstate.md#revoked)
* [TRANSFERRED](_lib_index_d_.rnappleauth.appleauthcredentialstate.md#transferred)

## Enumeration members

###  AUTHORIZED

• **AUTHORIZED**:

*Defined in [lib/index.d.ts:83](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L83)*

The Opaque user ID is in good state.

___

###  NOT_FOUND

• **NOT_FOUND**:

*Defined in [lib/index.d.ts:88](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L88)*

The Opaque user ID was not found.

___

###  REVOKED

• **REVOKED**:

*Defined in [lib/index.d.ts:78](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L78)*

The Opaque user ID was revoked by the user.

___

###  TRANSFERRED

• **TRANSFERRED**:

*Defined in [lib/index.d.ts:95](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L95)*

N/A

**`url`** https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidprovidercredentialstate/asauthorizationappleidprovidercredentialtransferred?language=objc
