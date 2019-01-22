---
title: Enabling Database Persistence
description: Database persistence is disabled by default. Learn how to enable it for your application.
tags:
    - android
    - ios
    - database
---

# Enabling Database Persistence

To avoid race conditions between native modules and React Native, setting the database persistence
option via the `firebase.database.setPersistence()` method was deprecated from version 3.0.0 of
React Native Firebase.

To enable persistence, changes must be made to the native code on both Android and iOS.

## Android

1. Open your projects `android/app/src/main/java/com/[project]/MainActivity.java` file.
2. Import the `FirebaseDatabase` module, by adding the following import at the top of your file:

```java{4}
package com.mypackage;

...
import com.google.firebase.database.FirebaseDatabase;
...
```

3. Add the `setPersistenceEnabled` method to your `onCreate` method:

```java{4}
      @Override
      public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FirebaseDatabase.getInstance().setPersistenceEnabled(true);
        ...
      }
```

Rebuild your Android project.

## iOS

1. Open your projects `ios/[project].xcworkspace`.
2. Within the `didFinishLaunchingWithOptions` method, add the following line after `[FIRApp configure]`:

```objectivec{5}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    ...
    [FIRApp configure];
    [FIRDatabase database].persistenceEnabled = YES;
}
```

Rebuild your iOS project.
