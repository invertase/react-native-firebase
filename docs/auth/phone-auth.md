---
title: Phone Auth
description: React Native Firebase provides integration with Firebase Phone Authentication.
---

# Phone Auth

Phone authentication allows users to sign in to Firebase using their phone as the authenticator. An SMS message is sent
to the user via their phone number containing a unique code. Once the code has been authorized, the user is able to
sign in to Firebase.

> Firebase Phone Auth is not supported in all countries. Please see their [FAQs](https://firebase.google.com/support/faq/#develop) for more information.

React Native Firebase provides two separate integration flows:

- **`signInWithPhoneNumber`**: The recommended flow, provides a straightforward API for authenticating.
- **`verifyPhoneNumber`**: A custom flow, gives full control to the developer to implement. Suitable for custom
  authentication flows.

## signInWithPhoneNumber

The `signInWithPhoneNumber` method handles the entire authentication flow, however provides less flexibility over
error handling. Some Android devices may also automatically handle the incoming SMS code and authenticate the user
automatically.

**Step 1**: Trigger phone auth

Whitelist testing, make sure you have [whitelisted your device](https://firebase.google.com/docs/auth/ios/phone-auth#test-with-whitelisted-phone-numbers).

```js
import auth from '@react-native-firebase/auth';

const { confirm } = await auth().signInWithPhoneNumber('+1 650-555-3434');
```

**Step 2**: Confirm code

Once the message has been received, the user will need to input it manually within your login flow.

```js
try {
  await confirm('12345'); // User entered code
  // Successful login - onAuthStateChanged is triggered
} catch (e) {
  console.error(e); // Invalid code
}
```

**Step 3**: Android automatic verification

Some Android devices may automatically verify codes received via SMS. If this happens, the `onAuthStateChanged` method
is triggered, meaning no manual code verification is required.

```js
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // Stop the login flow / Navigate to next page
  }
});
```

## verifyPhoneNumber

_TODO_ @ehesp @salakar
