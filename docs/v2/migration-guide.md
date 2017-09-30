# Migration

## From v1 to v2

The below is a quick summary of steps to take when migrating from v1 to v2 of RNFirebase. Please see the [v2 change log](https://github.com/invertase/react-native-firebase/releases/tag/v2.0.0) for detailed changes.

##### 1) Install the latest version of RNFirebase:
> `npm i react-native-firebase@latest --save`




##### 2) Upgrade react-native version (only if you're currently lower than v0.40):

> For example: `npm i react-native@0.44.0 react@16.0.0-alpha.6 --save`




##### 3) Update your JS code to reflect deprecations/breaking changes:



- [deprecated] providerId should now be used instead of provider whilst obtaining auth credentials. The latter will be removed in future releases.
- [deprecated] Deprecated User.getToken in favour of User.getIdToken.
- [breaking] User.reauthenticate has been removed in favour of User.reauthenticateWithCredential.
- [breaking] User.link has been removed in favour of User.linkWithCredential.
- [breaking] Removed unnecessary didReceiveNotificationResponse and willPresentNotification methods for iOS messaging. Added additional didReceiveRemoteNotification method.
- [breaking] firebase.messaging().onTokenRefresh and firebase.messaging().onMessage return a function to unsubscribe as per the Web SDK spec: https://firebase.google.com/docs/reference/js/firebase.messaging.Messaging#onMessage. Previously they returned an object with a .remove() method.






##### 4) Android - Update `android/build.gradle`:


The latest google-services version needs to be used:

```groovy
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:2.2.3'
        classpath 'com.google.gms:google-services:3.0.0'
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```





##### 5) Android - Update `app/build.gradle`:


All firebase modules are now optional so you only need to import the Firebase functionality that you require in your application.

You need to make a couple of changes to your `app/build.gradle` file.  Update the react-native-firebase compile statement to read:

```groovy
compile(project(':react-native-firebase')) {
  transitive = false
}
compile "com.google.firebase:firebase-core:11.0.4"

// If you are receiving Google Play API availability issues, add the following dependency
compile "com.google.android.gms:play-services-base:11.0.4"
```
Add each of the firebase modules you need from the following list:
```groovy
compile "com.google.firebase:firebase-ads:11.0.4"
compile "com.google.firebase:firebase-auth:11.0.4"
compile "com.google.firebase:firebase-config:11.0.4"
compile "com.google.firebase:firebase-crash:11.0.4"
compile "com.google.firebase:firebase-database:11.0.4"
compile "com.google.firebase:firebase-messaging:11.0.4"
compile "com.google.firebase:firebase-perf:11.0.4"
compile "com.google.firebase:firebase-storage:11.0.4"
```





##### 6) Android - Update `MainApplication.java`:



Update `MainApplication.java` and import the modules you require / currently use:

```java
// Required package
import io.invertase.firebase.RNFirebasePackage; // <-- Keep this line
// Optional packages - add as appropriate
import io.invertase.firebase.admob.RNFirebaseAdMobPackage; // Firebase AdMob
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // Firebase Analytics
import io.invertase.firebase.auth.RNFirebaseAuthPackage; // Firebase Auth
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage; // Firebase Remote Config
import io.invertase.firebase.crash.RNFirebaseCrashPackage; // Firebase Crash Reporting
import io.invertase.firebase.database.RNFirebaseDatabasePackage; // Firebase Realtime Database
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; // Firebase Cloud Messaging
import io.invertase.firebase.perf.RNFirebasePerformancePackage; // Firebase Performance Monitoring
import io.invertase.firebase.storage.RNFirebaseStoragePackage; // Firebase Storage
```
Add the packages to the `getPackages()` method as required:
```java
@Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNFirebasePackage(), // <-- Keep this line
          // Add these packages as appropriate
          new RNFirebaseAdMobPackage(),
          new RNFirebaseAnalyticsPackage(),
          new RNFirebaseAuthPackage(),
          new RNFirebaseRemoteConfigPackage(),
          new RNFirebaseCrashPackage(),
          new RNFirebaseDatabasePackage(),
          new RNFirebaseMessagingPackage(),
          new RNFirebasePerformancePackage(),
          new RNFirebaseStoragePackage()
      );
    }
```





##### 7) iOS - Update podfile:

First, delete your `Podfile.lock` file, and after making any changes from the below re-run `pod install` in your ios directory.

As all firebase modules are now optional you only need to import the Firebase functionality that you require in your application.  Simply update your Podfile to only include the Firebase modules for functionality that you require in your app.

For example if you only use Auth and Storage in your app then your podfile would look like the below:

```ruby
install! 'cocoapods', :deterministic_uuids => false
# Uncomment this line to define a global platform for your project
# platform :ios, '9.0'

target 'ReactNativeFirebaseDemo' do
  platform :ios, '8.0'
  # Uncomment this line if you're using Swift or would like to use dynamic frameworks
  # use_frameworks!

  react_native_path = "../node_modules/react-native"
  pod "Yoga", :path => "#{react_native_path}/ReactCommon/yoga"
  pod 'React', :path => '#{react_native_path}', :subspecs => [
    'BatchedBridge', # Required For React Native 0.45.0+
    'Core',
    # Add any other subspecs you want to use in your project
    # ...
  ]

  # Core is always required
  pod 'Firebase/Core'

  # Optional modules
  pod 'Firebase/Auth'
  pod 'Firebase/Storage'

  pod 'RNFirebase', :path => '../node_modules/react-native-firebase'
end
```
