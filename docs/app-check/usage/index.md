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
- SafetyNet on Android

App Check currently works with the following Firebase products:

- Realtime Database
- Cloud Storage
- Cloud Functions (callable functions)

The [official Firebase App Check documentation](https://firebase.google.com/docs/app-check) has more information, including about the iOS AppAttest provider, and testing/ CI integration, it is worth a read.

# Usage

## Activate

On iOS if you include the App Check package, it is activated by default. The only configuration possible is the token auto refresh. When you call activate, the provider (DeviceCheck by default) stays the same but the token auto refresh setting will be changed based on the argument provided.

On Android, App Check is not activated until you call the activate method. The provider is not configurable here either but if your app is "debuggable", then the Debug app check provider will be installed, otherwise the SafetyNet provider will be installed.

You must call activate prior to calling any firebase back-end services for App Check to function.

## Automatic Data Collection

App Check has an "tokenAutoRefreshEnabled" setting. This may cause App Check to attempt a remote App Check token fetch prior to user consent. In certain scenarios, like those that exist in GDPR-compliant apps running for the first time, this may be unwanted.

If unset, the "tokenAutoRefreshEnabled" setting will defer to the app's "automatic data collection" setting, which may be set in the Info.plist or AndroidManifest.xml

## Using App Check tokens for non-firebase services

The [official documentation](https://firebase.google.com/docs/app-check/web/custom-resource) shows how to use `getToken` to access the current App Check token and then verify it in external services.

## Testing Environments / CI

App Check may be used in CI environments by following the upstream documentation to configure a debug token shared with your app in the CI environment.

In certain react-native testing scenarios it may be difficult to access the shared secret, but the react-native-firebase testing app for e2e testing does successfully fetch App Check tokens via:

- including the App Check debug test helper in the test app, along with a change to `DetoxTest` for Android
- by setting an environment variable and initializing the debug provider before firebase configure in `AppDelegate.m` for iOS.
