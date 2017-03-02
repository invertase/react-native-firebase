# Android Installation

The simplest way of installing on Android is to use React Native linker:

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

Add to `AndroidManifest.xml` file
```diff
  <activity android:name="com.facebook.react.devsupport.DevSettingsActivity" />
+   <service android:name="io.invertase.firebase.RNFirebaseMessagingService">
+     <intent-filter>
+       <action android:name="com.google.firebase.MESSAGING_EVENT"/>
+     </intent-filter>
+   </service>

+   <service android:name="io.invertase.firebase.RNFirebaseInstanceIdService" android:exported="false">
+     <intent-filter>
+       <action android:name="com.google.firebase.INSTANCE_ID_EVENT"/>
+     </intent-filter>
+   </service>
```
