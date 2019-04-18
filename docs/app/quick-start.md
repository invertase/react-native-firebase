---
title: Quick Start
description: Get to grips with the basics of the App package in React Native Firebase
---

# App Quick Start

## Installation

Install this module with Yarn:

```bash
yarn add @react-native-firebase/app
```

### Initializing Firebase

React Native Firebase provides two methods for initializing your with Firebase.

- Native initialization
- Client initialization

#### Native initialization

Native initialization is the preferred way of setting up React Native Firebase. This process involves adding the 
`google-services.json` and `GoogleService-Info.plist` file generated via the Firebase console. The native method
is compatible with all other packages.

For further platform installation guides, view the <Anchor version group href="/android">Android</Anchor> & 
<Anchor version group href="/ios">iOS</Anchor> documentation.

#### Client initialization

Similar to the [Firebase Web SDK](https://www.npmjs.com/package/firebase), React Native Firebase allows app 
initialization via the client using `initializeApp`. 

> Due to limitation with some Firebase SDKs, the Remote Config, Crashlytics & Performance Monitoring modules will not work with this method of initialization. 

For further information, view the <Anchor version group href="/client-initialization">client initialization</Anchor>
documentation.

## Module Usage

Import the default firebase instance into your project:

```js
import firebase from '@react-native-firebase/app';
``` 

The instance is also accessible from other installed packages, for example:

 ```js
import auth, { firebase } from '@react-native-firebase/auth';
 ```

### Create and initialize an additional app instance

It is possible to create multiple app instances, allowing full control over which Firebase project is used
for certain packages. To create an additional app instance, call the `initialize` method:

TODO
