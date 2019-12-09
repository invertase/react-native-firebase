# Enumeration: AppleAuthRequestOperation

A property on the `requestOptions` to indicate the type of request operation.

## What is it?

This is an exported member, `AppleAuthRequestOperation` from the `react-native-apple-authentication` library. It is used to populate the `requestedOperation` property on the `requestOptions` passed to this method `appleAuth.performRequest(requestOptions)`.

```js
import appleAuth, {
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthRealUserStatus,
} from '@invertase/react-native-apple-authentication';

async function onPressAppleButton() {
  const requestOptions = {
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  };
  const responseObject = await appleAuth.performRequest(requestOptions);
}

async function logout() {
  const requestOptions = {
    requestedOperation: AppleAuthRequestOperation.LOGOUT,
  };
  const responseObject = await appleAuth.performRequest(requestOptions);
}

async function refreshUserCredentials() {
  const requestOptions = {
    requestedOperation: AppleAuthRequestOperation.REFRESH,
  };
  const responseObject = await appleAuth.performRequest(requestOptions);
}
```

## Index

### Enumeration members

- [IMPLICIT](_lib_index_d_.rnappleauth.appleauthrequestoperation.md#implicit)
- [LOGIN](_lib_index_d_.rnappleauth.appleauthrequestoperation.md#login)
- [LOGOUT](_lib_index_d_.rnappleauth.appleauthrequestoperation.md#logout)
- [REFRESH](_lib_index_d_.rnappleauth.appleauthrequestoperation.md#refresh)

## Enumeration members

### IMPLICIT

• **IMPLICIT**:

_Defined in [lib/index.d.ts:107](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L107)_

An operation that depends on the particular kind of credential provider.

---

### LOGIN

• **LOGIN**:

_Defined in [lib/index.d.ts:112](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L112)_

An operation used to authenticate a user.

---

### LOGOUT

• **LOGOUT**:

_Defined in [lib/index.d.ts:122](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L122)_

An operation that ends an authenticated session.

---

### REFRESH

• **REFRESH**:

_Defined in [lib/index.d.ts:117](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L117)_

An operation that refreshes the logged-in user’s credentials.
