---
title: Phone Authentication
description: Sign-in with users with their phone number.
next: /firestore/usage
previous: /auth/social-auth
---

Phone authentication allows users to sign in to Firebase using their phone as the authenticator. An SMS message is sent
to the user via their phone number containing a unique code. Once the code has been authorized, the user is able to sign
in to Firebase.

Phone numbers that end users provide for authentication will be sent and stored by Google to improve our spam and abuse
prevention across Google services, including but not limited to Firebase. Developers should ensure they have appropriate
end-user consent prior to using the Firebase Authentication phone number sign-in service.

> Firebase Phone Auth is not supported in all countries. Please see their [FAQs](https://firebase.google.com/support/faq/#develop) for more information.

Ensure the "Phone" sign-in provider is enabled on the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).

# Sign-in

The module provides a `signInWithPhoneNumber` method which accepts a phone number. Firebase sends an SMS message to the
user with a code, which they must then confirm. The `signInWithPhoneNumber` method returns a confirmation method which accepts
a code. Based on whether the code is correct for the device, the method rejects or resolves.

The example below demonstrates how you could setup such a flow within your own application:

```jsx
import React, { useState } from 'react';
import { Button, TextInput } from 'react-native';
import auth from '@react-native-firebase/auth';

function PhoneSignIn() {
  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);

  const [code, setCode] = useState('');

  // Handle the button press
  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  }

  async function confirmCode() {
    try {
      await confirm.confirm(code);
    } catch (error) {
      console.log('Invalid code.');
    }
  }

  if (!confirm) {
    return (
      <Button
        title="Phone Number Sign In"
        onPress={() => signInWithPhoneNumber('+1 650-555-3434')}
      />
    );
  }

  return (
    <>
      <TextInput value={code} onChangeText={text => setCode(text)} />
      <Button title="Confirm Code" onPress={() => confirmCode()} />
    </>
  );
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

# Testing

Firebase provides support for locally testing phone numbers. For local testing to work, you must have ensured your local
machine SHA1 debug key was added whilst creating your application on the Firebase Console. View the [Getting Started](/)
guide on how to set this up.

On the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers), select the "Phone" authentication provider and click on the
"Phone numbers for testing" dropdown.

Enter a new phone number (e.g. `+44 7444 555666`) and a test code (e.g. `123456`).

Once added, the number can be used with the `signInWithPhoneNumber` method, and entering the code specified will
cause a successful sign-in.
