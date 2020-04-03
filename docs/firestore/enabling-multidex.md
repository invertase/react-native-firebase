---
title: Enabling Multidex
description: The Cloud Firestore SDK on Android can sometimes cause Dex errors, learn how to fix them.
---

The Android Firebase Firestore SDK is a large library, and in some scenarios it may bump you over the
65k method limit on the Android build system.

If you have added Cloud Firestore as a dependency and your application build is now failing with the following error,
you'll need to [enable multidex](https://developer.android.com/studio/build/multidex#mdex-gradle).

`Execution failed for task ':app:mergeDexDebug'.`

## Enabling Multidex

Open the `/android/app/build.gradle` file. Under `dependencies` we need to add the module, and then enable it
within out `defaultConfig`:

```groovy
android {
    defaultConfig {
        // ...
        multiDexEnabled true
    }
    // ...
}

dependencies {
  implementation 'com.android.support:multidex:1.0.3'
}
```

Once added, rebuild your application: `npx react-native run-android`.
