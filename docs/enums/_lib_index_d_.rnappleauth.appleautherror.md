# Enumeration: AppleAuthError

Errors that can occur during authorization.

**`url`** https://developer.apple.com/documentation/authenticationservices/asauthorizationerror/code

## What is it?

This is an exported member, `AppleAuthError` from the `react-native-apple-authentication` library. This is used to
check the error code after a `appleAuth.getCredentialStateForUser(user)` request has been made.

```js
import appleAuth, {
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthCredentialState,
  AppleAuthError,
} from '@invertase/react-native-apple-authentication';

async function onPressAppleButton() {
  const requestOptions = {
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  };

  const { user } = await appleAuth.performRequest(requestOptions);

  try {
    const credentialState = await appleAuth.getCredentialStateForUser(user);
    if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
      // authorized
    }
  } catch (error) {
    if (error.code === AppleAuthError.CANCELED) {
    }
    if (error.code === AppleAuthError.FAILED) {
    }
    if (error.code === AppleAuthError.INVALID_RESPONSE) {
    }
    if (error.code === AppleAuthError.NOT_HANDLED) {
    }
    if (error.code === AppleAuthError.UNKNOWN) {
    }
  }
}
```

## Index

### Enumeration members

- [CANCELED](_lib_index_d_.rnappleauth.appleautherror.md#canceled)
- [FAILED](_lib_index_d_.rnappleauth.appleautherror.md#failed)
- [INVALID_RESPONSE](_lib_index_d_.rnappleauth.appleautherror.md#invalid_response)
- [NOT_HANDLED](_lib_index_d_.rnappleauth.appleautherror.md#not_handled)
- [UNKNOWN](_lib_index_d_.rnappleauth.appleautherror.md#unknown)

## Enumeration members

### CANCELED

• **CANCELED**: = "1001"

_Defined in [lib/index.d.ts:406](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L406)_

The user canceled the authorization attempt.

---

### FAILED

• **FAILED**: = "1004"

_Defined in [lib/index.d.ts:421](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L421)_

The authorization attempt failed.

---

### INVALID_RESPONSE

• **INVALID_RESPONSE**: = "1002"

_Defined in [lib/index.d.ts:411](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L411)_

The authorization request received an invalid response.

---

### NOT_HANDLED

• **NOT_HANDLED**: = "1003"

_Defined in [lib/index.d.ts:416](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L416)_

The authorization request wasn't handled.

---

### UNKNOWN

• **UNKNOWN**: = "1000"

_Defined in [lib/index.d.ts:401](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L401)_

The authorization attempt failed for an unknown reason.
