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

To learn more about multidex, view the official [Android documentation](https://developer.android.com/studio/build/multidex#mdex-gradle).

## Enabling Multidex

There are 3 steps involved in enabling multidex.

Steps 1 and 2 tell Gradle to turn on multidex with a directive, and add new dependency.

Open the `/android/app/build.gradle` file. Under `dependencies` we need to add the module, and then enable it
within the `defaultConfig`:

```groovy
android {
    defaultConfig {
        // ...
        multiDexEnabled true // <-- ADD THIS in the defaultConfig section
    }
    // ...
}

dependencies {
  implementation 'androidx.multidex:multidex:2.0.1'  // <-- ADD THIS DEPENDENCY
}
```

The 3rd step is to alter your `android/app/src/main/java/.../MainApplication.java` file to extend `MultiDexApplication` like so:

```java

// ... all your other imports here
import androidx.multidex.MultiDexApplication; // <-- ADD THIS IMPORT


// Your class definition needs `extends MultiDexApplication` like below
public class MainApplication extends MultiDexApplication implements ReactApplication {

```

Once added, rebuild your application: `npx react-native run-android`.
