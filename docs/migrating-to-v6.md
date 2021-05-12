---
title: Migrating to v6
description: Migrate to React Native Firebase v6
next: /faqs-and-tips
previous: /releases
---

# Introduction

This is a reference for upgrading from React Native Firebase v5.x.x to v6.x.x. Even though there is a lot to cover,
each module generally follows similar steps to migrate.

We highly recommend your project is using React Native 0.60+ before upgrading to take advantage of new features to make
the migration process much simpler.

> We highly recommend backing up your project before migrating!

If you're looking to start fresh, check out the [Getting Started](/) section of the documentation.

## Why you should migrate

React Native Firebase version 6 has been re-created from the ground up, with a heavy focus on testing, documentation & feature
compatibility with the Firebase SDKs. We've also been working closely with the Firebase team to ensure all module APIs have
been approved before being released.

We have also ensured the release is compatible with some of the popular tooling in the React Native community, such as
[autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md) & [TypeScript](https://facebook.github.io/react-native/blog/2018/05/07/using-typescript-with-react-native).

Version 6 also brings support for previously unsupported modules such as [Firebase ML](https://firebase.google.com/docs/ml).

## NPM dependency changes

Prior to version 6, all modules are installable from the `react-native-firebase` NPM package. With version 6 we are
now taking advantage of NPM organizations, allowing us to distribute each module as its own package. This has a number
of advantages such as smaller app bundle sizes (you only install what modules you need), and internally we treat each module
as its own package, allowing for easier testing and quality assurance. Every project must install the `@react-native-firebase/app`
module, replacing the `react-native-firebase` module.

## Removing `react-native-firebase`

There are a number of steps to carry out to remove the `react-native-firebase` module from your existing app. To help make this process
easier, we'll break out the process into 3 sections:

- [Removing v5 from JavaScript](#removing-v5-from-javascript)
- [Removing v5 from Android](#removing-v5-from-android)
- [Removing v5 from iOS](#removing-v5-from-ios)

---

### Removing v5 from JavaScript

As mentioned above, we need to remove the `react-native-firebase` NPM module from our project. To do this, open your projects
`package.json` file and remove the dependency:

```diff
{
  "dependencies": {
    "react": "16.8.3",
    "react-native": "0.59.9",
-   "react-native-firebase": "^5.5.4"
  }
}
```

To remove the package from your local environment, delete the `yarn.lock`/`package-lock.json` files and reinstall
the project dependencies with `yarn`.

---

### Removing v5 from Android

Removing version 5 from your native Android code is a more involved process. We'll go file by file to ensure all references
to the older version have been removed.

#### Removing from Gradle Settings

Open up your projects `/android/settings.gradle` file. There will be 2 lines which need to be removed:

```diff
rootProject.name = 'AwesomeApp'
- include ':react-native-firebase'
- project(':react-native-firebase').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-firebase/android')

include ':app'
```

#### Removing from Android Manifest

Open your _AndroidManifest.xml_ file. You will need to remove any references to the `io.invertase.firebase.messaging` class

```diff
- <service android:name="io.invertase.firebase.messaging.RNFirebaseMessagingService">
-   <intent-filter>
-     <action android:name="com.google.firebase.MESSAGING_EVENT" />
-   </intent-filter>
- </service>
```

#### Removing native dependencies

We now need to remove the RNFirebase and Firebase dependencies from your project.
In version 6, these are automatically installed for us.

Open your projects `/android/app/build.gradle` file. First remove the `react-native-firebase` dependency:

```diff
dependencies {
-   implementation project(path: ':react-native-firebase')
}
```

Next, remove the `firebase-core` and `play-services-base` dependencies. Note, other modules you are using may
required `play-services-base` to be installed.

_Specific versions listed may be different than your own project_

```diff
dependencies {
-   implementation "com.google.firebase:firebase-core:16.0.9"
-   implementation "com.google.android.gms:play-services-base:16.1.0"
}
```

Next we need to remove the module specific Firebase dependencies. The naming convention for these modules is:
`implementation "com.google.firebase:firebase-<< module >>:<<version>>"`.

For example, to remove the native Firebase dependency for the Authentication module:

```diff
dependencies {
-   implementation "com.google.firebase:firebase-auth:17.0.0"
}
```

#### Removing the React Native Firebase packages

We now need to remove the React Native Firebase packages from being added to our React Native application. Go ahead and open
the `/android/app/src/main/java/<< app name >>/MainApplication.java` file.

First, we need to remove the core `RNFirebasePackage` from the imports and being added to the package list:

```diff
-   import io.invertase.firebase.RNFirebasePackage;
```

```diff
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
-       new RNFirebasePackage(),
```

Depending on what modules you installed using version 5, remove the packages for each module. For example, to remove the
Authentication package:

```diff
-   import io.invertase.firebase.auth.RNFirebaseAuthPackage;
```

```diff
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
-       new RNFirebaseAuthPackage(),
```

#### Cleaning Gradle

Android caches module dependencies for quicker builds. As we've heavily modified our project dependencies it's recommended you
clean Gradle, allowing for a fresh installation. In your project, execute the following commands:

```bash
$ cd android/
$ ./gradlew clean
```

---

### Removing v5 from iOS

The following steps assume you have used CocoaPods to manage your projects iOS dependencies.

#### Remove the RNFirebase Pod

Remove the `RNFirebase` pod from your `/ios/Podfile`:

```diff
target 'AwesomeApp' do
-   pod 'RNFirebase', :path => '../node_modules/react-native-firebase/ios'
```

#### Remove the Firebase Core Pod

The `Firebase/Core` need to be removed from the project. In version 6, this is automatically installed. Open the
`/ios/Podfile` and remove the Pod:

```diff
target 'AwesomeApp' do
-   pod 'Firebase/Core', '~> 6.3.0'
```

#### Remove module specific Pods

Depending on what modules you were using with version 5, we now need to remove the Firebase Pods. For example, if you
are using the Authentication module, remove the `Firebase/Auth` Pod:

```diff
target 'AwesomeApp' do
-   pod 'Firebase/Auth', '~> 6.3.0'
```

### Re-installing Pods

Once the Pod dependencies have been removed, the following commands will remove the Pods from your local project:

```bash
$ cd ios
$ rm -rf Podfile.lock
$ pod install
```

---

## Installing `@react-native-firebase/app`

As mentioned earlier, version 6 uses the `@react-native-firebase` NPM organization for each module. Every app using
version 6 must install the `app` module before installing each specific module.

To get started, install the new dependency with [Yarn](https://yarnpkg.com/lang/en/):

```bash
yarn add @react-native-firebase/app
```

If you are using React Native 0.60+, the module will be automatically linked via [autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md).

Users on an older version of React Native must manually link the `app` module. See the following steps for [Android](/install-android) and
[iOS](/install-ios) for more information on manual linking.

## Specific module installation

Depending on which Firebase service your app uses, you now need to install the NPM packages for each service. For example,
apps using the Authentication module need to install the `auth` package:

```bash
yarn add @react-native-firebase/auth
```

Install the modules required for your application:

| Module                                                       | NPM Package                             |
| ------------------------------------------------------------ | --------------------------------------- |
| <Anchor href="v6/admob">AdMob</Anchor>                       | @react-native-firebase/admob            |
| <Anchor href="v6/analytics">Analytics</Anchor>               | @react-native-firebase/analytics        |
| <Anchor href="v6/app">App</Anchor>                           | @react-native-firebase/app              |
| <Anchor href="v6/invites">App Invites</Anchor>               | @react-native-firebase/invites          |
| <Anchor href="v6/auth">Authentication</Anchor>               | @react-native-firebase/auth             |
| <Anchor href="v6/firestore">Cloud Firestore</Anchor>         | @react-native-firebase/firestore        |
| <Anchor href="v6/functions">Cloud Functions</Anchor>         | @react-native-firebase/functions        |
| <Anchor href="v6/messaging">Cloud Messaging</Anchor>         | @react-native-firebase/messaging        |
| <Anchor href="v6/storage">Cloud Storage</Anchor>             | @react-native-firebase/storage          |
| <Anchor href="v6/crashlytics">Crashlytics</Anchor>           | @react-native-firebase/crashlytics      |
| <Anchor href="v6/links">Dynamic Links</Anchor>               | @react-native-firebase/dynamic-links    |
| <Anchor href="v6/in-app-messaging">In-app Messaging</Anchor> | @react-native-firebase/in-app-messaging |
| <Anchor href="v6/iid">Instance ID</Anchor>                   | @react-native-firebase/iid              |
| <Anchor href="v6/ml">ML</Anchor>                             | @react-native-firebase/ml               |
| <Anchor href="v6/perf">Performance Monitoring</Anchor>       | @react-native-firebase/perf             |
| <Anchor href="v6/database">Realtime Database</Anchor>        | @react-native-firebase/database         |
| <Anchor href="v6/remote-config">Remote Config</Anchor>       | @react-native-firebase/remote-config    |

Users on React Native version 0.60+, the modules will be automatically linked. For users on a lower version,
see the module specific pages for manual installation guides.

## Updating project code

In versions prior to 6, accessing the React Native Firebase package was carried out by importing the `react-native-firebase`
module, for example:

```js
import firebase from 'react-native-firebase';

// App code...
const user = firebase.auth().currentUser;
```

Although it is possible to access specific module functionality from the package imports, if you're coming from v5 the
following usage may seem daunting for a large project:

```js
import auth from '@react-native-firebase/auth';

// App code...
const user = auth().currentUser;
```

Fortunately, it is possible to continue to migrate to the previous versions import method:

Find and replace all usages of the import with the new import:

```diff
- import firebase from 'react-native-firebase';
+ import firebase from '@react-native-firebase/app';
```

We now need to import additional packages inside of an entry point file of our project, for example
to import the Authentication module, add the following to your projects `/App.js` file (or entry file):

```js
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';

// App code
const user = firebase.auth().currentUser;
```

This only needs to be done once. The `auth` module will now be available on all `firebase` instances.

---

## Module Breaking Changes

Below outlines a list of breaking changes for each module which may impact your application. Please ensure all
app functionality is tested once migrated to version 6 is complete.

### App

`@react-native-firebase/app`

- `onReady()` removed: Users initializing a secondary app via `app.initializeApp` will need to now remove the `onReady`
  listener. Instead, `initializeApp` resolves a promise once the secondary app has finished initializing.
- Initializing the `[DEFAULT]` app manually will now throw an error. Previously this only displayed a warning.

### AdMob

`@react-native-firebase/admob`

The AdMob module has undergone a full re-write to support a new, cleaner API and regulation changes (such as GDPR).
Please see the <Anchor href="/admob">AdMob</Anchor> documentation and update your code usage.

- `RewardedVideo` has now been deprecated in favor of a new native API. Please see `RewardedAd` for more information.

### Invites

The `invites` module has now been deprecated. Please see the official [Firebase documentation](https://firebase.google.com/docs/invites/deprecation)
for more information.

The recommended approach for handling this deprecation is to use the Dynamic Links module.

### Analytics

`@react-native-firebase/analytics`

- All methods now return a `Promise`. Previously these were 'fire and forget'.

### Crashlytics

`@react-native-firebase/crashlytics`

- `setBoolValue`, `setFloatValue`, `setIntValue` & `setStringValue` have been removed and replaced with two new methods (the Crashlytics SDK converted all these into strings internally anyway):
  - `setAttribute(key: string, value: string): Promise<null>` - set a singular key value to show alongside any subsequent crash reports
  - `setAttributes(values: { [key: string]: string }): Promise<null>` - set multiple key values to show alongside any subsequent crash reports
- All methods except `crash`, `log` & `recordError` now return a Promise that resolve when complete.
- `recordError` now accepts a JavaScript `Error` instead of a code and message.
- `setUserIdentifier()` has been renamed to `setUserId()` to match the Analytics Web SDK implementation.
- `enableCrashlyticsCollection()` has been renamed to `setCrashlyticsCollectionEnabled()`.

### Firestore

`@react-native-firebase/firestore`

- The `Blob` class can no longer be manually constructed.
- All user code is now validated in `JavaScript`. Passing incorrect data or querying chaining will now throw a JavaScript error. Ensure all queries are thoroughly tested.
  - The `Query` class has undergone a rewrite. Previously some invalid queries could be passed to the native SDKs causing a crash, these are now validated in JavaScript.
- The where equal operator `=` has been deprecated. Please use `==`.
- The setting `setTimestampsInSnapshotsEnabled` has been deprecated.

### Dynamic Links

`@react-native-firebase/dynamic-links`

- Module usage has been renamed from `links()` to `dynamicLinks()`.
- The `onLink` and `getInitialLink` methods now return a `DynamicLink` object, rather than the string URL.
- The _builder_ syntax has been deprecated in favor of simple objects. See `buildLink()` documentation for an example.
- Added extra validation. Building a dynamic link with platform specific options will now error if not all required parameters are set.

### Functions

`@react-native-firebase/functions`

No breaking changes.

### In-App Messaging

`@react-native-firebase/in-app-messaging`

This is a new module. See documentation for usage.

### Instance ID

`@react-native-firebase/iid`

No breaking changes.

### Notifications

Device-local notification APIs are not actually Firebase APIs at the same time they are very difficult to maintain.

For these reasons the notifications package has been removed from react-native-firebase for versions 6 and higher.

How to migrate: If you use device-local notification APIs and user-visible notifications in your app you will want to integrate a separate library that gives you access to device-local notification APIs. Many people have reported success with each of https://notifee.app, https://wix.github.io/react-native-notifications and https://github.com/zo0r/react-native-push-notification

### Cloud Messaging

`@react-native-firebase/messaging`

- [android] The manually added `RNFirebaseMessagingService` service in your `AndroidManifest.xml` file is no longer required - you can safely remove it.
- [iOS] The manually added `RNFirebaseMessaging` usages in your `AppDelegate` files are no longer required - you can safely remove them.
- The _builder_ syntax has been deprecated in favor of simple objects. See `newRemoteMessage()` documentation for an example.
- `subscribeToTopic('some-topic')` method must not include "/" in topic.
- [iOS] The minimum supported iOS version is now 10
- iOS 9 or lower only accounts for 0.% of all iPhone devices.
- To see a detailed device versions breakdown see [this link](https://david-smith.org/iosversionstats/).
- Community contributions that add iOS 9 support are welcome.

### Performance Monitoring

`@react-native-firebase/perf`

- All `Trace` & `HttpMetric` methods (except for `start` & `stop`) are now synchronous and no longer return a Promise,
  extra attributes/metrics now only get sent to native when you call stop.
- `firebase.perf.Trace.incrementMetric` will now create a metric if it could not be found.
- `firebase.perf.Trace.getMetric` will now return 0 if a metric could not be found.

### Realtime Database

`@react-native-firebase/database`

- The `Reference` class has undergone a rewrite. In previous versions, chaining invalid methods together on a query was possible. In version 6, the functionality now replicates the Firebase Web SDK.
  - Please thoroughly test your database queries.
- Internal JavaScript validation has been added and will throw a JavaScript error if methods are called with incorrect parameters.
- All query based modifiers are now validated as per the Web SDK spec. In v5 it is possible to chain queries which are not allowed together causing native errors (e.g. `.orderByKey().orderByPriority()`, `.startAt('foo', 'bar').orderByKey()` etc). Doing so in v6 will now throw an error to keep it in-line with the Web SDK.
- `Reference.push` now correctly mimics the Web SDK, returning a thenable reference.

### Remote Config

`@react-native-firebase/remote-config`

- Module namespace has been renamed to `.remoteConfig()` from `.config()`.
- All Remote Config values can now be accessed synchronously in JS, see `getValue(key: string): ConfigValue` & `getAll(): ConfigValues` below.
  - These replace all the original async methods: `getValue`, `getValues`, `getKeysByPrefix`.
- `setDefaultsFromResource` now returns a Promise that resolves when completed, this will reject with code `config/resouce_not_found` if the file could not be found.
- `setDefaultsFromResource` now expects a resource file name for Android to match iOS, formerly this required a resource id (something you would not have in RN as this was generated at build time by Android).
  - An example for both platforms can be found in the tests.
- `enableDeveloperMode` has been removed, you can now use `setConfigSettings({ isDeveloperModeEnabled: boolean })` instead.
- `setDefaults` now returns a Promise that resolves when completed.

### Cloud Storage

`@react-native-firebase/storage`

- Removed formerly deprecated `UploadTaskSnapshot.downloadUrl` property, use `StorageReference.getDownloadURL(): Promise<string>` instead.
- `StorageReference.downloadFile()` is now deprecated and will be removed in a later release, please rename usages of this to `writeToFile()` - renamed to match Native SDKs.
- `firebase.storage.Native` has moved to `firebase.utils.Native`.
- `firebase.utils.Native` is now deprecated and will be removed in a later release, please rename usages of this to `firebase.utils.FilePath`.
- `firebase.utils.Native.*` some properties have been renamed and deprecated and will be removed in a later release, follow the in-app console warnings on how to migrate.

### ML

`@react-native-firebase/ml`

This is a new module. See documentation for usage.
