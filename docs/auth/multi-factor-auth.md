---
title: Multi-factor Auth
description: Increase security by adding Multi-factor authentication to your app.
next: /firestore/usage
previous: /auth/phone-auth
---

# iOS Setup

Make sure to follow [the official Identity Platform
documentation](https://cloud.google.com/identity-platform/docs/ios/mfa#enabling_multi-factor_authentication)
to enable multi-factor authentication for your project and verify your app.

# Sign-in flow using multi-factor

Ensure the account has already enrolled a second factor. Begin by calling the
default sign-in methods, for example email and password. If the account requires
a second factor to complete login, an exception will be raised:

```js
import auth from '@react-native-firebase/auth';

auth()
  .signInWithEmailAndPassword(email, password)
  .then(() => {
    // User has not enrolled a second factor
  })
  .catch(error => {
    const { code } = error;
    // Make sure to check if multi factor authentication is required
    if (code === 'auth/multi-factor-auth-required') {
      return;
    }

    // Other error
  });
```

Using the error object you can obtain a
[`MultiFactorResolver`](/reference/auth/multifactorresolver) instance and
continue the flow:

```js
const resolver = auth.getMultiFactorResolver(auth(), error);
```

The resolver object has all the required information to prompt the user for a
specific factor:

```js
if (resolver.hints.length > 1) {
  // Use resolver.hints to display a list of second factors to the user
}

// Currently only phone based factors are supported
if (resolver.hints[0].factorId === auth.PhoneMultiFactorGenerator.FACTOR_ID) {
  // Continue with the sign-in flow
}
```

Using a multi-factor hint and the session information you can send a
verification code to the user:

```js
const hint = resolver.hints[0];
const sessionId = resolver.session;

auth()
  .verifyPhoneNumberWithMultiFactorInfo(hint, sessionId) // triggers the message to the user
  .then(verificationId => setVerificationId(verificationId));
```

Once the user has entered the verification code you can create a multi-factor
assertion and finish the flow:

```js
const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);

const multiFactorAssertion = auth.PhoneMultiFactorGenerator.assertion(credential);

resolver.resolveSignIn(multiFactorAssertion).then(userCredential => {
  // additionally onAuthStateChanged will be triggered as well
});
```

Upon successful sign-in, any
[`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners
will trigger with the new authentication state of the user.

To put the example together:

```js
import auth from '@react-native-firebase/auth';

const authInstance = auth();

authInstance
  .signInWithEmailAndPassword(email, password)
  .then(() => {
    // User has not enrolled a second factor
  })
  .catch(error => {
    const { code } = error;
    // Make sure to check if multi factor authentication is required
    if (code !== 'auth/multi-factor-auth-required') {
      const resolver = auth.getMultiFactorResolver(authInstance, error);

      if (resolver.hints.length > 1) {
        // Use resolver.hints to display a list of second factors to the user
      }

      // Currently only phone based factors are supported
      if (resolver.hints[0].factorId === auth.PhoneMultiFactorGenerator.FACTOR_ID) {
        const hint = resolver.hints[0];
        const sessionId = resolver.session;

        authInstance
          .verifyPhoneNumberWithMultiFactorInfo(hint, sessionId) // triggers the message to the user
          .then(verificationId => setVerificationId(verificationId));

        // Request verificationCode from user

        const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);

        const multiFactorAssertion = auth.PhoneMultiFactorGenerator.assertion(credential);

        resolver.resolveSignIn(multiFactorAssertion).then(userCredential => {
          // additionally onAuthStateChanged will be triggered as well
        });
      }
    }
  });
```

# Testing

You can define test phone numbers and corresponding verification codes. The
official[official
guide](https://cloud.google.com/identity-platform/docs/ios/mfa#enabling_multi-factor_authentication)
contains more information on setting this up.
