---
title: OpenID Connect Authentication
description: Sign-in users using OpenID Connect.
next: /auth/multi-factor-auth
previous: /auth/phone-auth
---

React Native Firebase provides supports integrating with OpenID Connect providers. The authentication with these
different providers is left to you to implement due to the various implementations and flows possible.

Here we will demonstrate a minimal example of how you could do this using the package [react-native-app-auth](https://github.com/FormidableLabs/react-native-app-auth) to authenticate with the provider. Then after we have authenticated with the provider, we use the ID Token from the provider to authenticate with `react-native-firebase`. But you have to handle the flow to get the ID token and you should do things like logging the user out from the provider when they logout or revoke the token. Again this all depends on the provider, your flow and your use-case.

# Getting started

To get started with OpenID Connect authentication you need to do the following:

1. Setup or get the configuration from the provider you want to use
2. Add the provider in the firebase console
3. Authenticate in the app using `react-native-app-auth` and `react-native-firebase`

## 1. Setup or get the configuration from the provider you want to use

As stated before, this will vary a lot from provider to provider and your use-case. You need to find and look the documentation for the provider you want to use and follow that documentation to setup a working provider.
You can see examples of "Tested OpenID providers" from [react-native-app-auth here](https://github.com/FormidableLabs/react-native-app-auth#tested-openid-providers) and how you do this will depend on what provider you want to use. But you need to complete the setup or configuration of the provider you want to use before you continue here.

## 2. Add the provider in the Firebase console

Doing the steps below will allow you to add the provider to the Firebase project.
If the provider is not added there, you won't be able to use the `signInWithCredential` method, since Firebase will not be able to use the credential if the provider does not exist in the project.

1. Firebase console in the project you want to add OpenID Connect to
2. Authentication
3. Sign-in method
4. If you have added "Sign-in providers" already, click "Add new provider"
5. Under "Custom providers" choose "OpenID Connect"
6. Toggle on the Enabled at the top to the right of "Open ID Connect"
7. Fill out the details like: "Name", "Client ID", "Issuer (URL)" and "Client secret". These values have to correspond to the OpenID Connect provider you want to use.
8. Note down the Provider ID below name, if you type in "azure_test" in the name field. Notice how it says below the field: "Provider ID: oidc.azure_test" so this value will be prepended with "oidc." We will use this later when authenticating the user.

## 3. Authenticate in the app using "react-native-app-auth" and "react-native-firebase"

Before you use `react-native-app-auth` you have to complete the setup in their [docs](https://github.com/FormidableLabs/react-native-app-auth#getting-started).

The example below demonstrates how you could setup such a flow within your own application:

```jsx
import { OIDCAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { authorize } from 'react-native-app-auth';

// using react-native-app-auth to get oauth token from Azure AD
const config = {
  issuer: 'https://login.microsoftonline.com/XXX/v2.0',
  clientId: 'XXXX',
  redirectUrl: 'msauth.your.bundle.id://auth/',
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  useNonce: false,
};

// Log in to get an authentication token
const authState = await authorize(config);

const credential = OIDCAuthProvider.credential(
  'azure_test', // this is the "Provider ID" value from the firebase console
  authState.idToken,
);

await signInWithCredential(getAuth(), credential);
```
