---
title: Social Auth
description: React Native Firebase integrates with the majority of social auth providers, using external libraries.
---

# Social Auth

React Native Firebase provides support for integrating with different social platforms. The authentication with these 
different platforms is left to the developer to implement due to the various implementations and flows possible using their
oAuth APIs.

Below are our recommended approaches for integrating with each social platform.

## Facebook

The recommended library of choice is the official [react-native-fbsdk](https://github.com/facebook/react-native-fbsdk)
library, which provides a wrapper around the native Android & iOS SDKs. The library handles user login and granting
access to the users `AccessToken` which is required to create a Firebase credential.

**Step 1**: Login to Facebook with permissions.
```js
import { LoginManager } from 'react-native-fbsdk';

// Login with permissions
const result = await LoginManager.logInWithReadPermissions(['public_profile', 'email']); 

if (result.isCancelled) {
  throw new Error('User cancelled the login process');
}
```

**Step 2**: Read the users `AccessToken`.

```js
import { AccessToken } from 'react-native-fbsdk';

const data = await AccessToken.getCurrentAccessToken();

if (!data) {
  throw new Error('Something went wrong obtaining access token');
}
```

**Step 3**: Create a Firebase credential with the token.

```js
import { firebase } from '@react-native-firebase/auth';

const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
```

**Step 4**: Sign in to Firebase with the created credential.

```js
await firebase.auth().signInWithCredential(credential);
```

## Twitter

The [react-native-twitter-signin](https://github.com/GoldenOwlAsia/react-native-twitter-signin) library provides a 
wrapper around the official Twitter SDKs, providing access to the users `authToken` and `authTokenSecret` which are 
required to create a Firebase credential.

**Step 1**: Initialize the Twitter SDK.

```js
import { NativeModules } from 'react-native';
const { RNTwitterSignIn } = NativeModules;

await RNTwitterSignIn.init('TWITTER_CONSUMER_KEY', 'TWITTER_CONSUMER_SECRET');
``` 

**Step 2**: Login to Twitter and read tokens

```js
// Also returns: name, userID & userName
const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn(); 
```

**Step 3**: Create a Firebase credential with the tokens.

```js
import { firebase } from '@react-native-firebase/auth';

const credential = firebase.auth.TwitterAuthProvider .credential(authToken, authTokenSecret);
```

**Step 4**: Sign in to Firebase with the created credential.

```js
await firebase.auth().signInWithCredential(credential);
```

## Google

The [react-native-google-signin](https://github.com/react-native-community/react-native-google-signin) provides a 
wrapper around the official Google login library, providing access to the users `accessToken` and `idToken` which are
required to create a Firebase credential.

**Step 1**: Configure the library.

- The `configure` method only needs to be called once during your apps lifecycle.
- Configuration settings can be obtained from [here](https://github.com/react-native-community/react-native-google-signin/blob/master/docs/get-config-file.md);

```js
import { GoogleSignin } from 'react-native-google-signin';

async funtion bootstrap() {
  await GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    webClientId: '', // required
  });
}
```

**Step 2**: Login with Google

```js
import { GoogleSignin } from 'react-native-google-signin';

const { accessToken, idToken } = await GoogleSignin.signIn();
```

**Step 3**: Create a Firebase credential with the tokens.

```js
import { firebase } from '@react-native-firebase/auth';

const credential = firebase.auth.GoogleAuthProvider .credential(idToken, accessToken);
```

**Step 4**: Sign in to Firebase with the created credential.

```js
await firebase.auth().signInWithCredential(credential);
```

## Github

*TODO* @salakar

## Custom Provider

*TODO* @salakar
