# Enumeration: AppleAuthRequestScope

A property on the `requestOptions` to indicate the contact information to be requested from the user. Only scopes for which this app was
authorized for will be returned.

## What is it?

This is an exported member, `AppleAuthRequestScope` from the `react-native-apple-authentication` library. It is used to populate the `requestedScopes` property on the `requestOptions` passed to this method `appleAuth.performRequest(requestOptions)`.

```js
import appleAuth, {
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';

async function onPressAppleButton() {
  const requestOptions = {
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  };

  const responseObject = await appleAuth.performRequest(requestOptions);
}
```

## Index

### Enumeration members

- [EMAIL](_lib_index_d_.rnappleauth.appleauthrequestscope.md#email)
- [FULL_NAME](_lib_index_d_.rnappleauth.appleauthrequestscope.md#full_name)

## Enumeration members

### EMAIL

• **EMAIL**:

_Defined in [lib/index.d.ts:135](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L135)_

A scope that includes the user’s email address.

---

### FULL_NAME

• **FULL_NAME**:

_Defined in [lib/index.d.ts:140](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L140)_

A scope that includes the user’s full name.
