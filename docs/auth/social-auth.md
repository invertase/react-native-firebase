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
[setting up your Apple Developer account](https://github.com/invertase/react-native-apple-authentication/blob/master/docs/INITIAL_SETUP.md) to enable Apple Sign-In.

Ensure the "Apple" sign-in provider is enabled on the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).

Once setup, we can trigger an initial request to allow user to sign in with their Apple account, using a pre-rendered
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
import auth from '@react-native-firebase/auth';
import appleAuth, {
  AppleAuthRequestScope,
  AppleAuthRequestOperation,
} from '@invertase/react-native-apple-authentication';

async function onAppleButtonPress() {
  // Start the sign-in request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  });

  // Ensure Apple returned a user identityToken
  if (!appleAuthRequestResponse.identityToken) {
    throw 'Apple Sign-In failed - no identify token returned';
  }

  // Create a Firebase credential from the response
  const { identityToken, nonce } = appleAuthRequestResponse;
  const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

  // Sign the user in with the credential
  return auth().signInWithCredential(appleCredential);
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

## Facebook

Facebook provide an [official React Native library](https://github.com/facebook/react-native-fbsdk) which wraps around
the native Facebook SDKs to enable Facebook sign-in.

Before getting started, ensure you have installed the library, [configured your Android & iOS applications](https://developers.facebook.com/docs/android/getting-started/) and
setup your [Facebook Developer Account](https://github.com/facebook/react-native-fbsdk#3-configure-projects)
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
import auth from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk';

async function onFacebookButtonPress() {
  // Attempt login with permissions
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

  if (result.isCancelled) {
    throw 'User cancelled the login process';
  }

  // Once signed in, get the users AccesToken
  const data = await AccessToken.getCurrentAccessToken();

  if (!data) {
    throw 'Something went wrong obtaining access token';
  }

  // Create a Firebase credential with the AccessToken
  const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(facebookCredential);
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

## Twitter

Using the external [`react-native-twitter-signin`](https://github.com/GoldenOwlAsia/react-native-twitter-signin) library,
we can sign-in the user with Twitter and generate a credential which can be used to sign-in with Firebase.

To get started, install the library and ensure you have completed setup, following the required [prerequisites](https://github.com/GoldenOwlAsia/react-native-twitter-signin#prerequisites) list.

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
import auth from '@react-native-firebase/auth';
import { NativeModules } from 'react-native';
const { RNTwitterSignIn } = NativeModules;

async function onTwitterButtonPress() {
  // Perform the login request
  const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();

  // Create a Twitter credential with the tokens
  const twitterCredential = auth.TwitterAuthProvider.credential(authToken, authTokenSecret);

  // Sign-in the user with the credential
  return auth().signInWithCredential(twitterCredential);
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.

## Google

The [`google-signin`](https://github.com/react-native-community/react-native-google-signin) library provides a wrapper around the official Google login library,
allowing you to create a credential and sign-in to Firebase.

Most configuration is already setup when using Google Sign-In with Firebase, however you need to ensure your machines
SHA1 key has been configured for use with Android. You can see view how to generate the key on the [Getting Started](/)
documentation.

Ensure the "Google" sign-in provider is enabled on the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).

Before triggering a sign-in request, you must initialize the Google SDK using your any required scopes and the
`webClientId`, which can be found in the `android/app/google-services.json` file as the `client/oauth_client/client_id` property (the id ends with `.apps.googleusercontent.com`).

```js
import { GoogleSignin } from '@react-native-community/google-signin';

GoogleSignin.configure({
  webClientId: '',
});
```

Once initialized, setup your application to trigger a sign-in request with Google using the `signIn` method.

```jsx
import React from 'react';
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
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-community/google-signin';

async function onGoogleButtonPress() {
  // Get the users ID token
  const { idToken } = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(googleCredential);
}
```

Upon successful sign-in, any [`onAuthStateChanged`](/auth/usage#listening-to-authentication-state) listeners will trigger
with the new authentication state of the user.
