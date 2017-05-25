# Android Installation

## 1) Setup google-services.json
Download the `google-services.json` file provided by Firebase in the _Add Firebase to Android_ platform menu in your Firebase configuration console. This file should be downloaded to `YOUR_PROJECT/android/app/google-services.json`.

Next you'll have to add the google-services gradle plugin in order to parse it.

Add the google-services gradle plugin as a dependency in the *project* level build.gradle
`android/build.gradle`
```java
buildscript {
  // ...
  dependencies {
    // ...
    classpath 'com.google.gms:google-services:3.0.0'
  }
}
```

In your app build.gradle file, add the gradle plugin at the VERY BOTTOM of the file (below all dependencies)
`android/app/build.gradle`
```java
apply plugin: 'com.google.gms.google-services'
```

## 2) Link RNFirebase

To install `react-native-firebase` in your project, you'll need to import the package from `io.invertase.firebase` in your project's `android/app/src/main/java/com/[app name]/MainApplication.java` and list it as a package for ReactNative in the `getPackages()` function:

```java
package com.youcompany.application;
// ...
import io.invertase.firebase.RNFirebasePackage;
// ...
public class MainApplication extends Application implements ReactApplication {
    // ...

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNFirebasePackage()  // <-- Add this line
      );
    }
  };
  // ...
}
```
You'll also need to list it in our `android/app/build.gradle` file as a dependency that we want React Native to compile. In the `dependencies` listing, add the `compile` line:

```java
dependencies {
  compile project(':react-native-firebase')
}
```

Add the project path to `android/settings.gradle`:

```
include ':react-native-firebase'
project(':react-native-firebase').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-firebase/android')
```

## 3) Cloud Messaging (optional)

If you plan on using [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/), add the following to `android/app/src/main/AndroidManifest.xml`.

Add permissions:
```xml
<manifest ...>
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
  <uses-permission android:name="android.permission.VIBRATE" />
```

Set app [launch mode](https://inthecheesefactory.com/blog/understand-android-activity-launchmode/en) inside activity props:
```xml
<activity
  ...
  android:launchMode="singleTop"
>
```

Add messaging service:
```xml
<application ...>
  <service
    android:name="io.invertase.firebase.messaging.MessagingService"
    android:enabled="true"
    android:exported="true">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
  </service>
  <service android:name="io.invertase.firebase.messaging.InstanceIdService" android:exported="false">
    <intent-filter>
      <action android:name="com.google.firebase.INSTANCE_ID_EVENT"/>
    </intent-filter>
  </service>
```

If you would like to schedule local notifications then you also need to add the following:
```xml
  <receiver android:name="io.invertase.firebase.messaging.RNFirebaseLocalMessagingPublisher"/>
  <receiver android:enabled="true" android:exported="true" android:name="io.invertase.firebase.messaging.RNFirebaseSystemBootEventReceiver">
    <intent-filter>
      <action android:name="android.intent.action.BOOT_COMPLETED"/>
      <action android:name="android.intent.action.QUICKBOOT_POWERON"/>
      <action android:name="com.htc.intent.action.QUICKBOOT_POWERON"/>
      <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
  </receiver>
```

## 3) Performance Monitoring (optional)

If you'd like to take advantage of Firebases [Performance Monitoring](https://firebase.google.com/docs/perf-mon/), the following additions
 to your project setup are required:

In your projects `android/build.gradle` file, add the plugin to your dependencies:

```
dependencies {
  ...
  classpath 'com.google.firebase:firebase-plugins:1.1.0'
}
```

At the top of your `android/app/build.gradle` file, below other plugins, apply the `firebase-perf` plugin:
```
apply plugin: "com.android.application"
apply plugin: "com.google.firebase.firebase-perf"
```

In the same file, add the `firebase-perf` module to your dependencies:

```
dependencies {
  ...
  compile "com.google.firebase:firebase-perf:10.2.6"
}
```
