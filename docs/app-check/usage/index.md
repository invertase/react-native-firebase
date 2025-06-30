---
title: App Check
description: Installation and getting started with App Check.
icon: //static.invertase.io/assets/social/firebase-logo.png
next: /app-distribution/usage
previous: /analytics/screen-tracking
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app"
module, view the [Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the app-check module
yarn add @react-native-firebase/app-check

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

App Check requires you set the minimum iOS Deployment version in `ios/Podfile` to `11.0` or greater.

You may have Xcode compiler errors after including the App Check module, specifically referencing linker problems and missing directories.

You may find excluding the `i386` architecture via an addition to the `ios/Podfile` `post_install` hook like the below works:

```ruby
    installer.aggregate_targets.each do |aggregate_target|
      aggregate_target.user_project.native_targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['ONLY_ACTIVE_ARCH'] = 'NO'
          config.build_settings['EXCLUDED_ARCHS'] = 'i386'
        end
      end
      aggregate_target.user_project.save
    end
```

# What does it do

App Check works alongside other Firebase services to help protect your backend resources from abuse, such as billing fraud or phishing. With App Check, devices running your app will use an app or device attestation provider that attests to one or both of the following:

- Requests originate from your authentic app
- Requests originate from an authentic, untampered device

This attestation is attached to every request your app makes to your Firebase backend resources.

<Youtube id="Fjj4fmr2t04" />

This App Check module has built-in support for using the following services as attestation providers:

- DeviceCheck on iOS
- App Attest on iOS
- Play Integrity on Android (requires distribution from Play Store to successfully fetch tokens)
- SafetyNet on Android (deprecated)
- Debug providers on both platforms

App Check currently works with the following Firebase products:

- Realtime Database
- Cloud Firestore
- Cloud Storage
- Cloud Functions (callable functions)

The [official Firebase App Check documentation](https://firebase.google.com/docs/app-check) has more information, including about the iOS AppAttest provider, and testing/ CI integration, it is worth a read.

# Usage

## Register Firebase Apps

Before the App Check package can be used on iOS or Android, the corresponding App must be registered in the firebase console.

For instructions on how to generate required keys and register an app for the desired attestation provider, follow **Step 1** in these firebase guides:

- [Get started using App Check with DeviceCheck on Apple platforms](https://firebase.google.com/docs/app-check/ios/devicecheck-provider#project-setup)
- [Get started using App Check with App Attest on Apple platforms](https://firebase.google.com/docs/app-check/ios/app-attest-provider#project-setup)
- [Get started using App Check with Play Integrity on Android](https://firebase.google.com/docs/app-check/android/play-integrity-provider#project-setup)
- [Get started using App Check with SafetyNet on Android (deprecated)](https://firebase.google.com/docs/app-check/android/safetynet-provider#project-setup)

> Additionally, You can reference the iOS private key creation and registrations steps outlined in the [Cloud Messaging iOS Setup](/messaging/usage/ios-setup#linking-apns-with-fcm-ios).

## Initialize

> If you're using Expo Managed Workflow, you can load the `@react-native-firebase/app-check` config plugin to skip the Initialize setup step.

You must call initialize the AppCheck module prior to calling any firebase back-end services for App Check to function.

#### Configure AppCheck with iOS credentials (react-native 0.79+)

To do that, edit your `ios/ProjectName/AppDelegate.swift` and add the following two lines:

At the top of the file, import the FirebaseCore SDK right after `import UIKit`:
And within your existing `didFinishLaunchingWithOptions` method, add the following to the top of the method:

```diff
import UIKit
+ import RNFBAppCheck  // <-- This is the import for AppCheck to work
+ import FirebaseCore  // <-- From App/Core integration, no other Firebase items needed
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

...

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
+   RNFBAppCheckModule.sharedInstance()  // <-- new for AppCheck to work
+   FirebaseApp.configure()              // <-- From App/Core integration
```

#### Configure AppCheck with iOS credentials (react-native >= 0.77 && < 0.79)

To do that, edit your `ios/ProjectName/AppDelegate.swift` and add the following two lines:

At the top of the file, import the FirebaseCore SDK right after `import UIKit`:
And within your existing `didFinishLaunchingWithOptions` method, add the following to the top of the method:

```diff
import UIKit
+ import RNFBAppCheck  // <-- This is the import for AppCheck to work
+ import FirebaseCore  // <-- From App/Core integration, no other Firebase items needed
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
+   RNFBAppCheckModule.sharedInstance()  // <-- new for AppCheck to work
+   FirebaseApp.configure()              // <-- From App/Core integration
```

#### Configure Firebase with iOS credentials (react-native < 0.77)

To do that, edit your `ios/ProjectName/AppDelegate.mm` and add the following two lines:

```objectivec
#import "AppDelegate.h"
#import "RNFBAppCheckModule.h" // ⬅️ ADD THIS LINE
#import <Firebase.h>
...

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize RNFBAppCheckModule, it sets the custom RNFBAppCheckProviderFactory
  // which lets us configure any of the available native platform providers,
  // and reconfigure if needed, dynamically after `[FIRApp configure]` just like the other platforms.

  [RNFBAppCheckModule sharedInstance]; // ⬅️ ADD THIS LINE BEFORE [FIRApp configure]

  [FIRApp configure];

  ...
}

```

There are several differences between the web, Apple, and Android platform SDKs produced by Firebase, which react-native-firebase smooths over to give you a common, firebase-js-sdk compatible API.

How do we do this? We use the standard firebase-js-sdk v9 API `initializeAppCheck`, and take advantage of its parameters which allow the use of an `AppCheckOptions` argument that itself allows a `CustomProvider`.

It is through the use of a react-native-specific `ReactNativeFirebaseAppCheckProvider` that we can offer runtime configuration capability at the javascript level, including the ability to switch providers dynamically.

So AppCheck module initialization is done in two steps in react-native-firebase - first you create and configure the custom provider, then you initialize AppCheck using that custom provider.

### Configure a Custom Provider

To configure the react-native-firebase custom provider, first obtain one, then configure it according to the providers you want to use on each platform.

```javascript
import { ReactNativeFirebaseAppCheckProvider } from '@react-native-firebase/app-check';

const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
rnfbProvider.configure({
  android: {
    provider: __DEV__ ? 'debug' : 'playIntegrity',
    debugToken: 'some token you have configured for your project firebase web console',
  },
  apple: {
    provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
    debugToken: 'some token you have configured for your project firebase web console',
  },
  web: {
    provider: 'reCaptchaV3',
    siteKey: 'unknown',
  },
});
```

### Install the Custom Provider

Once you have the custom provider configured, install it in app-check using the firebase-js-sdk compatible API, while saving the returned instance for usage:

```javascript
import { getApp } from '@react-native-firebase/app';
import { initializeAppCheck } from '@react-native-firebase/app-check';

const appCheck = await initializeAppCheck(getApp(), {
  provider: rnfbProvider,
  isTokenAutoRefreshEnabled: true,
});
```

### Verify AppCheck was initialized correctly

After initializing the custom provider, you can verify AppCheck is working by logging a response from the token server:

```javascript
import { getToken } from '@react-native-firebase/app-check';

try {
  // `appCheckInstance` is the saved return value from initializeAppCheck
  const { token } = await appCheckInstance.getToken(true);

  if (token.length > 0) {
    console.log('AppCheck verification passed');
  }
} catch (error) {
  console.log('AppCheck verification failed');
}
```

## Automatic Data Collection

App Check has an "tokenAutoRefreshEnabled" setting. This may cause App Check to attempt a remote App Check token fetch prior to user consent. In certain scenarios, like those that exist in GDPR-compliant apps running for the first time, this may be unwanted.

You may configure this setting in `firebase.json` such that your desired configuration is in place even before you the react-native javascript bundle begins executing and allows for runtime configuration.

If unset, the "tokenAutoRefreshEnabled" setting will defer to the app's "automatic data collection" setting, which may be set in `firebase.json`, or if you wish directly in the Info.plist or AndroidManifest.xml according to the Firebase native SDK documentation. Unless otherwise configured, it will default to true implying there will be automatic data collection and app check token refresh attempts.

## Using App Check tokens for non-firebase services

The [official documentation](https://firebase.google.com/docs/app-check/web/custom-resource) shows how to use `getToken` to access the current App Check token and then verify it in external services.

## Manually Setting Up App Check Debug Token for Testing Environments / CI

### on iOS

The react-native-firebase CustomProvider implementation allows for runtime configuration of the `debug` provider as well as a `debugToken` in the `ios` CustomProvider options. This allows the easy use of a token pre-configured in the Firebase console, allowing for dynamic configuration and testing of AppCheck in CI environments or iOS Simulators.

### on Android

The react-native-firebase CustomProvider implementation allows for runtime configuration of the `debug` provider as well as a `debugToken` in the `android` CustomProvider options. This allows the easy use of a token pre-configured in the Firebase console, allowing for dynamic configuration and testing of AppCheck in CI environments or Android Emulators.

There are a variety of other ways to obtain and configure debug tokens for AppCheck testing, a few of which follow:

#### A) When testing on an actual android device (debug build)

1.  Start your application on the android device.
2.  Use `$adb logcat | grep DebugAppCheckProvider` to grab your temporary secret from the android logs. The output should look lit this:

        D DebugAppCheckProvider: Enter this debug secret into the allow list in
        the Firebase Console for your project: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

3.  In the [Project Settings > App Check](https://console.firebase.google.com/project/_/settings/appcheck) section of the Firebase console, choose _Manage debug tokens_ from your app's overflow menu. Then, register the debug token you logged in the previous step.

#### B) Specifying a generated `FIREBASE_APP_CHECK_DEBUG_TOKEN` -- building for CI/CD (debug build)

When you want to test using an Android virtual device -or- when you prefer to (re)use a token of your choice -- e.g. when configuring a CI/CD pipeline -- use the following steps:

1.  In the [Project Settings > App Check](https://console.firebase.google.com/project/_/settings/appcheck) section of the Firebase console, choose _Manage debug tokens_ from your app's overflow menu. Then, register a new debug token by clicking the _Add debug token_ button, then _Generate token_.
2.  Pass the token you created in the previous step by supplying a `FIREBASE_APP_CHECK_DEBUG_TOKEN` environment variable to the process that build your react-native android app. e.g.:

        FIREBASE_APP_CHECK_DEBUG_TOKEN="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" react-native run-android

Please note that once the android app has successfully passed the app-checks controls on the device, it will keep passing them, whether you rebuild without the secret token or not. To completely reset app-check, you must first uninstall, and then re-build / install.

#### C) When using Expo Development Client

When using expo-dev-client, the process is a little different, especially on an android emulator.

1. In the [Project Settings > App Check](https://console.firebase.google.com/project/_/settings/appcheck) section of the Firebase console, choose _Manage debug tokens_ from your app's overflow menu. Then, register a new debug token by clicking the _Add debug token_ button, then _Generate token_.
2. Pass the token you created in the previous step by supplying a `FIREBASE_APP_CHECK_DEBUG_TOKEN` environment variable in your eas.json development profile:

```json
{
  ...
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        ...
        "FIREBASE_APP_CHECK_DEBUG_TOKEN": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
      }
    },
    ...
  },
  ...
}
```

3.  Rebuild your development client:

        eas build --profile development --platform android
