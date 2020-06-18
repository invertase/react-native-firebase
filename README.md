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

A well typed React Native library providing support for Apple Authentication on iOS, including support for all `AppleButton` variants.

![apple-auth](https://static.invertase.io/assets/apple-auth.png)

## Prerequisites to using this library

The `@invertase/react-native-apple-authentication` library will not work if you do not ensure the following:

- You have setup react-native iOS development environment on your machine (Will only work on Mac). If not, please follow the official React Native documentation for getting started: [React Native getting started documentation](https://facebook.github.io/react-native/docs/getting-started).

- You are using React Native version `0.60` or higher.

- You are using Xcode version `11` or higher. This will allow you to develop using iOS version `13`, the only version possible for authenticating with Apple.

- **Once you're sure you've met the above, please follow our [Initial development environment setup](docs/INITIAL_SETUP.md) guide.**

## Installation

```bash
yarn add @invertase/react-native-apple-authentication
```

You will not have to manually link this module as it supports React Native auto-linking.

## Usage

Below are simple steps to help you get up and running. Please skip and head to the full code examples noted below if you prefer to see a more complete implementation:

- [React Hooks example](example/app.js)
- [React Class example](example/classVersion.js)
- If you're authenticating users via `React Native Firebase`; see our [Firebase guide](docs/FIREBASE.md)


#### 1. Initial set-up

Import the `appleAuth` ([API documentation](docs/interfaces/_lib_index_d_.rnappleauth.module.md)) module and the `AppleButton` ([API documentation](docs/interfaces/_lib_index_d_.rnappleauth.applebuttonprops.md)) exported member element from the `@invertase/react-native-apple-authentication` library. Setup an event handler (`onPress`) to kick start the authentication request.

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
          width: 160,
          height: 45,
        }}
        onPress={() => onAppleButtonPress()}
      />
    </View>
  );
}
```

#### 2. Implement the login process

Import exported members `AppleAuthRequestOperation` ([API documentation](docs/enums/_lib_index_d_.rnappleauth.appleauthrequestoperation.md)), `AppleAuthRequestScope` [API documentation](docs/enums/_lib_index_d_.rnappleauth.appleauthrequestscope.md) & `AppleAuthCredentialState` [API documentation](docs/enums/_lib_index_d_.rnappleauth.appleauthcredentialstate.md).

```js
// App.js

import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthCredentialState,
} from '@invertase/react-native-apple-authentication';

async function onAppleButtonPress() {
  // performs login request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
  });

  // get current authentication state for user
  // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
  const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

  // use credentialState response to ensure the user is authenticated
  if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
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
import appleAuth, { AppleButton } from '@invertase/react-native-apple-authentication';

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

## Serverside verification

#### Nonce

- Based on the [Firebase implementation guidelines](https://firebase.google.com/docs/auth/ios/apple#sign_in_with_apple_and_authenticate_with_firebase) the nonce provided to `appleAuth.performRequest` is automatically SHA256-hashed.
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

### Interfaces

- [appleAuth module](docs/interfaces/_lib_index_d_.rnappleauth.module.md)
- [AppleAuthRequestOptions](docs/interfaces/_lib_index_d_.rnappleauth.appleauthrequestoptions.md)
- [AppleAuthRequestResponse](docs/interfaces/_lib_index_d_.rnappleauth.appleauthrequestresponse.md)
- [AppleAuthRequestResponseFullName](docs/interfaces/_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md)
- [AppleButtonProps](docs/interfaces/_lib_index_d_.rnappleauth.applebuttonprops.md)

### Enumerations

- [AppleAuthCredentialState](docs/enums/_lib_index_d_.rnappleauth.appleauthcredentialstate.md)
- [AppleAuthError](docs/enums/_lib_index_d_.rnappleauth.appleautherror.md)
- [AppleAuthRealUserStatus](docs/enums/_lib_index_d_.rnappleauth.appleauthrealuserstatus.md)
- [AppleAuthRequestOperation](docs/enums/_lib_index_d_.rnappleauth.appleauthrequestoperation.md)
- [AppleAuthRequestScope](docs/enums/_lib_index_d_.rnappleauth.appleauthrequestscope.md)
- [AppleButtonStyle](docs/enums/_lib_index_d_.rnappleauth.applebuttonstyle.md)
- [AppleButtonType](docs/enums/_lib_index_d_.rnappleauth.applebuttontype.md)

### FAQs

1. Why does `full name` and `email` return `null`?
   - Apple only returns the `full name` and `email` on the first login, it will return `null` on the succeeding login so you need to save those data. 
   - For testing purposes, to be receive these again, go to your device settings; `Settings > Apple ID, iCloud, iTunes & App Store > Password & Security > Apps Using Your Apple ID`, tap on your app and tap `Stop Using Apple ID`. You can now sign-in again and you'll receive the `full name` and `email.
   
2. How to change button language?
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

## Troubleshouting

```
The operation couldn’t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1000.)
```

In the case you are using the function `getCredentialStateForUser` on a simulator, this error will always be fired. You should test your code on a real device.


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
