---
title: Enabling Multidex
description: Learn how to enable multidex on your Android application.
---

As more native dependencies are added to your project, it may bump you over the
64k method limit on the Android build system. Once this limit has been reached, you will start to see the following error
whilst attempting to build your Android application:

```
Execution failed for task ':app:mergeDexDebug'.
```

To learn more about multidex, view the offical [Android documentation](https://developer.android.com/studio/build/multidex#mdex-gradle).

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
