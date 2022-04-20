---
title: Cloud Functions
description: Installation and getting started with Cloud Functions.
icon: //static.invertase.io/assets/firebase/cloud-functions.svg
next: /functions/writing-deploying-functions
previous: /firestore/pagination
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the functions module
yarn add @react-native-firebase/functions

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/functions/usage/installation/ios) and [Android](/functions/usage/installation/android).

# What does it do

Firebase Cloud Functions let you automatically run backend code in response to events triggered by Firebase features and
HTTPS requests. Your code is stored in Google's cloud and runs in a managed environment. There's no need to manage and
scale your own servers.

<Youtube id="vr0Gfvp5v1A" />

After you write and deploy a function, Google's servers begin to manage the function immediately. You can fire the function
directly with an HTTP request, via the Cloud Functions module, or in the case of background functions, Google's servers will listen for events and run
the function when it is triggered.

For more information on use cases, view the [Firebase Cloud Functions](https://firebase.google.com/docs/functions/use-cases) documentation.

# Usage

The Cloud Functions module provides the functionality to directly trigger deployed HTTPS callable functions, without worrying
about security or implementing a HTTP request library.

Functions deployed to Firebase have unique names, allowing you to easily identify which endpoint you wish to send a request to.
To learn more about deploying Functions to Firebase, view the [Writing & Deploying Functions](/functions/writing-deploying-functions) documentation.

## Calling an endpoint

Assuming we have a deployed a callable endpoint named `listProducts`, to call the endpoint the library exposes a
`httpsCallable` method. For example:

```js
// Deployed HTTPS callable
exports.listProducts = functions.https.onCall(() => {
  return [
    /* ... */
    // Return some data
  ];
});
```

Within the React Native application, the list of products returned can be directly accessed:

```jsx
import functions from '@react-native-firebase/functions';

function App() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    functions()
      .httpsCallable('listProducts')()
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  // ...
}
```

## Using an emulator

Whilst developing your application with Cloud Functions, it is possible to run the functions inside of a local emulator.

To call the emulated functions, call the `useFunctionsEmulator` method exposed by the library:

```js
import functions from '@react-native-firebase/functions';

// Use a local emulator in development
if (__DEV__) {
  // If you are running on a physical device, replace http://localhost with the local ip of your PC. (http://192.168.x.x)
  functions().useFunctionsEmulator('http://localhost:5000');
}
```
