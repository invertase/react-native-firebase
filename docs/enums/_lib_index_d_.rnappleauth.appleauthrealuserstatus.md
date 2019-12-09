# Enumeration: AppleAuthRealUserStatus

Possible values for the real user indicator.

**`url`** https://developer.apple.com/documentation/authenticationservices/asuserdetectionstatus

## What is it?

This is an exported member, `AppleAuthRealUserStatus` from the `react-native-apple-authentication` library. This is used to
check the likelihood that a `appleAuth.performRequest(requestObject)` was made by the actual user.

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

  const { realUserStatus } = await appleAuth.performRequest(requestOptions);

  if (realUserStatus === AppleAuthRealUserStatus.LIKELY_REAL) {
    console.log("I'm probably a real person!");
  }

  if (realUserStatus === AppleAuthRealUserStatus.UNKNOWN) {

  }

  if (realUserStatus === AppleAuthRealUserStatus.UNSUPPORTED) {

  }
}
```

## Index

### Enumeration members

- [LIKELY_REAL](_lib_index_d_.rnappleauth.appleauthrealuserstatus.md#likely_real)
- [UNKNOWN](_lib_index_d_.rnappleauth.appleauthrealuserstatus.md#unknown)
- [UNSUPPORTED](_lib_index_d_.rnappleauth.appleauthrealuserstatus.md#unsupported)

## Enumeration members

### LIKELY_REAL

• **LIKELY_REAL**:

_Defined in [lib/index.d.ts:165](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L165)_

A hint that there's high confidence that the user is real.

---

### UNKNOWN

• **UNKNOWN**:

_Defined in [lib/index.d.ts:160](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L160)_

Could not determine the value.

New users in the ecosystem will get this value as well, so you should not blacklist but
instead treat these users as any new user through standard email sign up flows

---

### UNSUPPORTED

• **UNSUPPORTED**:

_Defined in [lib/index.d.ts:152](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L152)_

Not supported on current platform, ignore the value.
