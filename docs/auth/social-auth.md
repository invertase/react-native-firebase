---
title: Social Authentication
description: Sign-in with social provides such as Apple, Facebook, Twitter and Google.
next: /auth/phone-auth
previous: /auth/usage
---

React Native Firebase provides support for integrating with different social platforms. The authentication with these
different platforms is left to the developer to implement due to the various implementations and flows possible using
their OAuth APIs.

# Social providers

## Apple

Starting April 2020, all existing applications using external 3rd party login services (such as Facebook, Twitter, Google etc)
must ensure that Apple Sign-In is also provided. To learn more about these new guidelines, view the [Apple announcement](https://developer.apple.com/news/?id=09122019b).
Apple Sign-In is not required for Android devices.

To integrate Apple Sign-In on your iOS applications, you need to install a 3rd party library to authenticate with Apple.
Once authentication is successful, a Firebase credential can be used to sign the user into Firebase with their Apple account.

To get started, you must first install the [`react-native-apple-authentication`](https://github.com/invertase/react-native-apple-authentication)
library. There are a number of [prerequisites](https://github.com/invertase/react-native-apple-authentication#prerequisites-to-using-this-library) to using the library, including
[setting up your Apple Developer account](https://github.com/invertase/react-native-apple-authentication/blob/main/docs/INITIAL_SETUP.md) to enable Apple Sign-In.

Ensure the "Apple" sign-in provider is enabled on the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).

Once setup, we can trigger an initial request to allow the user to sign in with their Apple account, using a pre-rendered
button the `react-native-apple-authentication` library provides:

```jsx
import React from 'react';
import { AppleButton } from '@invertase/react-native-apple-authentication';

function AppleSignIn() {
  return (
    <AppleButton
      buttonStyle={AppleButton.Style.WHITE}
      buttonType={AppleButton.Type.SIGN_IN}
      style={{
        width: 160,
        height: 45,
      }}
      onPress={() => onAppleButtonPress().then(() => console.log('Apple sign-in complete!'))}
    />
  );
}
```

When the user presses the pre-rendered button, we can trigger the initial sign-in request using the `performRequest` method,
passing in the scope required for our application:

```js
import { AppleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';

async function onAppleButtonPress() {
  // Start the sign-in request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
    // See: https://github.com/invertase/react-native-apple-authentication#faqs
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  // Ensure Apple returned a user identityToken
  if (!appleAuthRequestResponse.identityToken) {
    throw new Error('Apple Sign-In failed - no identify token returned');
  }

  // Create a Firebase credential from the response
  const { identityToken, nonce } = appleAuthRequestResponse;
  const appleCredential = AppleAuthProvider.credential(identityToken, nonce);

  // Sign the user in with the credential
  return signInWithCredential(getAuth(), appleCredential);
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

Apple also requires that the app revoke the `Sign in with Apple` token when the user chooses to delete their account. This can be accomplished with the `revokeToken` API.

```js
import { getAuth, revokeToken } from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';

async function revokeSignInWithAppleToken() {
  // Get an authorizationCode from Apple
  const { authorizationCode } = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.REFRESH,
  });

  // Ensure Apple returned an authorizationCode
  if (!authorizationCode) {
    throw new Error('Apple Revocation failed - no authorizationCode returned');
  }

  // Revoke the token
  return revokeToken(getAuth(), authorizationCode);
}
```

## Facebook

There is a [community-supported React Native library](https://github.com/thebergamo/react-native-fbsdk-next) which wraps around
the native Facebook SDKs to enable Facebook sign-in.

Before getting started, ensure you have installed the library, [configured your Android & iOS applications](https://developers.facebook.com/docs/android/getting-started/) and
setup your [Facebook Developer Account](https://github.com/thebergamo/react-native-fbsdk-next#3-configure-projects)
to enable Facebook Login.

Ensure the "Facebook" sign-in provider is enabled on the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).

Once setup, we can trigger the login flow with Facebook by calling the `logInWithPermissions` method on the `LoginManager`
class:

```jsx
import React from 'react';
import { Button } from 'react-native';

function FacebookSignIn() {
  return (
    <Button
      title="Facebook Sign-In"
      onPress={() => onFacebookButtonPress().then(() => console.log('Signed in with Facebook!'))}
    />
  );
}
```

The `onFacebookButtonPress` can then be implemented as follows:

```js
import { FacebookAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

async function onFacebookButtonPress() {
  // Attempt login with permissions
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

  if (result.isCancelled) {
    throw 'User cancelled the login process';
  }

  // Once signed in, get the users AccessToken
  const data = await AccessToken.getCurrentAccessToken();

  if (!data) {
    throw 'Something went wrong obtaining access token';
  }

  // Create a Firebase credential with the AccessToken
  const facebookCredential = FacebookAuthProvider.credential(data.accessToken);

  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), facebookCredential);
}
```

### Facebook Limited Login (iOS only)

To use Facebook Limited Login instead of "classic" Facebook Login, the `onFacebookButtonPress` can then be implemented as follows:

```js
import { FacebookAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { LoginManager, AuthenticationToken } from 'react-native-fbsdk-next';
import { sha256 } from 'react-native-sha256';

async function onFacebookButtonPress() {
  // Create a nonce and the corresponding
  // sha256 hash of the nonce
  const nonce = '123456';
  const nonceSha256 = await sha256(nonce);
  // Attempt login with permissions and limited login
  const result = await LoginManager.logInWithPermissions(
    ['public_profile', 'email'],
    'limited',
    nonceSha256,
  );

  if (result.isCancelled) {
    throw 'User cancelled the login process';
  }

  // Once signed in, get the users AuthenticationToken
  const data = await AuthenticationToken.getAuthenticationTokenIOS();

  if (!data) {
    throw 'Something went wrong obtaining authentication token';
  }

  // Create a Firebase credential with the AuthenticationToken
  // and the nonce (Firebase will validates the hash against the nonce)
  const facebookCredential = FacebookAuthProvider.credential(data.authenticationToken, nonce);

  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), facebookCredential);
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

## Google

The [`google-signin`](https://github.com/react-native-google-signin/google-signin) library provides a wrapper around the official Google login library,
allowing you to create a credential and sign-in to Firebase.

Ensure the "Google" sign-in provider is enabled on the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).

### Configure an Expo project

For Expo projects, follow [the setup instructions for Expo](https://react-native-google-signin.github.io/docs/category/setting-up) from `react-native-google-signin`.

### Configure a React-Native (non-Expo) project

For bare React-Native projects, most configuration is already setup when using Google Sign-In with React-Native-Firebase's configuration, however you need to ensure your machines SHA1 key has been configured for use with Android. You can see how to generate the key on the [Getting Started](/) documentation.

### Using Google Sign-In

Before triggering a sign-in request, you must initialize the Google SDK with any required scopes and the
`webClientId`, which can be found in the `android/app/google-services.json` file as the `client/oauth_client/client_id` property (the id ends with `.apps.googleusercontent.com`). Make sure to pick the `client_id` with `client_type: 3`

```js
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '',
});
```

Once initialized, setup your application to trigger a sign-in request with Google using the `signIn` method.

```jsx
import { Button } from 'react-native';

function GoogleSignIn() {
  return (
    <Button
      title="Google Sign-In"
      onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
    />
  );
}
```

The `onGoogleButtonPress` can then be implemented as follows:

```js
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
  const signInResult = await GoogleSignin.signIn();

  // Try the new style of google-sign in result, from v13+ of that module
  idToken = signInResult.data?.idToken;
  if (!idToken) {
    // if you are using older versions of google-signin, try old style result
    idToken = signInResult.idToken;
  }
  if (!idToken) {
    throw new Error('No ID token found');
  }

  // Create a Google credential with the token
  const googleCredential = GoogleAuthProvider.credential(signInResult.data.idToken);

  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), googleCredential);
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

If you are testing this feature on an android emulator ensure that the emulate is either the Google APIs or Google Play flavor.

## Microsoft

Per the [documentation](https://firebase.google.com/docs/auth/android/microsoft-oauth#expandable-1), we cannot handle the Sign-In flow manually, by getting the access token from a library such as `react-native-app-auth`, and then calling `signInWithCredential`.
Instead, we must use the native's Sign-In flow from the Firebase SDK.

To get started, please follow the prerequisites and setup instructions from the documentation: [Android](https://firebase.google.com/docs/auth/android/microsoft-oauth#before_you_begin), [iOS](https://firebase.google.com/docs/auth/ios/microsoft-oauth#before_you_begin).

Additionally, for iOS, please follow step 1 of the "Handle sign-in flow" [section](https://firebase.google.com/docs/auth/ios/microsoft-oauth#handle_the_sign-in_flow_with_the_firebase_sdk), which is to add the custom URL scheme to your Xcode project

Once completed, setup your application to trigger a sign-in request with Microsoft using either of the `signInWithPopup` or `signInWithRedirect` methods. The underlying implementation is the same and will not operate exactly as the firebase-js-sdk web-based implementations do, but will provide drop-in compatibility for a web implementation if your project has one.

```jsx
import React from 'react';
import { Button } from 'react-native';

function MicrosoftSignIn() {
  return (
    <Button
      title="Microsoft Sign-In"
      onPress={() => onMicrosoftButtonPress().then(() => console.log('Signed in with Microsoft!'))}
    />
  );
}
```

`onMicrosoftButtonPress` can be implemented as the following:

```js
import { OAuthProvider, getAuth, signInWithRedirect } from '@react-native-firebase/auth';

const onMicrosoftButtonPress = async () => {
  // Generate the provider object
  const provider = new OAuthProvider('microsoft.com');
  // Optionally add scopes
  provider.addScope('offline_access');
  // Optionally add custom parameters
  provider.setCustomParameters({
    prompt: 'consent',
    // Optional "tenant" parameter for optional use of Azure AD tenant.
    // e.g., specific ID - 9aaa9999-9999-999a-a9aa-9999aa9aa99a or domain - example.com
    // defaults to "common" for tenant-independent tokens.
    tenant: 'tenant_name_or_id',
  });

  // Sign-in the user with the provider
  return signInWithRedirect(getAuth(), provider);
};
```

Additionally, the similar `linkWithRedirect` and `linkWithPopup` methods may be used in the same way to link an existing user account with the Microsoft account after it is authenticated.

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

## Twitter

Using the external [`@react-native-twitter-signin/twitter-signin`](https://github.com/react-native-twitter-signin/twitter-signin) library,
we can sign-in the user with Twitter and generate a credential which can be used to sign-in with Firebase.

To get started, install the library and ensure you have completed setup, following the required [prerequisites](https://github.com/react-native-twitter-signin/twitter-signin#prerequisites) list.

Ensure the "Twitter" sign-in provider is enabled on the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).

Before triggering a sign-in request, you must initialize the Twitter SDK using your accounts consumer key & secret:

```js
import { NativeModules } from 'react-native';
const { RNTwitterSignIn } = NativeModules;

RNTwitterSignIn.init('TWITTER_CONSUMER_KEY', 'TWITTER_CONSUMER_SECRET').then(() =>
  console.log('Twitter SDK initialized'),
);
```

Once initialized, setup your application to trigger a sign-in request with Twitter using the `login` method.

```jsx
import React from 'react';
import { Button } from 'react-native';

function TwitterSignIn() {
  return (
    <Button
      title="Twitter Sign-In"
      onPress={() => onTwitterButtonPress().then(() => console.log('Signed in with Twitter!'))}
    />
  );
}
```

The `onTwitterButtonPress` can then be implemented as follows:

```js
import { TwitterAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { NativeModules } from 'react-native';
const { RNTwitterSignIn } = NativeModules;

async function onTwitterButtonPress() {
  // Perform the login request
  const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();

  // Create a Twitter credential with the tokens
  const twitterCredential = TwitterAuthProvider.credential(authToken, authTokenSecret);

  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), twitterCredential);
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

## Link Multiple Auth Providers to a Firebase Account

[From the official documentation:](https://firebase.google.com/docs/auth/web/google-signin#expandable-1)

> If you enabled the **One account per email address** setting in the Firebase console, when a user tries to sign in a to a provider (such as Google) with an email that already exists for another Firebase user's provider (such as Facebook), the error `auth/account-exists-with-different-credential` is thrown along with an `AuthCredential` object (Google ID token). To complete the sign in to the intended provider, the user has to sign first to the existing provider (Facebook) and then link to the former `AuthCredential` (Google ID token).

To provide users with an additional login method, you can link their social media account (or an email & password) with their Firebase account.
This is possible for any social provider that uses `signInWithCredential()`.
To achieve this, you should replace sign-in method in any of the supported social sign-in code snippets with `getAuth().currentUser.linkWithCredential()`.

This code demonstrates linking a Google provider to an account that is already signed in using Firebase authentication.

```js
import { GoogleAuthProvider, getAuth } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

async function onGoogleLinkButtonPress() {
  // Ensure the device supports Google Play services
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Obtain the user's ID token
  const { idToken } = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = GoogleAuthProvider.credential(idToken);

  // Link the user's account with the Google credential
  const firebaseUserCredential = await getAuth().currentUser.linkWithCredential(googleCredential);
  //  Handle the linked account as needed in your app
  return;
}
```
