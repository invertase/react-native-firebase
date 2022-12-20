---
title: Phone Authentication
description: Sign-in users with their phone number.
next: /auth/multi-factor-auth
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

# iOS Setup

Ensure that all parts of step 1 and 2 from [the official firebase iOS phone auth docs](https://firebase.google.com/docs/auth/ios/phone-auth#enable-phone-number-sign-in-for-your-firebase-project) have been followed, noting in particular that you may need to re-download your firebase GoogleService-Info.plist file and for the reCAPTCHA flow to work you must make sure you have added your custom URL scheme to your project plist file.

Phone auth requires app verification, and the automatic app verification process uses data-only firebase cloud messages to the app. Data-only cloud messaging only works on real devices where the app has background refresh enabled. If background refresh disabled, or if using the Simulator, app verification uses the fallback reCAPTCHA flow allowing you to check if it is configured correctly.

For reliable automated testing, you may want to disable both automatic and fallback reCAPTCHA app verification for your app. To do this, [you may disable app verification in AuthSettings](https://rnfirebase.io/reference/auth/authsettings#appVerificationDisabledForTesting) prior to calling any phone auth methods.

# Android Setup

Ensure that all parts of step 1 and 2 from [the official firebase Android phone auth docs](https://firebase.google.com/docs/auth/android/phone-auth#enable-phone-number-sign-in-for-your-firebase-project) have been followed.

# Expo Setup

To use phone auth in an expo app, add the `@react-native-firebase/auth` config plug-in to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) section of your `app.json`. This is in addition to the `@react-native-firebase/app` plugin.

```json
{
  "expo": {
    "plugins": ["@react-native-firebase/app", "@react-native-firebase/auth"]
  }
}
```

The `@react-native-firebase/auth` config plugin is not required for all auth providers, but it is required to use phone auth. The plugin [will set up reCAPTCHA](https://firebase.google.com/docs/auth/ios/phone-auth#set-up-recaptcha-verification) verification for you on iOS.

The recommendation is to use a [custom development client](https://docs.expo.dev/clients/getting-started/). For more info on using Expo with React Native Firebase, see our [Expo docs](/#expo).

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

# MFA-like Account Creation

After successfully creating a user with an email and password (see Authentication/Usage/Email/Password sign-in), use the `verifyPhoneNumber` method to send a verification code to a user's phone number and if the user enters the correct code, link the phone number to the authenticated user's account. This creates a MFA-like authentication flow for account creation. However, to implement MFA with firebase, your app must call additional methods and use Google Cloud Identity Platform, which is a paid service, details available in this guide https://cloud.google.com/identity-platform/docs/web/mfa

```jsx
import React, { useState, useEffect } from 'react';
import { Button, TextInput, Text } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function PhoneVerification() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);

  const [code, setCode] = useState('');

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // Handle create account button press
  async function createAccount() {
    try {
      await auth().createUserWithEmailAndPassword('jane.doe@example.com', 'SuperSecretPassword!');
      console.log('User account created & signed in!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');
      }

      if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');
      }
      console.error(error);
    }
  }

  // Handle the verify phone button press
  async function verifyPhoneNumber(phoneNumber) {
    const confirmation = await auth().verifyPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  }

  // Handle confirm code button press
  async function confirmCode() {
    try {
      const credential = auth.PhoneAuthProvider.credential(confirm.verificationId, code);
      let userData = await auth().currentUser.linkWithCredential(credential);
      setUser(userData.user);
    } catch (error) {
      if (error.code == 'auth/invalid-verification-code') {
        console.log('Invalid code.');
      } else {
        console.log('Account linking error');
      }
    }
  }

  if (initializing) return null;

  if (!user) {
    return <Button title="Login" onPress={() => createAccount()} />;
  } else if (!user.phoneNumber) {
    if (!confirm) {
      return (
        <Button
          title="Verify Phone Number"
          onPress={() => verifyPhoneNumber('ENTER A VALID TESTING OR REAL PHONE NUMBER HERE')}
        />
      );
    }
    return (
      <>
        <TextInput value={code} onChangeText={text => setCode(text)} />
        <Button title="Confirm Code" onPress={() => confirmCode()} />
      </>
    );
  } else {
    return (
      <Text>
        Welcome! {user.phoneNumber} linked with {user.email}
      </Text>
    );
  }
}
```
