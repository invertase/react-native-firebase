# Usage with React Native Firebase

This library integrates well with the [`@react-native-firebase/auth`](https://www.npmjs.com/package/@react-native-firebase/auth) package to provide Apple Authentication for Firebase Auth.

## Prerequisites to using this library

The `@invertase/react-native-apple-authentication` library will not work if you do not ensure the following:

- You have setup react-native iOS development environment on your machine (Will only work on Mac). If not, please follow the official React Native documentation for getting started: [React Native getting started documentation](https://facebook.github.io/react-native/docs/getting-started).

- You are using React Native version `0.60` or higher.

- You are using Xcode version `11` or higher. This will allow you to develop using iOS version `13`, the only version possible for authenticating with Apple.

- **Once you're sure you've met the above, please follow our [Initial development environment setup](INITIAL_SETUP.md) guide.**

# v6 example

> To use this with React Native Firebase v6 and above, version `v6.2.0` of the [`@react-native-firebase/auth`](https://www.npmjs.com/package/@react-native-firebase/auth) package is required.

```js
import React from 'react';
import { View } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import appleAuth, {
  AppleButton,
  AppleAuthRequestScope,
  AppleAuthRequestOperation,
} from '@invertase/react-native-apple-authentication';

/**
 * Note the sign in request can error, e.g. if the user cancels the sign-in.
 * Use `AppleAuthError` to determine the type of error, e.g. `error.code === AppleAuthError.CANCELED`
 */
async function onAppleButtonPress() {
  // 1). start a apple sign-in request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  });

  // 2). if the request was successful, extract the token and nonce
  const { identityToken, nonce } = appleAuthRequestResponse;

  // can be null in some scenarios
  if (identityToken) {
    // 3). create a Firebase `AppleAuthProvider` credential
    const appleCredential = firebase.auth.AppleAuthProvider.credential(identityToken, nonce);

    // 4). use the created `AppleAuthProvider` credential to start a Firebase auth request,
    //     in this example `signInWithCredential` is used, but you could also call `linkWithCredential`
    //     to link the account to an existing user
    const userCredential = await firebase.auth().signInWithCredential(appleCredential);

    // user is now signed in, any Firebase `onAuthStateChanged` listeners you have will trigger
    console.warn(`Firebase authenticated via Apple, UID: ${userCredential.user.uid}`);
  } else {
    // handle this - retry?
  }
}

function SocialAuthButtons() {
  // your component that renders your social auth providers
  return (
    <View>
      {/* Render your other social provider buttons here */}
      {appleAuth.isSupported && (
        <AppleButton
          cornerRadius={5}
          style={{ width: 200, height: 60 }}
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.SIGN_IN}
          onPress={() => onAppleButtonPress()}
        />
      )}
    </View>
  );
}
```
