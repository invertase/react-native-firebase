---
title: Firebase JSON Config
description: Configure @react-native-firebase modules
next: /app/utils
previous: /app/usage
---

You can configure the modules creating a file named `firebase.json` at the root of your project directory.
An example configuration file is available for inspection in our internal test app: [`<repo>/tests/firebase.json`](https://github.com/invertase/react-native-firebase/blob/main/tests/firebase.json)

## JSON Schema

Add the [Config Schema](https://github.com/invertase/react-native-firebase/blob/main/packages/app/firebase-schema.json) to your `firebase.json` file to use the Editor Intellisense

```json
{
  "$schema": "./node_modules/@react-native-firebase/app/firebase-schema.json"
}
```
