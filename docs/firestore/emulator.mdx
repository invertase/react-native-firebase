---
title: Cloud Firestore Emulator
description: Using the Cloud Firestore emulator to test your app locally.
next: /firestore/usage-with-flatlists
previous: /firestore/usage
---

You can test your app and its Firestore implementation with an emulator which is built to mimic the behavior of Cloud Firestore. This means you can connect your app directly to the emulator to perform integration testing or QA without touching production data.

For example, you can connect your app to the emulator to safely read and write documents in testing.

## Running the emulator

To be able to mimic the behavior of Cloud Firestore, you need to run the emulator. This is effectively a server that will receive and send requests in lieu of Cloud Firestore. This is achieved by running the following commands:

```bash
// install the Firebase CLI which will run the emulator
curl -sL firebase.tools | bash

// run this command to start the emulator, it will also install it if this is your first time running the command
firebase emulators:start --only firestore
```

You should see a `firestore-debug.log` file in the directory you ran the command which will have a log of all the requests.

# Connect to emulator from your app

You need to configure the following property as soon as possible in the startup of your application:

```jsx
import '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

// set the host and the port property to connect to the emulator
// set these before any read/write operations occur to ensure it doesn't affect your Cloud Firestore data!
if (__DEV__) {
  firestore().useEmulator('localhost', 8080);
}

const db = firestore();
```

# Clear locally stored emulator data

Run the following command to clear the data accumulated locally from using the emulator. Please note that you have to insert your project id in the request at this point `[INSERT YOUR PROJECT ID HERE]`.

```bash
curl -v -X DELETE "http://localhost:8080/emulator/v1/projects/[INSERT YOUR PROJECT ID HERE]/databases/(default)/documents"
```

There are more things that can be achieved with the emulator such as using local rules to test the integrity & security of your database. For further information, please follow the Firebase emulator documentation [here](https://firebase.google.com/docs/emulator-suite).
