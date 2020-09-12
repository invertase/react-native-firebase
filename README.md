<p align="center">
  <a href="https://invertase.io">
    <img width="160px" src="https://static.invertase.io/assets/invertase-logo.png"><br/>
  </a>
  <h2 align="center">React Native Apple Authentication</h2>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@invertase/react-native-apple-authentication"><img src="https://img.shields.io/npm/dm/@invertase/react-native-apple-authentication.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/@invertase/react-native-apple-authentication"><img src="https://img.shields.io/npm/v/@invertase/react-native-apple-authentication.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square" alt="License"></a>
</p>

<p align="center">
  <a href="https://invertase.link/discord"><img src="https://img.shields.io/discord/295953187817521152.svg?style=flat-square&colorA=7289da&label=Chat%20on%20Discord" alt="Chat on Discord"></a>
  <a href="https://twitter.com/invertaseio"><img src="https://img.shields.io/twitter/follow/invertaseio.svg?style=flat-square&colorA=1da1f2&colorB=&label=Follow%20on%20Twitter" alt="Follow on Twitter"></a>
</p>

---

A well typed React Native library providing support for Apple Authentication on iOS and Android, including support for all `AppleButton` variants.

![apple-auth](https://static.invertase.io/assets/apple-auth.png)

## Prerequisites to using this library

The `@invertase/react-native-apple-authentication` library will not work if you do not ensure the following:

- You are using React Native version `0.60` or higher.

- (iOS only) You have setup react-native iOS development environment on your machine (Will only work on Mac). If not, please follow the official React Native documentation for getting started: [React Native getting started documentation](https://facebook.github.io/react-native/docs/getting-started).

- (iOS only) You are using Xcode version `11` or higher. This will allow you to develop using iOS version `13` and higher, when the APIs for Sign In with Apple became available.

- **Once you're sure you've met the above, please follow our [Initial development environment setup](docs/INITIAL_SETUP.md) guide.**

## Version 2.0.0 breaking changes
Version 2 added Android support and introduced a few breaking changes with how methods are accessed. Please see the [Migration Guide](docs/MIGRATION.md).

## Installation

```bash
yarn add @invertase/react-native-apple-authentication

(cd ios && pod install)
```

You will not have to manually link this module as it supports React Native auto-linking.

## Usage

Below are simple steps to help you get up and running. The implementation differs between iOS an Android, so if you're having trouble, be sure to look through the docs. Please skip and head to the full code examples noted below if you prefer to see a more complete implementation:

- [React Hooks example (iOS)](example/app.ios.js)
- [React Class example (iOS)](example/classVersion.js)
- [React Hooks example (Android)](example/app.android.js)
- If you're authenticating users via `React Native Firebase`; see our [Firebase guide](docs/FIREBASE.md)
- For Android support, a couple extra steps are required on your Apple developer account. Checkout [our guide](docs/ANDROID_EXTRA.md) for more info.


### iOS

#### 1. Initial set-up

Import the `appleAuth` ([API documentation](docs/interfaces/_lib_index_d_.md#66)) module and the `AppleButton` ([API documentation](docs/interfaces/_lib_index_d_.applebuttonprops.md)) exported member element from the `@invertase/react-native-apple-authentication` library. Setup an event handler (`onPress`) to kick start the authentication request.

```js
// App.js

import React from 'react';
import { View } from 'react-native';
import { AppleButton } from '@invertase/react-native-apple-authentication';

async function onAppleButtonPress() {

}

function App() {
  return (
    <View>
      <AppleButton
        buttonStyle={AppleButton.Style.WHITE}
        buttonType={AppleButton.Type.SIGN_IN}
        style={{
          width: 160, // You must specify a width
          height: 45, // You must specify a height
        }}
        onPress={() => onAppleButtonPress()}
      />
    </View>
  );
}
```

#### 2. Implement the login process
```js
// App.js

import { appleAuth } from '@invertase/react-native-apple-authentication';

async function onAppleButtonPress() {
  // performs login request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  // get current authentication state for user
  // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
  const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

  // use credentialState response to ensure the user is authenticated
  if (credentialState === appleAuth.State.AUTHORIZED) {
    // user is authenticated
  }
}
```

#### 3. Event Listener

Set up event listener for when user's credentials have been revoked.

```js
// App.js

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';

function App() {
  useEffect(() => {
    // onCredentialRevoked returns a function that will remove the event listener. useEffect will call this function when the component unmounts
    return appleAuth.onCredentialRevoked(async () => {
      console.warn('If this function executes, User Credentials have been Revoked');
    });
  }, []); // passing in an empty array as the second argument ensures this is only ran once when component mounts initially.

  return (
    <View>
      <AppleButton onPress={() => onAppleButtonPress()} />
    </View>
  );
}
```

#### 4. Implement the logout process

There is an operation `AppleAuthRequestOperation.LOGOUT`, however it does not work as expected and is not even being used by Apple in their example code. See [this issue for more information](https://github.com/invertase/react-native-apple-authentication/issues/10#issuecomment-611532131)

So it is recommended when logging out to just clear all data you have from a user, collected during `AppleAuthRequestOperation.LOGIN`.

### Android

#### 1. Initial set-up
Make sure to correctly configure your Apple developer account to allow for proper authentication on Android. You can checkout [our guide](docs/ANDROID_EXTRA.md) for more info.
```js
// App.js

import React from 'react';
import { View } from 'react-native';
import { AppleButton } from '@invertase/react-native-apple-authentication';

async function onAppleButtonPress() {
}

// Apple authentication requires API 19+, so we check before showing the login button
function App() {
  return (
    <View>
      {appleAuthAndroid.isSupported && (
        <AppleButton
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.SIGN_IN}
          onPress={() => onAppleButtonPress()}
        />
      )}
    </View>
  );
}
```

#### 2. Implement the login process
```js
// App.js

import { appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid'

async function onAppleButtonPress() {
  // Generate secure, random values for state and nonce
  const rawNonce = uuid();
  const state = uuid();

  // Configure the request
  appleAuthAndroid.configure({
    // The Service ID you registered with Apple
    clientId: 'com.example.client-android',

    // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
    // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
    redirectUri: 'https://example.com/auth/callback',

    // The type of response requested - code, id_token, or both.
    responseType: appleAuthAndroid.ResponseType.ALL,

    // The amount of user information requested from Apple.
    scope: appleAuthAndroid.Scope.ALL,

    // Random nonce value that will be SHA256 hashed before sending to Apple.
    nonce: rawNonce,

    // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
    state,
  });

  // Open the browser window for user sign in
  const response = await appleAuthAndroid.signIn();

  // Send the authorization code to your backend for verification
}
```

## Serverside verification

#### Nonce

- Based on the [Firebase implementation guidelines](https://firebase.google.com/docs/auth/ios/apple#sign_in_with_apple_and_authenticate_with_firebase) the nonce provided to `appleAuth.performRequest` (iOS) and `appleAuthAndroid.configure` (Android) is automatically SHA256-hashed.
- To verify the nonce serverside you first need to hash the nonce value, ie:
  ```js
  crypto.createHash('sha256').update(nonce).digest('hex');
  ```
- The nonce can then be easily compared serverside for extra security verification, ie:
  ```js
  import crypto from 'crypto';
  import appleSigninAuth from 'apple-signin-auth';

  appleIdTokenClaims = await appleSigninAuth.verifyIdToken(id_token, {
    /** sha256 hex hash of raw nonce */
    nonce: nonce ? crypto.createHash('sha256').update(nonce).digest('hex') : undefined,
  });
  ```

## API Reference Documentation
- [AppleButtonProps](docs/interfaces/_lib_index_d_.applebuttonprops.md)
- [AppleButtonStyle](docs/enums/_lib_index_d_.applebuttonstyle.md)
- [AppleButtonType](docs/enums/_lib_index_d_.applebuttontype.md)

### iOS Interfaces
- [appleAuth module](docs/modules/_lib_index_d_.md#66)
- [AppleRequestResponse](docs/interfaces/_lib_index_d_.applerequestresponse.md)
- [AppleRequestResponseFullName](docs/interfaces/_lib_index_d_.applerequestresponsefullname.md)

### iOS Enumerations
- [AppleRequestOptions](docs/enums/_lib_index_d_.applerequestoperation.md)
- [AppleCredentialState](docs/enums/_lib_index_d_.applecredentialstate.md)
- [AppleError](docs/enums/_lib_index_d_.appleerror.md)
- [AppleRealUserStatus](docs/enums/_lib_index_d_.applerealuserstatus.md)
- [AppleRequestOperation](docs/enums/_lib_index_d_.applerequestoperation.md)
- [AppleRequestScope](docs/enums/_lib_index_d_.applerequestscope.md)

### Android Interfaces
- [appleAuthAndroid module](docs/modules/_lib_index_d_.md#98)
- [AndroidConfig](docs/interfaces/_lib_index_d_.androidconfig.md)
- [AndroidSigninResponse](docs/interfaces/_lib_index_d_.androidsigninresponse.md)
- [AndroidError](docs/modules/_lib_index_d_.md#androiderror.md)

### Android Enumerations
- [AndroidResponseType](docs/enums/_lib_index_d_.androidresponsetype.md)
- [AndroidScope](docs/enums/_lib_index_d_.androidscope.md)


## FAQs

1. Why does `full name` and `email` return `null`?
   - Apple only returns the `full name` and `email` on the first login, it will return `null` on the succeeding login so you need to save those data.
   - For testing purposes, to be receive these again, go to your device settings; `Settings > Apple ID, iCloud, iTunes & App Store > Password & Security > Apps Using Your Apple ID`, tap on your app and tap `Stop Using Apple ID`. You can now sign-in again and you'll receive the `full name` and `email.
   - Keep in mind you can always access the `email` property server-side by inspecting the `id_token` returned from Apple when verifying the user.

2. How to change button language? (iOS)
    - Native Apple Button component reads language value from CFBundleDevelopmentRegion at Info.plist file. By changing CFBundleDevelopmentRegion value you can change default language for component.
    ```XML
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    ```
    - For supporting multi language, you can add CFBundleAllowMixedLocalizations key to Info.plist.
    ```XML
    <key>CFBundleAllowMixedLocalizations</key>
    <string>true</string>
    ```

## Troubleshooting

```
The operation couldn’t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1000.)
```

###### Case 1:
Check that the connection settings have been made correctly.
The setup can be found here: [Initial Setup](https://github.com/invertase/react-native-apple-authentication/blob/master/docs/INITIAL_SETUP.md)

###### Case 2:
If you are using the function `getCredentialStateForUser` on a simulator, this error will always be triggered, for the reason that this function verifies the authenticity of the device.

You must test your code on a real device.

###### Case 3:
If you are using a simulator, go to [Mange Apple Account](https://appleid.apple.com/account/manage).

Search for "Devices", select "Simulator" and press "Remove from Account".

  ![show-devices](https://raw.githubusercontent.com/invertase/react-native-apple-authentication/master/docs/images/devices-list.jpg)

  ![remove-from-manager](https://raw.githubusercontent.com/invertase/react-native-apple-authentication/master/docs/images/remove-simulator-devices-list.jpg)

It should work fine.

```
"invalid_client" in Android webview
```
Make sure to read the Android [services setup docs](docs/ANDROID_EXTRA.md).

###### Case 1:
The `clientId` you passed to `appleAuthAndroid.configure` doesn't match the Service ID you setup in your Apple developer console.

###### Case 2:
Your Service ID is attached to the wrong Primary App ID, and therefore uses the incorrect Sign In with Apple key.

###### Case 3:
The `redirectUri` you passed to `appleAuthAndroid.configure` doesn't match one of the return URLs or domains/subdomains you added in your Apple developer console. The URL must match *exactly*, and cannot contain a query string.

## License

- See [LICENSE](/LICENSE)

---

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase-logo-small.png">
  <p align="left">
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
  <p align="left">
    <a href="https://invertase.io/hire-us">💼 Hire Us</a> |
    <a href="https://opencollective.com/react-native-firebase">☕️ Sponsor Us</a> |
    <a href="https://invertase.io/jobs">‍💻 Work With Us</a>
  </p>
</p>

---
