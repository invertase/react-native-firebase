# Interface: appleAuth Module

This is the default module provided by `react-native-apple-authentication`.

## What is it?

This module contains the methods you will use to perform sign in requests, and to revoke authorization access.

```js
import React from 'react';
import { View, Button } from 'react-native';
import appleAuth, {
  AppleButton,
  AppleAuthCredentialState,
} from '@invertase/react-native-apple-authentication';

async function onAppleButtonPress() {
  // sign in request
  const responseObject = await appleAuth.performRequest({
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  });

  //authorization state request
  const credentialState = await appleAuth.getCredentialStateForUser(responseObject.user);

  if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
    //user is authorized
  }
}

async function onLogoutPress() {
  //logout request
  const responseObject = await appleAuth.performRequest({
    requestedOperation: AppleAuthRequestOperation.LOGOUT,
  });
}

function App() {
  return (
    <View>
      <AppleButton
        cornerRadius={5}
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        onPress={() => onAppleButtonPress()}
      />
      <Button onPress={() => onLogoutPress()}>Log me out</Button>
    </View>
  );
}
```

## Index

### Properties

- [isSignUpButtonSupported](_lib_index_d_.rnappleauth.module.md#issignupbuttonsupported)
- [isSupported](_lib_index_d_.rnappleauth.module.md#issupported)

### Methods

- [getCredentialStateForUser](_lib_index_d_.rnappleauth.module.md#getcredentialstateforuser)
- [onCredentialRevoked](_lib_index_d_.rnappleauth.module.md#oncredentialrevoked)
- [performRequest](_lib_index_d_.rnappleauth.module.md#performrequest)

## Properties

### isSignUpButtonSupported

• **isSignUpButtonSupported**: _boolean_

_Defined in [lib/index.d.ts:368](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L368)_

A boolean value of whether the 'SignUp' Type variant of the Apple Authentication Button is
supported.

This will always return false for Android, and false for iOS devices running iOS
versions less than 13.2

---

### isSupported

• **isSupported**: _boolean_

_Defined in [lib/index.d.ts:359](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L359)_

A boolean value of whether Apple Authentication is supported on this device & platform version.

This will always return false for Android, and false for iOS devices running iOS
versions less than 13.

## Methods

### getCredentialStateForUser

▸ **getCredentialStateForUser**(`user`: string): _Promise‹[AppleAuthCredentialState](../enums/\_lib_index_d_.rnappleauth.appleauthcredentialstate.md)›\_

_Defined in [lib/index.d.ts:381](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L381)_

Get the current @{RNAppleAuth.AppleAuthCredentialState} for the provided user identifier.

**Parameters:**

| Name   | Type   | Description                                                         |
| ------ | ------ | ------------------------------------------------------------------- |
| `user` | string | An opaque user ID associated with the AppleID used for the sign in. |

**Returns:** _Promise‹[AppleAuthCredentialState](../enums/\_lib_index_d_.rnappleauth.appleauthcredentialstate.md)›\_

---

### onCredentialRevoked

▸ **onCredentialRevoked**(`listener`: Function): _Function_

_Defined in [lib/index.d.ts:389](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L389)_

Subscribe to credential revoked events. Call `getCredentialStateForUser` on event received
to confirm the current credential state for your user identifier.

**Parameters:**

| Name       | Type     | Description                                                              |
| ---------- | -------- | ------------------------------------------------------------------------ |
| `listener` | Function | Returns a function that when called will unsubscribe from future events. |

**Returns:** _Function_

---

### performRequest

▸ **performRequest**(`options`: [AppleAuthRequestOptions](_lib_index_d_.rnappleauth.appleauthrequestoptions.md)): _Promise‹[AppleAuthRequestResponse](\_lib_index_d_.rnappleauth.appleauthrequestresponse.md)›\_

_Defined in [lib/index.d.ts:374](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L374)_

Perform a request to Apple Authentication services with the provided request options.

**Parameters:**

| Name      | Type                                                                            | Description             |
| --------- | ------------------------------------------------------------------------------- | ----------------------- |
| `options` | [AppleAuthRequestOptions](_lib_index_d_.rnappleauth.appleauthrequestoptions.md) | AppleAuthRequestOptions |

**Returns:** _Promise‹[AppleAuthRequestResponse](\_lib_index_d_.rnappleauth.appleauthrequestresponse.md)›\_
