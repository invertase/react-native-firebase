# Android Installation

The simplest way of installing on Android is to use the react-native link CLI command & rebuild the project:

```
react-native link react-native-firebase
```

## Manually

To install `react-native-firebase` manually in our project, we'll need to import the package from `io.invertase.firebase` in our project's `android/app/src/main/java/com/[app name]/MainApplication.java` and list it as a package for ReactNative in the `getPackages()` function:

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

We'll also need to list it in our `android/app/build.gradle` file as a dependency that we want React Native to compile. In the `dependencies` listing, add the `compile` line:

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

If you plan on using [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/), add the following to `android/app/src/main/AndroidManifest.xml`.

Add permissions:
```
<manifest ...>
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
  <uses-permission android:name="android.permission.VIBRATE" />
```

Set app [launch mode](https://inthecheesefactory.com/blog/understand-android-activity-launchmode/en) inside application props:
```
<application
  ...
  android:launchMode="singleTop"
>
```

Add messaging service:
```
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
