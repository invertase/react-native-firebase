# Migration

## From v2 to v3

The below is a quick summary of steps to take when migrating from v2 to v3 of RNFirebase. Please see the [v3 change log](https://github.com/invertase/react-native-firebase/releases/tag/v3.0.0) for detailed changes.

** Please note, we're now using `Apache License 2.0` to license this library. **

##### 1) Install the latest version of RNFirebase:
> `npm i react-native-firebase@latest --save`




##### 2) Upgrade react-native version (only if you're currently lower than v0.48):

- Follow the instructions [here](https://facebook.github.io/react-native/docs/upgrading.html)




##### 3) Update your code to reflect deprecations/breaking changes if needed:

- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) **[breaking]** [database] enabling database persistence (setPersistence) via JS is no longer supported - this is to prevent several race conditions. See sub points on how to enable these natively.
  - [android] add `FirebaseDatabase.getInstance().setPersistenceEnabled(true);` to your `MainActivity` `onCreate` method.
  - [ios]  add `[FIRDatabase database].persistenceEnabled = YES;` after the `[FIRApp configure];` line  inside your `AppDelegate` `didFinishLaunchingWithOptions` method.
- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) **[breaking]** [app] `new RNFirebase()` is no longer supported. See below for information about app initialisation.
- ![#f03c15](https://placehold.it/15/fdfd96/000000?text=+) **[deprecated]** [app] `initializeApp()` for apps that are already initialised natively (i.e. the default app initialised via google-services plist/json) will now log a deprecation warning.
  - As these apps are already initialised natively there's no need to call `initializeApp` in your JS code. For now, calling it will just return the app that's already internally initialised - in a future version this will throw an `already initialized` exception.
  - Accessing apps can now be done the same way as the web sdk, simply call `firebase.app()` to get the default app, or with the name of specific app as the first arg, e.g. `const meow = firebase.app('catsApp');` to get a specific app.
- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) **[breaking]** [auth] Third party providers now user `providerId` rather than `provider` as per the Web SDK.  If you are manually creating your credentials, you will need to update the field name.
- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) **[breaking]** [database] Error messages and codes internally re-written to match the web sdk
- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) **[breaking]** [database] `ref.isEqual` now checks the query modifiers as well as the ref path (was just path before). With the release of multi apps/core support this check now also includes whether the refs are for the same app.
- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) **[breaking]** [database] on/off behaviour changes. Previous `off` behaviour was incorrect. A `SyncTree/Repo` implementation was added to provide the correct behaviour you'd expect in the web sdk. Whilst this is a breaking change it shouldn't be much of an issue if you've previously setup your on/off handling correctly. See #160 for specifics of this change.
- ![#f03c15](https://placehold.it/15/f03c15/000000?text=+) **[breaking]** [storage] UploadTaskSnapshot -> `downloadUrl` renamed to `downloadURL` to match web sdk



##### 4) Android - Update `android/build.gradle`:


- Check you are using google-services 3.1.0 or greater:
- You must add `maven { url 'https://maven.google.com' }` to your `android/build.gradle` as follows:

```groovy
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:2.2.3'
        classpath 'com.google.gms:google-services:3.1.0' // CHECK VERSION HERE

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        mavenLocal()
        jcenter()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
        // -------------------------------------------------
        // Add this below the existing maven property above
        // -------------------------------------------------
        maven {
            url 'https://maven.google.com'
        }
    }
}
```





##### 5) Android - Update `app/build.gradle`:


- You must update all your Firebase & play services dependencies to 11.4.2.



##### 6) iOS - Update podfile:

- You need to check that you're running at least version 4.3.0 of the Firebase Pods
  - Run `pod outdated`
  - Run `pod update`

Add the `Firebase/Firestore` if you plan on using firestore.

## From v1 to v2

See the guide on the [v2 docs](/v2/migration-guide?id=migration)
